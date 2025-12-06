import { useEffect, useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import type { EnforcementEvent } from '../../services/enforcementService';

interface NotificationControlsProps {
  onEventReceived?: (event: EnforcementEvent) => void;
}

const NotificationControls = ({ onEventReceived }: NotificationControlsProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Load preferences from localStorage
    const savedNotif = localStorage.getItem('security-notifications');
    const savedSound = localStorage.getItem('security-sound');
    setNotificationsEnabled(savedNotif === 'true');
    setSoundEnabled(savedSound === 'true');
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications not supported');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('security-notifications', 'true');
        toast.success('Notifications enabled');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled && permission !== 'granted') {
      requestPermission();
      return;
    }

    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    localStorage.setItem('security-notifications', String(newState));
    toast.success(newState ? 'Notifications enabled' : 'Notifications disabled');
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('security-sound', String(newState));
    toast.success(newState ? 'Sound alerts enabled' : 'Sound alerts disabled');
  };

  // Notification handler
  useEffect(() => {
    if (!onEventReceived) return;

    const handleEvent = (event: EnforcementEvent) => {
      // Only notify for high and critical severity
      if (event.severity !== 'high' && event.severity !== 'critical') return;

      // Browser notification
      if (notificationsEnabled && permission === 'granted') {
        const notification = new Notification('Security Alert', {
          body: `${event.severity.toUpperCase()}: ${event.policyName}`,
          icon: '/shield-icon.png',
          tag: event.id,
          requireInteraction: event.severity === 'critical',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }

      // Sound alert
      if (soundEnabled) {
        const audio = new Audio('/alert-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.error('Failed to play sound:', err));
      }
    };

    // This would be connected to event stream in parent component
    // For now, it's a placeholder
  }, [notificationsEnabled, soundEnabled, permission, onEventReceived]);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={toggleNotifications}
        variant={notificationsEnabled ? 'primary' : 'secondary'}
        size="sm"
        title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {notificationsEnabled ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
      </Button>
      <Button
        onClick={toggleSound}
        variant={soundEnabled ? 'primary' : 'secondary'}
        size="sm"
        title={soundEnabled ? 'Disable sound' : 'Enable sound'}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};

export default NotificationControls;

// Helper function to trigger notifications (export for use in parent)
export const triggerNotification = (
  event: EnforcementEvent,
  notificationsEnabled: boolean,
  soundEnabled: boolean
) => {
  // Only notify for high and critical severity
  if (event.severity !== 'high' && event.severity !== 'critical') return;

  // Browser notification
  if (notificationsEnabled && Notification.permission === 'granted') {
    new Notification('Security Alert', {
      body: `${event.severity.toUpperCase()}: ${event.policyName}`,
      icon: '/shield-icon.png',
      tag: event.id,
      requireInteraction: event.severity === 'critical',
    });
  }

  // Sound alert
  if (soundEnabled) {
    const audio = new Audio('/alert-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.error('Failed to play sound:', err));
  }
};
