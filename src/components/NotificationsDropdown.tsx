import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, Info, CheckCircle2, AlertTriangle, AlertCircle, ExternalLink, Server, Settings, ShieldAlert, Hexagon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ============================================
// AstroWax Panel V1.80 — Notifications Dropdown
// Glass + Purple Theme
// ============================================

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
  link?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "System Services Online",
    message: "Docker engine and server management stack are running normally.",
    type: "success",
    timestamp: "Just now",
    read: false,
    link: "/"
  },
  {
    id: "notif-2",
    title: "Security & Access",
    message: "Ensure custom API keys and passwords are securely configured in Settings.",
    type: "warning",
    timestamp: "10m ago",
    read: false,
    link: "/account"
  },
  {
    id: "notif-3",
    title: "Welcome to AstroWax Panel",
    message: "Create high-performance game servers with one-click deployment.",
    type: "info",
    timestamp: "1h ago",
    read: true,
    link: "/servers/create"
  }
];

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem("astrowax_notifications");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("astrowax_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#fbbf24' }} />;
      case "error":
        return <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f87171' }} />;
      default:
        return <Info className="w-4 h-4 shrink-0" style={{ color: '#c084fc' }} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className={`p-2 rounded-lg transition-all relative ${
          isOpen ? "bg-purple-500/15 text-white" : "text-zinc-400 hover:text-white hover:bg-purple-500/10"
        }`}
        style={{
          border: isOpen ? '1px solid rgba(168,85,247,.4)' : '1px solid transparent',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: '#a855f7' }}
            />
            <span 
              className="relative inline-flex rounded-full h-3 w-3 border-2"
              style={{ 
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                borderColor: '#05030a',
                boxShadow: '0 0 8px rgba(168,85,247,.8)',
              }}
            />
          </span>
        )}
      </button>

      {/* Notifications Panel Dropdown */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 shadow-2xl rounded-xl overflow-hidden z-50"
          style={{
            background: 'linear-gradient(135deg, rgba(20,12,35,.95) 0%, rgba(13,8,25,.98) 100%)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            border: '1px solid rgba(168,85,247,.25)',
            boxShadow: '0 20px 60px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(168,85,247,.15)',
            animation: 'awNotifIn .15s ease both',
          }}
        >
          {/* Top highlight */}
          <div 
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(168,85,247,.6), rgba(255,255,255,.2), rgba(168,85,247,.6), transparent)',
            }}
          />
          
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(168,85,247,.15)' }}
          >
            <div className="flex items-center gap-2">
              <Hexagon size={14} style={{ color: '#a855f7', filter: 'drop-shadow(0 0 6px rgba(168,85,247,.6))' }} />
              <h3 className="font-semibold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(168,85,247,.2)',
                    color: '#c084fc',
                    border: '1px solid rgba(168,85,247,.35)',
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-zinc-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  title="Mark all as read"
                >
                  <Check size={12} />
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-zinc-400 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-rose-500/10"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div 
            className="flex items-center px-4 pt-2 pb-1 gap-2"
            style={{ 
              borderBottom: '1px solid rgba(168,85,247,.1)',
              background: 'rgba(0,0,0,.25)',
            }}
          >
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "text-purple-200"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              style={
                filter === "all"
                  ? {
                      background: 'rgba(168,85,247,.2)',
                      border: '1px solid rgba(168,85,247,.4)',
                    }
                  : { border: '1px solid transparent' }
              }
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === "unread"
                  ? "text-purple-200"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              style={
                filter === "unread"
                  ? {
                      background: 'rgba(168,85,247,.2)',
                      border: '1px solid rgba(168,85,247,.4)',
                    }
                  : { border: '1px solid transparent' }
              }
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div 
            className="max-h-[360px] overflow-y-auto aw-notif-scroll"
          >
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
                <p className="text-xs font-medium text-zinc-400">No notifications found</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  {filter === "unread" ? "You have read all your alerts!" : "All caught up."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className="p-3.5 flex items-start gap-3 transition-all cursor-pointer group hover:bg-purple-500/[0.06] relative"
                  style={{
                    borderBottom: '1px solid rgba(168,85,247,.08)',
                    background: !notif.read ? 'rgba(168,85,247,.04)' : 'transparent',
                  }}
                >
                  <div className="mt-0.5">{getTypeIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2">
                      <p 
                        className={`text-xs font-semibold truncate ${
                          !notif.read ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-zinc-600 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <span 
                        className="inline-flex items-center gap-1 text-[10px] font-medium mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#c084fc' }}
                      >
                        View details <ExternalLink size={10} />
                      </span>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <span 
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                        boxShadow: '0 0 8px rgba(168,85,247,.8)',
                      }}
                    />
                  )}

                  {/* Close/delete button */}
                  <button
                    onClick={(e) => deleteNotification(notif.id, e)}
                    className="absolute right-2 top-2 p-1 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes awNotifIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(.98);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .aw-notif-scroll::-webkit-scrollbar { width: 6px; }
        .aw-notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .aw-notif-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a855f7, #7e22ce);
          border-radius: 99px;
          box-shadow: 0 0 8px rgba(168,85,247,.5);
        }
        .aw-notif-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #c084fc, #a855f7);
        }
      `}} />
    </div>
  );
}