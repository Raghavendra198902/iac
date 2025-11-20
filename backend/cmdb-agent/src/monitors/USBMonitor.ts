/**
 * USB Device Monitor
 * Tracks USB device connections and disconnections across Windows and Linux
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface USBDevice {
  id: string;
  vendorId: string;
  productId: string;
  vendor: string;
  product: string;
  serialNumber?: string;
  deviceClass: string;
  timestamp: Date;
}

export interface USBEvent {
  type: 'usb_connected' | 'usb_disconnected';
  device: USBDevice;
  timestamp: Date;
}

export class USBMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private knownDevices: Map<string, USBDevice> = new Map();
  private readonly POLL_INTERVAL_MS = 5000; // Check every 5 seconds

  constructor() {
    super();
  }

  /**
   * Start monitoring USB devices
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('USB monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting USB device monitor', { platform: os.platform() });

    // Initial scan
    await this.scanDevices();

    // Start polling
    this.pollInterval = setInterval(() => {
      this.scanDevices().catch((error) => {
        logger.error('USB scan error', { error: error.message });
      });
    }, this.POLL_INTERVAL_MS);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    logger.info('USB monitor stopped');
  }

  /**
   * Scan for USB devices and detect changes
   */
  private async scanDevices(): Promise<void> {
    try {
      const devices = await this.getUSBDevices();
      const currentDeviceIds = new Set(devices.map(d => d.id));
      const previousDeviceIds = new Set(this.knownDevices.keys());

      // Detect new devices (connected)
      for (const device of devices) {
        if (!previousDeviceIds.has(device.id)) {
          this.knownDevices.set(device.id, device);
          
          const event: USBEvent = {
            type: 'usb_connected',
            device,
            timestamp: new Date(),
          };

          logger.info('USB device connected', {
            deviceId: device.id,
            vendor: device.vendor,
            product: device.product,
          });

          this.emit('usb_event', event);
        }
      }

      // Detect removed devices (disconnected)
      for (const [deviceId, device] of this.knownDevices.entries()) {
        if (!currentDeviceIds.has(deviceId)) {
          this.knownDevices.delete(deviceId);

          const event: USBEvent = {
            type: 'usb_disconnected',
            device,
            timestamp: new Date(),
          };

          logger.info('USB device disconnected', {
            deviceId: device.id,
            vendor: device.vendor,
            product: device.product,
          });

          this.emit('usb_event', event);
        }
      }
    } catch (error: any) {
      logger.error('Failed to scan USB devices', { error: error.message });
    }
  }

  /**
   * Get list of USB devices (platform-specific)
   */
  private async getUSBDevices(): Promise<USBDevice[]> {
    const platform = os.platform();

    switch (platform) {
      case 'linux':
        return this.getLinuxUSBDevices();
      case 'win32':
        return this.getWindowsUSBDevices();
      case 'darwin':
        return this.getMacUSBDevices();
      default:
        logger.warn('USB monitoring not supported on this platform', { platform });
        return [];
    }
  }

  /**
   * Get USB devices on Linux using lsusb
   */
  private async getLinuxUSBDevices(): Promise<USBDevice[]> {
    try {
      const { stdout } = await execAsync('lsusb');
      const devices: USBDevice[] = [];

      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Format: Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
        const match = line.match(/Bus (\d+) Device (\d+): ID ([0-9a-f]+):([0-9a-f]+)\s+(.+)/i);
        
        if (match) {
          const [, bus, device, vendorId, productId, description] = match;
          const parts = description.split(' ', 2);
          const vendor = parts[0] || 'Unknown';
          const product = parts[1] || description;

          devices.push({
            id: `${bus}-${device}`,
            vendorId: vendorId.toUpperCase(),
            productId: productId.toUpperCase(),
            vendor,
            product,
            deviceClass: 'USB',
            timestamp: new Date(),
          });
        }
      }

      return devices;
    } catch (error: any) {
      logger.error('Failed to get Linux USB devices', { error: error.message });
      return [];
    }
  }

  /**
   * Get USB devices on Windows using PowerShell
   */
  private async getWindowsUSBDevices(): Promise<USBDevice[]> {
    try {
      const script = `
        Get-PnpDevice -Class USB | Where-Object {$_.Status -eq "OK"} | ForEach-Object {
          $device = $_
          $hwid = $device.HardwareID
          if ($hwid -match "VID_([0-9A-F]+)&PID_([0-9A-F]+)") {
            $vid = $matches[1]
            $pid = $matches[2]
            "$($device.InstanceId)|$vid|$pid|$($device.FriendlyName)"
          }
        }
      `.replace(/\n/g, ' ');

      const { stdout } = await execAsync(`powershell -Command "${script}"`);
      const devices: USBDevice[] = [];

      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const parts = line.trim().split('|');
        if (parts.length >= 4) {
          const [instanceId, vendorId, productId, friendlyName] = parts;

          devices.push({
            id: instanceId,
            vendorId: vendorId.toUpperCase(),
            productId: productId.toUpperCase(),
            vendor: 'USB Device',
            product: friendlyName,
            deviceClass: 'USB',
            timestamp: new Date(),
          });
        }
      }

      return devices;
    } catch (error: any) {
      logger.error('Failed to get Windows USB devices', { error: error.message });
      return [];
    }
  }

  /**
   * Get USB devices on macOS using system_profiler
   */
  private async getMacUSBDevices(): Promise<USBDevice[]> {
    try {
      const { stdout } = await execAsync('system_profiler SPUSBDataType -json');
      const data = JSON.parse(stdout);
      const devices: USBDevice[] = [];

      const extractDevices = (items: any[]): void => {
        for (const item of items) {
          if (item.vendor_id && item.product_id) {
            devices.push({
              id: item.serial_num || `${item.vendor_id}-${item.product_id}`,
              vendorId: item.vendor_id.replace('0x', '').toUpperCase(),
              productId: item.product_id.replace('0x', '').toUpperCase(),
              vendor: item.manufacturer || 'Unknown',
              product: item._name || 'Unknown Device',
              serialNumber: item.serial_num,
              deviceClass: 'USB',
              timestamp: new Date(),
            });
          }

          if (item._items) {
            extractDevices(item._items);
          }
        }
      };

      if (data.SPUSBDataType) {
        extractDevices(data.SPUSBDataType);
      }

      return devices;
    } catch (error: any) {
      logger.error('Failed to get macOS USB devices', { error: error.message });
      return [];
    }
  }

  /**
   * Get current device count
   */
  getDeviceCount(): number {
    return this.knownDevices.size;
  }

  /**
   * Get all known devices
   */
  getDevices(): USBDevice[] {
    return Array.from(this.knownDevices.values());
  }

  /**
   * Check if a specific device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    return this.knownDevices.has(deviceId);
  }
}
