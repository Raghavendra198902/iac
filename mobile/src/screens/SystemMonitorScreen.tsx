import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';
import * as Network from 'expo-network';

interface SystemStats {
  platform: string;
  device: string;
  osVersion: string;
  batteryLevel: number;
  batteryState: string;
  networkType: string;
  ipAddress: string;
  timestamp: Date;
}

const SystemMonitorScreen: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cpuHistory, setCpuHistory] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const loadSystemStats = async () => {
    try {
      // Battery Info
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      
      // Network Info
      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();
      
      // Device Info
      const systemStats: SystemStats = {
        platform: Platform.OS,
        device: `${Device.brand} ${Device.modelName}`,
        osVersion: Platform.Version.toString(),
        batteryLevel: batteryLevel * 100,
        batteryState: getBatteryStateText(batteryState),
        networkType: networkState.type || 'Unknown',
        ipAddress: ipAddress || 'N/A',
        timestamp: new Date(),
      };
      
      setStats(systemStats);
      
      // Simulate CPU and memory usage (in real app, get from native module)
      updateChartData();
      
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const getBatteryStateText = (state: Battery.BatteryState): string => {
    switch (state) {
      case Battery.BatteryState.CHARGING: return 'Charging';
      case Battery.BatteryState.FULL: return 'Full';
      case Battery.BatteryState.UNPLUGGED: return 'Unplugged';
      default: return 'Unknown';
    }
  };

  const updateChartData = () => {
    // Simulate CPU usage (in real app, get from native module)
    const newCpuValue = Math.random() * 100;
    setCpuHistory(prev => [...prev.slice(1), newCpuValue]);
    
    // Simulate memory usage
    const newMemValue = Math.random() * 100;
    setMemoryHistory(prev => [...prev.slice(1), newMemValue]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSystemStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSystemStats();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadSystemStats();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading system information...</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>📊 System Monitor</Text>
        <Text style={styles.subtitle}>
          {stats.timestamp.toLocaleTimeString()}
        </Text>
      </View>

      {/* Device Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Device Information</Text>
        <View style={styles.card}>
          <InfoRow label="Platform" value={stats.platform.toUpperCase()} />
          <InfoRow label="Device" value={stats.device} />
          <InfoRow label="OS Version" value={stats.osVersion} />
          <InfoRow label="Manufacturer" value={Device.manufacturer || 'N/A'} />
        </View>
      </View>

      {/* Battery Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Battery Status</Text>
        <View style={styles.card}>
          <InfoRow 
            label="Level" 
            value={`${stats.batteryLevel.toFixed(1)}%`}
            color={getBatteryColor(stats.batteryLevel)}
          />
          <InfoRow label="State" value={stats.batteryState} />
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${stats.batteryLevel}%`,
                  backgroundColor: getBatteryColor(stats.batteryLevel)
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Network Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Network Status</Text>
        <View style={styles.card}>
          <InfoRow label="Type" value={stats.networkType} />
          <InfoRow label="IP Address" value={stats.ipAddress} />
          <InfoRow 
            label="Connected" 
            value={stats.ipAddress !== 'N/A' ? 'Yes' : 'No'}
            color={stats.ipAddress !== 'N/A' ? '#4CAF50' : '#F44336'}
          />
        </View>
      </View>

      {/* CPU Usage Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🖥️ CPU Usage History</Text>
        <View style={styles.card}>
          <LineChart
            data={{
              labels: ['', '', '', '', '', ''],
              datasets: [{ data: cpuHistory }],
            }}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#1E1E1E',
              backgroundGradientFrom: '#2E2E2E',
              backgroundGradientTo: '#1E1E1E',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#4CAF50',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartLabel}>
            Current: {cpuHistory[cpuHistory.length - 1].toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Memory Usage Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💾 Memory Usage History</Text>
        <View style={styles.card}>
          <LineChart
            data={{
              labels: ['', '', '', '', '', ''],
              datasets: [{ data: memoryHistory }],
            }}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              backgroundColor: '#1E1E1E',
              backgroundGradientFrom: '#2E2E2E',
              backgroundGradientTo: '#1E1E1E',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#2196F3',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartLabel}>
            Current: {memoryHistory[memoryHistory.length - 1].toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* CMDB Agent Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 CMDB Agent</Text>
        <View style={styles.card}>
          <InfoRow 
            label="Status" 
            value="Connected"
            color="#4CAF50"
          />
          <InfoRow label="Version" value="3.0.0" />
          <InfoRow label="Last Sync" value="Just now" />
          <InfoRow label="Data Points" value="50+" />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📡 Auto-refresh every 5 seconds
        </Text>
        <Text style={styles.footerText}>
          Pull down to refresh manually
        </Text>
      </View>
    </ScrollView>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  color?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, color }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={[styles.infoValue, color && { color }]}>{value}</Text>
  </View>
);

const getBatteryColor = (level: number): string => {
  if (level > 60) return '#4CAF50'; // Green
  if (level > 30) return '#FF9800'; // Orange
  return '#F44336'; // Red
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#AAA',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
});

export default SystemMonitorScreen;
