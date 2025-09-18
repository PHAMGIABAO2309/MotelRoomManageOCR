import React from 'react';
import { Notification } from '../types';
import { BillIcon } from './icons';

interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onNotificationClick }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl shadow-lg shadow-purple-500/20 dark:shadow-purple-400/20 z-30 animate-fade-in-up p-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-aurora" style={{ backgroundSize: '200% 200%' }}>
      <div className="rounded-[10px] bg-white dark:bg-slate-800 overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Thông báo</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => onNotificationClick(notification)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-500/20 rounded-full w-8 h-8 flex items-center justify-center mt-0.5">
                    <BillIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 dark:text-slate-200">{notification.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Đến hạn ngày: {new Date(notification.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Không có thông báo mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;