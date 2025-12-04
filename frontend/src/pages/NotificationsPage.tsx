import { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'success', title: 'Deployment Completed', message: 'Production deployment finished successfully', time: '5 min ago', read: false },
    { id: '2', type: 'warning', title: 'Policy Violation', message: 'Blueprint has 2 guardrail violations', time: '1 hour ago', read: false },
    { id: '3', type: 'info', title: 'System Update', message: 'New features available in v2.1', time: '2 hours ago', read: true },
    { id: '4', type: 'error', title: 'Failed Health Check', message: 'Service endpoint not responding', time: '3 hours ago', read: true },
  ]);

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const deleteNotification = (id: string) => setNotifications(notifications.filter(n => n.id !== id));

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <button onClick={markAllRead} className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            Mark all as read
          </button>
        </div>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border ${notif.read ? 'border-gray-200 dark:border-gray-700' : 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'}`}>
              {getIcon(notif.type)}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{notif.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
              <button onClick={() => deleteNotification(notif.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
