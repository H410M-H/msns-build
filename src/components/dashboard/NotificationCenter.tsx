import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Bell,
  X,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  icon?: React.ReactNode;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "success":
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case "error":
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Bell className="h-5 w-5 text-blue-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "success":
      return "bg-green-50 border-green-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
}: NotificationCenterProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeNotifications = notifications.filter(
    (n) => !dismissedIds.has(n.id)
  );

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
    onMarkAsRead?.(id);
  };

  const handleClearAll = () => {
    setDismissedIds(new Set(notifications.map((n) => n.id)));
    onClearAll?.();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {activeNotifications.length} unread notification
              {activeNotifications.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          {activeNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activeNotifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${getTypeColor(
                  notification.type
                )}`}
              >
                <div className="flex-shrink-0 pt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {notification.timestamp.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
