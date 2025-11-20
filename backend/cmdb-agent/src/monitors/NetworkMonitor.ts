/**
 * Network Connection Monitor
 * Tracks active network connections and identifies suspicious activity
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface NetworkConnection {
  protocol: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: string;
  pid: number;
  processName: string;
  timestamp: Date;
}

export interface NetworkEvent {
  type: 'connection_established' | 'connection_closed' | 'suspicious_connection';
  connection: NetworkConnection;
  reason?: string;
  timestamp: Date;
}

export class NetworkMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private knownConnections: Map<string, NetworkConnection> = new Map();
  private readonly POLL_INTERVAL_MS = 10000; // Check every 10 seconds
  
  // Suspicious ports and IPs
  private readonly SUSPICIOUS_PORTS = [
    23,    // Telnet
    135,   // Windows RPC
    139,   // NetBIOS
    445,   // SMB
    1433,  // SQL Server
    3306,  // MySQL
    3389,  // RDP
    5900,  // VNC
    6379,  // Redis
    27017, // MongoDB
  ];

  private readonly SUSPICIOUS_PROTOCOLS = ['IRC', 'BitTorrent'];

  constructor() {
    super();
  }

  /**
   * Start monitoring network connections
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Network monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting network connection monitor', { platform: os.platform() });

    // Initial scan
    await this.scanConnections();

    // Start polling
    this.pollInterval = setInterval(() => {
      this.scanConnections().catch((error) => {
        logger.error('Network scan error', { error: error.message });
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

    logger.info('Network monitor stopped');
  }

  /**
   * Scan for network connections and detect changes
   */
  private async scanConnections(): Promise<void> {
    try {
      const connections = await this.getNetworkConnections();
      const currentConnectionIds = new Set(connections.map(c => this.getConnectionId(c)));
      const previousConnectionIds = new Set(this.knownConnections.keys());

      // Detect new connections
      for (const connection of connections) {
        const connectionId = this.getConnectionId(connection);
        
        if (!previousConnectionIds.has(connectionId)) {
          this.knownConnections.set(connectionId, connection);

          // Check if suspicious
          const isSuspicious = this.isSuspiciousConnection(connection);
          const eventType = isSuspicious ? 'suspicious_connection' : 'connection_established';

          const event: NetworkEvent = {
            type: eventType,
            connection,
            reason: isSuspicious ? this.getSuspiciousReason(connection) : undefined,
            timestamp: new Date(),
          };

          if (isSuspicious) {
            logger.warn('Suspicious network connection detected', {
              protocol: connection.protocol,
              remoteAddress: connection.remoteAddress,
              remotePort: connection.remotePort,
              processName: connection.processName,
              reason: event.reason,
            });
          }

          this.emit('network_event', event);
        }
      }

      // Detect closed connections
      for (const [connectionId, connection] of this.knownConnections.entries()) {
        if (!currentConnectionIds.has(connectionId)) {
          this.knownConnections.delete(connectionId);

          const event: NetworkEvent = {
            type: 'connection_closed',
            connection,
            timestamp: new Date(),
          };

          this.emit('network_event', event);
        }
      }
    } catch (error: any) {
      logger.error('Failed to scan network connections', { error: error.message });
    }
  }

  /**
   * Get network connections (platform-specific)
   */
  private async getNetworkConnections(): Promise<NetworkConnection[]> {
    const platform = os.platform();

    switch (platform) {
      case 'linux':
        return this.getLinuxConnections();
      case 'win32':
        return this.getWindowsConnections();
      case 'darwin':
        return this.getMacConnections();
      default:
        logger.warn('Network monitoring not supported on this platform', { platform });
        return [];
    }
  }

  /**
   * Get connections on Linux using ss or netstat
   */
  private async getLinuxConnections(): Promise<NetworkConnection[]> {
    try {
      // Try ss first (modern)
      const { stdout } = await execAsync('ss -tunap 2>/dev/null || netstat -tunap 2>/dev/null || true');
      const connections: NetworkConnection[] = [];
      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Skip header lines
        if (line.includes('Local Address') || line.includes('Proto')) continue;

        // Parse ss output: tcp   ESTAB      0      0      192.168.1.100:443      192.168.1.1:54321   users:(("firefox",pid=1234,fd=42))
        const ssMatch = line.match(/^(tcp|udp)\s+(\S+)\s+\d+\s+\d+\s+([^:]+):(\d+)\s+([^:]+):(\d+)\s+.*users:\(\("([^"]+)",pid=(\d+)/);
        
        if (ssMatch) {
          const [, protocol, state, localAddr, localPort, remoteAddr, remotePort, processName, pid] = ssMatch;
          
          connections.push({
            protocol: protocol.toUpperCase() as 'TCP' | 'UDP',
            localAddress: localAddr,
            localPort: parseInt(localPort),
            remoteAddress: remoteAddr,
            remotePort: parseInt(remotePort),
            state,
            pid: parseInt(pid),
            processName,
            timestamp: new Date(),
          });
        }
      }

      return connections;
    } catch (error: any) {
      logger.error('Failed to get Linux network connections', { error: error.message });
      return [];
    }
  }

  /**
   * Get connections on Windows using netstat
   */
  private async getWindowsConnections(): Promise<NetworkConnection[]> {
    try {
      const { stdout } = await execAsync('netstat -ano');
      const connections: NetworkConnection[] = [];
      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Parse netstat output: TCP    192.168.1.100:443    192.168.1.1:54321    ESTABLISHED    1234
        const match = line.match(/^\s*(TCP|UDP)\s+([^:]+):(\d+)\s+([^:]+):(\d+)\s+(\S+)\s+(\d+)/);
        
        if (match) {
          const [, protocol, localAddr, localPort, remoteAddr, remotePort, state, pid] = match;
          
          connections.push({
            protocol: protocol as 'TCP' | 'UDP',
            localAddress: localAddr,
            localPort: parseInt(localPort),
            remoteAddress: remoteAddr,
            remotePort: parseInt(remotePort),
            state,
            pid: parseInt(pid),
            processName: `PID-${pid}`, // Would need additional lookup
            timestamp: new Date(),
          });
        }
      }

      return connections;
    } catch (error: any) {
      logger.error('Failed to get Windows network connections', { error: error.message });
      return [];
    }
  }

  /**
   * Get connections on macOS using netstat
   */
  private async getMacConnections(): Promise<NetworkConnection[]> {
    try {
      const { stdout } = await execAsync('netstat -anv');
      const connections: NetworkConnection[] = [];
      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^(tcp|udp)\d+\s+\d+\s+\d+\s+([^.]+\.\d+)\s+([^.]+\.\d+)\s+(\S+)/);
        
        if (match) {
          const [, protocol, localAddrPort, remoteAddrPort, state] = match;
          const [localAddr, localPort] = localAddrPort.split('.');
          const [remoteAddr, remotePort] = remoteAddrPort.split('.');
          
          connections.push({
            protocol: protocol.toUpperCase() as 'TCP' | 'UDP',
            localAddress: localAddr,
            localPort: parseInt(localPort),
            remoteAddress: remoteAddr,
            remotePort: parseInt(remotePort),
            state,
            pid: 0,
            processName: 'Unknown',
            timestamp: new Date(),
          });
        }
      }

      return connections;
    } catch (error: any) {
      logger.error('Failed to get macOS network connections', { error: error.message });
      return [];
    }
  }

  /**
   * Generate unique connection ID
   */
  private getConnectionId(connection: NetworkConnection): string {
    return `${connection.protocol}-${connection.localAddress}:${connection.localPort}-${connection.remoteAddress}:${connection.remotePort}`;
  }

  /**
   * Check if connection is suspicious
   */
  private isSuspiciousConnection(connection: NetworkConnection): boolean {
    // Check suspicious ports
    if (this.SUSPICIOUS_PORTS.includes(connection.remotePort)) {
      return true;
    }

    // Check for connections to private IPs from unexpected processes
    if (this.isPrivateIP(connection.remoteAddress) && connection.remotePort === 445) {
      return true;
    }

    // Check for unusual outbound connections
    if (connection.remotePort < 1024 && !this.isCommonPort(connection.remotePort)) {
      return true;
    }

    return false;
  }

  /**
   * Get reason for suspicious classification
   */
  private getSuspiciousReason(connection: NetworkConnection): string {
    if (this.SUSPICIOUS_PORTS.includes(connection.remotePort)) {
      return `Connection to suspicious port ${connection.remotePort}`;
    }

    if (this.isPrivateIP(connection.remoteAddress) && connection.remotePort === 445) {
      return 'SMB connection to private IP';
    }

    if (connection.remotePort < 1024) {
      return `Connection to privileged port ${connection.remotePort}`;
    }

    return 'Unusual connection pattern';
  }

  /**
   * Check if IP is private
   */
  private isPrivateIP(ip: string): boolean {
    return /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(ip);
  }

  /**
   * Check if port is commonly used
   */
  private isCommonPort(port: number): boolean {
    const commonPorts = [80, 443, 22, 21, 25, 53, 110, 143, 993, 995];
    return commonPorts.includes(port);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    total: number;
    tcp: number;
    udp: number;
    established: number;
  } {
    const connections = Array.from(this.knownConnections.values());
    
    return {
      total: connections.length,
      tcp: connections.filter(c => c.protocol === 'TCP').length,
      udp: connections.filter(c => c.protocol === 'UDP').length,
      established: connections.filter(c => c.state === 'ESTABLISHED' || c.state === 'ESTAB').length,
    };
  }

  /**
   * Get all active connections
   */
  getConnections(): NetworkConnection[] {
    return Array.from(this.knownConnections.values());
  }
}
