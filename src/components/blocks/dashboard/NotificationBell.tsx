"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  Megaphone,
  Sparkles,
  CalendarCheck,
  Info,
  Trash2,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearAllNotifications,
  type StoredNotification,
} from "~/lib/mobile/notification-store";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [, startTransition] = useTransition();

  const reloadNotifications = () => {
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    reloadNotifications();

    const handleUpdate = () => {
      reloadNotifications();
    };

    window.addEventListener("msns_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("msns_notifications_updated", handleUpdate);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    return n.category === activeTab;
  });

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    reloadNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    reloadNotifications();
  };

  const handleItemClick = (notif: StoredNotification) => {
    if (!notif.read) {
      markNotificationAsRead(notif.id);
      reloadNotifications();
    }
    if (notif.actionUrl) {
      setOpen(false);
      startTransition(() => {
        router.push(notif.actionUrl!);
      });
    }
  };

  const getCategoryIcon = (category: StoredNotification["category"]) => {
    switch (category) {
      case "BROADCAST":
        return <Megaphone className="h-4 w-4 text-amber-500" />;
      case "FEATURE_EXPLORE":
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      case "DAILY_TASK":
        return <CalendarCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="group relative rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-600 transition-colors group-hover:text-emerald-600 dark:text-emerald-100 dark:group-hover:text-emerald-400" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] sm:w-[420px] p-0 shadow-2xl rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-slate-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border/60 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              Notifications & Broadcasts
            </h3>
            {unreadCount > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-none text-[11px] font-semibold">
                {unreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Clear all notifications"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-border/40 bg-white dark:bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-8 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <TabsTrigger value="ALL" className="text-[11px] px-1 py-1">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="BROADCAST" className="text-[11px] px-1 py-1">
                📢 Alerts
              </TabsTrigger>
              <TabsTrigger value="DAILY_TASK" className="text-[11px] px-1 py-1">
                📋 Tasks
              </TabsTrigger>
              <TabsTrigger value="FEATURE_EXPLORE" className="text-[11px] px-1 py-1">
                💡 Explore
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notification List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-border/40">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group relative p-3.5 flex gap-3 cursor-pointer transition-colors ${
                  notif.read
                    ? "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                    : "bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 rounded-full p-2 h-fit bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-border">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-semibold truncate ${
                        notif.read
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-900 dark:text-slate-100 font-bold"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {notif.body}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {formatTimeAgo(notif.timestamp)}
                    </span>
                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notif.id);
                          reloadNotifications();
                        }}
                        className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center">
              <BellOff className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3 stroke-1" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                No notifications in this category
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                You are all caught up!
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatTimeAgo(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true });
  } catch {
    return "Recently";
  }
}
