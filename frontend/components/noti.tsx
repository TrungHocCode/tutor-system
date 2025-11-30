import { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiX } from 'react-icons/hi';

type NotificationType = 'success' | 'error';

interface NotiProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Noti({ type, title, message, onClose, duration = 3000 }: NotiProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in-right`}>
      <div 
        className={`
          min-w-[320px] max-w-md rounded-lg shadow-2xl p-4 flex items-start space-x-3
          ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
        `}
      >
        {/* Icon */}
        <div className="shrink-0 pt-0.5">
          {type === 'success' ? (
            <HiCheckCircle className="w-6 h-6 text-white" />
          ) : (
            <HiXCircle className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Nội dung */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-base">{title}</h3>
          <p className="text-white text-sm mt-1 opacity-90">{message}</p>
        </div>

        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="shrink-0 text-white hover:bg-white/20 rounded p-1 transition"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotiContainerProps {
  notifications: NotificationItem[];
  onRemove: (id: number) => void;
}

export function NotiContainer({ notifications, onRemove }: NotiContainerProps) {
  return (
    <>
      {notifications.map((noti) => (
        <Noti
          key={noti.id}
          type={noti.type}
          title={noti.title}
          message={noti.message}
          onClose={() => onRemove(noti.id)}
        />
      ))}
    </>
  );
}