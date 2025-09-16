import React from 'react';
import { Room } from '../types';
import { UserIcon, BoltIcon, WaterDropIcon, PinIcon } from './icons';

interface RoomCardProps {
  room: Room;
  onSelectRoom: (room: Room) => void;
  searchQuery: string;
  draggedItem: Room | null;
  dragOverItem: Room | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, room: Room) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, room: Room) => void;
  onDragEnd: () => void;
  onTogglePin: (roomId: string) => void;
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ 
    room, 
    onSelectRoom, 
    searchQuery,
    draggedItem,
    dragOverItem,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onTogglePin,
    onTouchStart,
    onTouchMove,
    onTouchEnd
}) => {
  const statusColor = room.status === 'occupied' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
  const lastRecord = room.usageHistory.length > 0 ? room.usageHistory[room.usageHistory.length - 1] : null;

  const isDraggable = !searchQuery;
  const isDragging = draggedItem?.id === room.id;
  const isDragOver = dragOverItem?.id === room.id;

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePin(room.id);
  };

  return (
    <div
      onClick={() => onSelectRoom(room)}
      draggable={isDraggable}
      onDragStart={(e) => onDragStart(e, room)}
      onDragEnter={(e) => onDragEnter(e, room)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      data-room-id={room.id}
      className={`relative group touch-none ${isDraggable ? 'cursor-grab' : 'cursor-pointer'}`}
    >
      <div 
        className="absolute -inset-px rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                   animate-aurora"
        style={{ backgroundSize: '200% 200%' }}
        aria-hidden="true"
      />
      
      <div 
        className={`relative bg-white dark:bg-slate-800 rounded-lg 
                   shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/20 dark:group-hover:shadow-indigo-400/20
                   group-hover:-translate-y-1 transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between
                   ${isDragging ? 'opacity-50' : ''}`}
      >
        <button
            onClick={handlePinClick}
            className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-all duration-200
                        ${room.isPinned 
                            ? 'text-indigo-500 dark:text-indigo-400 opacity-100' 
                            : 'text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:text-indigo-500 dark:hover:text-indigo-400'
                        }`}
            title={room.isPinned ? "Bỏ ghim" : "Ghim phòng"}
        >
            <PinIcon className={`w-5 h-5 ${room.isPinned ? 'fill-current' : ''}`} />
        </button>

        {isDragOver && !isDragging && (
          <div className="absolute top-0 left-2 right-2 h-1.5 bg-indigo-500 rounded-full animate-pulse -mt-2" />
        )}
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pr-8">{room.name}</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor} flex-shrink-0`}>
              {room.status === 'occupied' ? 'Đã có người' : 'Còn trống'}
            </span>
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            <p className="flex items-center">
              <UserIcon className="w-4 h-4 mr-2 text-slate-400" /> 
              <span className="truncate">{room.status === 'occupied' && room.tenant ? room.tenant.name : 'Chưa có người thuê'}</span>
            </p>
          </div>
        </div>
        <div className="mt-3">
          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-600 dark:text-slate-300">Chỉ số cuối:</p>
              <div className="flex justify-between items-center text-sm">
                  <p className="flex items-center font-medium text-slate-700 dark:text-slate-200">
                      <BoltIcon className="w-4 h-4 mr-1 text-yellow-500" /> 
                      {lastRecord ? lastRecord.electricReading : 'N/A'} <span className="text-xs text-slate-500 ml-1">kWh</span>
                  </p>
                  <p className="flex items-center font-medium text-slate-700 dark:text-slate-200">
                      <WaterDropIcon className="w-4 h-4 mr-1 text-sky-500" />
                      {lastRecord ? lastRecord.waterReading : 'N/A'} <span className="text-xs text-slate-500 ml-1">m³</span>
                  </p>
              </div>
          </div>
          <div className="mt-3 text-right">
              <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {room.baseRent.toLocaleString('vi-VN')}
                  <span className="text-sm font-medium"> VND</span>
              </p>
              <p className="text-xs text-slate-500 -mt-1">Tiền thuê / tháng</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;