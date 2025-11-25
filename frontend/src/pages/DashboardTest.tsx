import { Cpu, Database, Server, Activity } from 'lucide-react';

const ECGMonitor = ({ data, color = 'blue' }: { data: number[], color?: string }) => {
  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
  };
  
  return (
    <svg width="100" height="30" className="inline-block">
      <text x="10" y="20" fill={colorMap[color]} fontSize="12">ECG SINE WAVE!</text>
    </svg>
  );
};

export default function DashboardTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">ECG Test Page</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>CPU Usage</span>
          </div>
          <p className="text-2xl font-bold mb-2">47%</p>
          <ECGMonitor data={[45, 46, 47]} color="blue" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-green-600" />
            <span>Memory</span>
          </div>
          <p className="text-2xl font-bold mb-2">55%</p>
          <ECGMonitor data={[53, 54, 55]} color="green" />
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="font-bold">If you see "ECG SINE WAVE!" text above, then:</p>
        <p>✅ The server IS serving new code</p>
        <p>❌ Your main Dashboard page is cached</p>
      </div>
    </div>
  );
}
