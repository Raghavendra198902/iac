import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import Card from '../ui/Card';
import type { EnforcementEvent } from '../../services/enforcementService';

interface EventAnalyticsProps {
  events: EnforcementEvent[];
}

const SEVERITY_COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#F59E0B',
  low: '#10B981',
};

const EventAnalytics = ({ events }: EventAnalyticsProps) => {
  // Severity distribution
  const severityData = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#6B7280',
    }));
  }, [events]);

  // Events by policy
  const policyData = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      const policy = event.policyName || 'Unknown';
      acc[policy] = (acc[policy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([policy, count]) => ({
        name: policy.length > 30 ? policy.substring(0, 27) + '...' : policy,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [events]);

  // Timeline data (last 24 hours by hour)
  const timelineData = useMemo(() => {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now);
      time.setHours(now.getHours() - (23 - i), 0, 0, 0);
      return {
        time: format(time, 'HH:00'),
        count: 0,
        critical: 0,
        high: 0,
      };
    });

    events.forEach((event) => {
      const eventTime = new Date(event.timestamp);
      const hoursDiff = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
      
      if (hoursDiff >= 0 && hoursDiff < 24) {
        const index = 23 - hoursDiff;
        hours[index].count++;
        if (event.severity === 'critical') hours[index].critical++;
        if (event.severity === 'high') hours[index].high++;
      }
    });

    return hours;
  }, [events]);

  // Events by agent
  const agentData = useMemo(() => {
    const counts = events.reduce((acc, event) => {
      const agent = event.agentName || 'Unknown';
      acc[agent] = (acc[agent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([agent, count]) => ({
        name: agent,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [events]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Severity Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Events by Severity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          24-Hour Event Timeline
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Total" />
            <Line type="monotone" dataKey="critical" stroke="#DC2626" name="Critical" />
            <Line type="monotone" dataKey="high" stroke="#EA580C" name="High" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Policies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Triggered Policies
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={policyData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="count" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Agents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Most Active Agents
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default EventAnalytics;
