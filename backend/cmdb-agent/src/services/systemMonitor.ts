import si from 'systeminformation';
import os from 'os';
import logger from '../utils/logger';
import { SystemMetrics, DiscoveredResource } from '../types';

export class SystemMonitor {
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const [cpu, mem, disk, networkInterfaces] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkInterfaces(),
      ]);

      const metrics: SystemMetrics = {
        cpu: {
          usage: Math.round(cpu.currentLoad),
          cores: cpu.cpus.length,
          model: (cpu.cpus[0] as any)?.model || 'Unknown',
        },
        memory: {
          total: mem.total,
          used: mem.used,
          free: mem.free,
          usagePercent: Math.round((mem.used / mem.total) * 100),
        },
        disk: {
          total: disk[0]?.size || 0,
          used: disk[0]?.used || 0,
          free: disk[0]?.available || 0,
          usagePercent: Math.round(disk[0]?.use || 0),
        },
        network: {
          interfaces: networkInterfaces
            .filter((iface) => !iface.internal)
            .map((iface) => ({
              name: iface.iface,
              ip4: iface.ip4 || '',
              mac: iface.mac || '',
              speed: iface.speed || 0,
            })),
        },
        uptime: os.uptime(),
        timestamp: new Date().toISOString(),
      };

      return metrics;
    } catch (error) {
      logger.error('Failed to get system metrics', { error });
      throw error;
    }
  }

  async checkSystemHealth(thresholds: {
    cpu: number;
    memory: number;
    disk: number;
  }): Promise<{
    status: 'operational' | 'degraded' | 'down';
    issues: string[];
  }> {
    const metrics = await this.getSystemMetrics();
    const issues: string[] = [];
    let status: 'operational' | 'degraded' | 'down' = 'operational';

    if (metrics.cpu.usage > thresholds.cpu) {
      issues.push(`High CPU usage: ${metrics.cpu.usage}%`);
      status = 'degraded';
    }

    if (metrics.memory.usagePercent > thresholds.memory) {
      issues.push(`High memory usage: ${metrics.memory.usagePercent}%`);
      status = 'degraded';
    }

    if (metrics.disk.usagePercent > thresholds.disk) {
      issues.push(`High disk usage: ${metrics.disk.usagePercent}%`);
      status = 'degraded';
    }

    if (issues.length > 2) {
      status = 'down';
    }

    return { status, issues };
  }

  async discoverDockerContainers(): Promise<DiscoveredResource[]> {
    try {
      const containers = await si.dockerContainers();
      return containers.map((container) => ({
        type: 'container',
        name: container.name,
        details: {
          id: container.id,
          image: container.image,
          state: container.state,
          ports: container.ports,
          created: container.created,
        },
      }));
    } catch (error) {
      logger.debug('Docker not available or no containers found');
      return [];
    }
  }

  async discoverServices(): Promise<DiscoveredResource[]> {
    try {
      const services = await si.services('*');
      return services
        .filter((service) => service.running)
        .map((service) => ({
          type: 'service',
          name: service.name,
          details: {
            pids: (service as any).pids || [],
            cpu: (service as any).cpu || 0,
            memory: (service as any).mem || 0,
          },
        }));
    } catch (error) {
      logger.debug('Failed to discover services', { error });
      return [];
    }
  }

  async discoverFileSystems(): Promise<DiscoveredResource[]> {
    try {
      const disks = await si.fsSize();
      return disks.map((disk) => ({
        type: 'storage',
        name: disk.fs,
        details: {
          type: disk.type,
          mount: disk.mount,
          size: disk.size,
          used: disk.used,
          available: disk.available,
          usePercent: disk.use,
        },
      }));
    } catch (error) {
      logger.error('Failed to discover file systems', { error });
      return [];
    }
  }

  async getSystemInfo() {
    try {
      const [system, osInfo, cpu, network] = await Promise.all([
        si.system(),
        si.osInfo(),
        si.cpu(),
        si.networkInterfaces(),
      ]);

      return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        manufacturer: system.manufacturer,
        model: system.model,
        version: system.version,
        osDistro: osInfo.distro,
        osRelease: osInfo.release,
        cpuModel: cpu.manufacturer + ' ' + cpu.brand,
        cpuCores: cpu.cores,
        primaryIP: network.find((iface) => !iface.internal)?.ip4 || '127.0.0.1',
      };
    } catch (error) {
      logger.error('Failed to get system info', { error });
      throw error;
    }
  }
}
