import React, { useEffect, useState } from 'react';
import { fetchNotifications, markNotificationRead, Notification } from '../api/lackingApi';
import { Alert, AlertDescription } from './ui/alert';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';

interface NotificationTickerProps {
  childId?: number;
  onNotificationClick?: (notification: Notification) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const NotificationTicker: React.FC<NotificationTickerProps> = ({
  childId,
  onNotificationClick,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications(childId, true); // Only unread
      setNotifications(data.notifications.filter(n => !dismissedIds.has(n.id)));
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    if (autoRefresh) {
      const interval = setInterval(loadNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [childId, autoRefresh, refreshInterval]);

  const handleDismiss = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await markNotificationRead(notificationId);
      setDismissedIds(prev => new Set(prev).add(notificationId));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {unreadCount} Alert{unreadCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {notifications.slice(0, 3).map((notification) => (
                <Alert
                  key={notification.id}
                  variant={notification.priority === 'high' ? 'destructive' : 'default'}
                  className={`cursor-pointer hover:opacity-80 transition-opacity min-w-[300px] ${
                    notification.priority === 'high' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-950' 
                      : 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                  }`}
                  onClick={() => handleClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    {notification.priority === 'high' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                    
                    <AlertDescription className="flex-1 text-sm">
                      <span className="font-semibold">{notification.child_name}:</span>{' '}
                      {notification.lacking_label} - {notification.score}/100
                    </AlertDescription>
                    
                    <button
                      onClick={(e) => handleDismiss(notification.id, e)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
          
          {notifications.length > 3 && (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              +{notifications.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
