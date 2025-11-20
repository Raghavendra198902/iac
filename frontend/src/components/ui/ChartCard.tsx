import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Card, { CardHeader, CardContent } from './Card';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  type?: 'line' | 'area' | 'bar';
  dataKey?: string;
  color?: string;
}

export default function ChartCard({ 
  title, 
  data, 
  type = 'line',
  dataKey = 'value',
  color = '#3b82f6'
}: ChartCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 5, left: 0, bottom: 5 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.6} />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
            <Bar dataKey={dataKey} fill={color} />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
          </LineChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Multi-line chart component
interface MultiLineChartProps {
  title: string;
  data: ChartData[];
  lines: Array<{ dataKey: string; color: string; name: string }>;
}

export function MultiLineChart({ title, data, lines }: MultiLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const textColor = isDark ? '#9ca3af' : '#6b7280';
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: textColor }} />
            <YAxis tick={{ fontSize: 12, fill: textColor }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb' }} />
            <Legend />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
