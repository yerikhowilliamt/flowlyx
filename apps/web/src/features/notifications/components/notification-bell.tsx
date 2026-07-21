'use client';

import React from 'react';
import { Bell, Check, CheckCheck, Trash2, Loader2, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { data: countData } = useUnreadNotificationsCount();
  const { data: notificationsData, isLoading } = useNotifications({ limit: 50 });

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const unreadCount = countData?.count ?? 0;
  const notifications = notificationsData?.data ?? [];

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(id);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl border border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50 transition-all duration-200"
            aria-label="View notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white border-2 border-zinc-950 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                variant="default"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 border border-zinc-900 bg-zinc-950/95 backdrop-blur-md p-0 shadow-2xl focus:outline-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm">Notifications</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 && 's'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="h-7 px-2.5 text-xs text-orange-500 hover:text-orange-400 hover:bg-orange-500/5 font-semibold gap-1.5 transition-colors"
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center p-4">
            <div className="rounded-2xl bg-zinc-900/50 p-3 border border-zinc-900/50 text-zinc-600 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-zinc-400">All caught up!</p>
            <p className="text-xs text-zinc-600 mt-1">No new notifications here.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[380px] overflow-y-auto">
            <div className="divide-y divide-zinc-900">
              {notifications.map((notification) => {
                const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                });

                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsReadMutation.mutate(notification.id);
                      }
                    }}
                    className={cn(
                      'group relative flex items-start gap-3 p-4 cursor-pointer hover:bg-zinc-900/30 transition-colors',
                      !notification.read && 'bg-orange-500/[0.02]',
                    )}
                  >
                    {/* Unread indicator */}
                    {!notification.read && (
                      <span className="absolute left-1.5 top-[22px] h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-xs font-semibold leading-none truncate',
                            notification.read ? 'text-zinc-400' : 'text-zinc-100',
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                          {formattedTime}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed break-words">
                        {notification.message}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDelete(e, notification.id)}
                        title="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
