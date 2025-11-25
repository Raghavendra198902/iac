/**
 * Dashboard Screen
 * Main dashboard with key metrics and insights
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import ApiService from '../../services/ApiService';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeBlueprints: 0,
    totalCost: 0,
    alerts: 0,
  });
  const [costData, setCostData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Load statistics
      const projects = await ApiService.getProjects();
      const blueprints = await ApiService.getBlueprints();
      const alertsData = await ApiService.getAlerts({ status: 'active' });
      const costForecast = await ApiService.getCostForecast({ days: 7 });

      setStats({
        totalProjects: projects.length || 0,
        activeBlueprints: blueprints.length || 0,
        totalCost: costForecast.total || 0,
        alerts: alertsData.length || 0,
      });

      setCostData(costForecast);
      setAlerts(alertsData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadDashboardData();
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 58, 138, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#1e3a8a',
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>IAC DHARMA</Title>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Icon name="bell-outline" size={24} color="#1e3a8a" />
          {stats.alerts > 0 && (
            <Badge style={styles.badge} size={16}>
              {stats.alerts}
            </Badge>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statIcon}>
              <Icon name="folder-multiple" size={32} color="#1e3a8a" />
            </View>
            <Title style={styles.statValue}>{stats.totalProjects}</Title>
            <Paragraph style={styles.statLabel}>Projects</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statIcon}>
              <Icon name="file-document-multiple" size={32} color="#059669" />
            </View>
            <Title style={styles.statValue}>{stats.activeBlueprints}</Title>
            <Paragraph style={styles.statLabel}>Blueprints</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statIcon}>
              <Icon name="currency-usd" size={32} color="#dc2626" />
            </View>
            <Title style={styles.statValue}>${stats.totalCost.toFixed(0)}</Title>
            <Paragraph style={styles.statLabel}>Monthly Cost</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content>
            <View style={styles.statIcon}>
              <Icon name="alert-circle" size={32} color="#ea580c" />
            </View>
            <Title style={styles.statValue}>{stats.alerts}</Title>
            <Paragraph style={styles.statLabel}>Active Alerts</Paragraph>
          </Card.Content>
        </Card>
      </View>

      {/* Cost Trend Chart */}
      {costData && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title style={styles.chartTitle}>7-Day Cost Trend</Title>
            <LineChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    data: costData.daily || [100, 120, 110, 130, 125, 140, 135],
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card style={styles.alertsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Recent Alerts</Title>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <Icon
                  name="alert-circle"
                  size={20}
                  color={
                    alert.severity === 'critical'
                      ? '#dc2626'
                      : alert.severity === 'high'
                      ? '#ea580c'
                      : '#f59e0b'
                  }
                />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertTime}>{alert.timestamp}</Text>
                </View>
              </View>
            ))
          ) : (
            <Paragraph>No active alerts</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Projects', { screen: 'ProjectsList' })}
            >
              <Icon name="plus-circle" size={32} color="#1e3a8a" />
              <Text style={styles.actionText}>New Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Blueprints', { screen: 'BlueprintsList' })}
            >
              <Icon name="file-plus" size={32} color="#1e3a8a" />
              <Text style={styles.actionText}>New Blueprint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Monitoring')}
            >
              <Icon name="monitor-dashboard" size={32} color="#1e3a8a" />
              <Text style={styles.actionText}>View Metrics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('CostAnalytics')}
            >
              <Icon name="chart-line" size={32} color="#1e3a8a" />
              <Text style={styles.actionText}>Cost Analysis</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '48%',
    margin: 4,
    backgroundColor: '#ffffff',
  },
  statIcon: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  statLabel: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
  chartCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  chartTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  alertsCard: {
    margin: 16,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsCard: {
    margin: 16,
    marginBottom: 32,
    backgroundColor: '#ffffff',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a8a',
  },
});

export default DashboardScreen;
