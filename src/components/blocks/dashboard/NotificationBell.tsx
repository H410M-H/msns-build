"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
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
  CreditCard,
  ClipboardCheck,
  GraduationCap,
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
  markAllNotificationsAsRead as markLocalAllRead,
  markNotificationAsRead as markLocalRead,
  clearAllNotifications as clearLocalAll,
  type StoredNotification,
} from "~/lib/mobile/notification-store";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { playNotificationChime } from "~/lib/audio-chime";

export type DisplayNotification = {
  id: string;
  title: string;
  body: string;
  category: string;
  actionUrl?: string | null;
  read: boolean;
  createdAt: string | Date;
  isServer: boolean;
};

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [localNotifications, setLocalNotifications] = useState<StoredNotification[]>([]);
  const [, startTransition] = useTransition();

  // tRPC query with auto-refresh every 30s
  const { data: serverNotifications, refetch: refetchNotifications } =
    api.notification.getAll.useQuery(undefined, {
      refetchInterval: 30000,
      staleTime: 10000,
    });

  const { data: serverUnreadCount, refetch: refetchUnread } =
    api.notification.getUnreadCount.useQuery(undefined, {
      refetchInterval: 30000,
      staleTime: 10000,
    });

  const markAsReadMutation = api.notification.markAsRead.useMutation({
    onSuccess: () => {
      void refetchNotifications();
      void refetchUnread();
    },
  });

  const markAllAsReadMutation = api.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      void refetchNotifications();
      void refetchUnread();
    },
  });

  const deleteMutation = api.notification.delete.useMutation({
    onSuccess: () => {
      void refetchNotifications();
      void refetchUnread();
    },
  });

  const clearAllMutation = api.notification.clearAll.useMutation({
    onSuccess: () => {
      void refetchNotifications();
      void refetchUnread();
    },
  });

  // Sync offline/local store notifications
  const reloadLocalNotifications = () => {
    setLocalNotifications(getStoredNotifications());
  };

  useEffect(() => {
    reloadLocalNotifications();
    const handleUpdate = () => {
      reloadLocalNotifications();
      void refetchNotifications();
      void refetchUnread();
    };
    window.addEventListener("msns_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("msns_notifications_updated", handleUpdate);
    };
  }, [refetchNotifications, refetchUnread]);

  // Combine server and local notifications seamlessly (de-duplicating by title + body)
  const combinedNotifications = useMemo<DisplayNotification[]>(() => {
    const list: DisplayNotification[] = [];
    const seen = new Set<string>();

    if (serverNotifications) {
      for (const sn of serverNotifications) {
        const key = `${sn.title}_${sn.body}`;
        seen.add(key);
        list.push({
          id: sn.id,
          title: sn.title,
          body: sn.body,
          category: sn.category,
          actionUrl: sn.actionUrl,
          read: sn.read,
          createdAt: sn.createdAt,
          isServer: true,
        });
      }
    }

    for (const ln of localNotifications) {
      const key = `${ln.title}_${ln.body}`;
      if (!seen.has(key)) {
        list.push({
          id: ln.id,
          title: ln.title,
          body: ln.body,
          category: ln.category,
          actionUrl: ln.actionUrl,
          read: ln.read,
          createdAt: ln.timestamp,
          isServer: false,
        });
      }
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [serverNotifications, localNotifications]);

  const totalUnreadCount = useMemo(() => {
    const localUnread = localNotifications.filter((n) => !n.read).length;
    return (serverUnreadCount ?? 0) + localUnread;
  }, [serverUnreadCount, localNotifications]);

  // Audio chime trigger on incoming unread count increase
  const prevUnreadRef = useRef<number>(totalUnreadCount);
  useEffect(() => {
    if (totalUnreadCount > prevUnreadRef.current) {
      playNotificationChime();
    }
    prevUnreadRef.current = totalUnreadCount;
  }, [totalUnreadCount]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") return combinedNotifications;
    return combinedNotifications.filter((n) => n.category === activeTab);
  }, [combinedNotifications, activeTab]);

  const handleMarkAllRead = () => {
    markLocalAllRead();
    reloadLocalNotifications();
    markAllAsReadMutation.mutate();
  };

  const handleClearAll = () => {
    clearLocalAll();
    reloadLocalNotifications();
    clearAllMutation.mutate();
  };

  const handleItemClick = (notif: DisplayNotification) => {
    if (!notif.read) {
      if (notif.isServer) {
        markAsReadMutation.mutate({ id: notif.id });
      } else {
        markLocalRead(notif.id);
        reloadLocalNotifications();
      }
    }
    if (notif.actionUrl) {
      setOpen(false);
      startTransition(() => {
        router.push(notif.actionUrl!);
      });
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, notif: DisplayNotification) => {
    e.stopPropagation();
    if (notif.isServer) {
      deleteMutation.mutate({ id: notif.id });
    } else {
      markLocalRead(notif.id);
      reloadLocalNotifications();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BROADCAST":
        return <Megaphone className="h-4 w-4 text-amber-500" />;
      case "FEE":
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case "ATTENDANCE":
        return <ClipboardCheck className="h-4 w-4 text-rose-500" />;
      case "EXAM":
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
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
          {totalUnreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900 animate-in fade-in zoom-in duration-200">
              {totalUnreadCount > 9 ? "9+" : totalUnreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] sm:w-[440px] p-0 shadow-2xl rounded-2xl border border-slate-200 dark:border-border bg-white dark:bg-slate-900 overflow-hidden z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-border/60 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">
              Notifications & Alerts
            </h3>
            {totalUnreadCount > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-none text-[11px] font-semibold">
                {totalUnreadCount} new
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {totalUnreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-2"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all
              </Button>
            )}
            {combinedNotifications.length > 0 && (
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

        {/* Category Tabs */}
        <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-border/40 bg-white dark:bg-slate-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex overflow-x-auto scrollbar-none h-8 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] gap-1">
              <TabsTrigger value="ALL" className="text-[11px] px-2 py-1 flex-1 min-w-fit">
                All ({combinedNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="BROADCAST" className="text-[11px] px-2 py-1 flex-1 min-w-fit">
                📢 Alerts
              </TabsTrigger>
              <TabsTrigger value="FEE" className="text-[11px] px-2 py-1 flex-1 min-w-fit">
                💳 Fee
              </TabsTrigger>
              <TabsTrigger value="ATTENDANCE" className="text-[11px] px-2 py-1 flex-1 min-w-fit">
                📋 Attendance
              </TabsTrigger>
              <TabsTrigger value="EXAM" className="text-[11px] px-2 py-1 flex-1 min-w-fit">
                🎓 Exams
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notification List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-border/40">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group relative p-3.5 flex gap-3 cursor-pointer transition-all duration-150 ${
                  notif.read
                    ? "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                    : "bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 rounded-full p-2 h-fit bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-border">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs truncate ${
                        notif.read
                          ? "text-slate-700 dark:text-slate-300 font-medium"
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
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notif.isServer) {
                              markAsReadMutation.mutate({ id: notif.id });
                            } else {
                              markLocalRead(notif.id);
                              reloadLocalNotifications();
                            }
                          }}
                          className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteItem(e, notif)}
                        className="h-5 px-1.5 text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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

function formatTimeAgo(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "Recently";
  }
}
