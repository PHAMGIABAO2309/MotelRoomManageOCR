import React from 'react';
import { Room } from '../types';
import { LANDLORD_INFO } from '../constants';
import { BuildingOfficeIcon, UserCheckIcon, KeyIcon } from './icons';

interface FooterProps {
  rooms: Room[];
  onSetFilter: (status: 'all' | 'occupied' | 'vacant') => void;
  currentFilter: 'all' | 'occupied' | 'vacant';
}

interface StatButtonProps {
    icon: React.ReactNode;
    count: number;
    label: string;
    status: 'all' | 'occupied' | 'vacant';
    currentFilter: 'all' | 'occupied' | 'vacant';
    onSetFilter: (status: 'all' | 'occupied' | 'vacant') => void;
}

const StatButton: React.FC<StatButtonProps> = ({ icon, count, label, status, currentFilter, onSetFilter }) => {
    const isActive = currentFilter === status;
    return (
        <button
            onClick={() => onSetFilter(status)}
            className={`flex items-center gap-x-1.5 p-1 rounded-md transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
        >
            {icon}
            <span className={`font-semibold ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{count}</span>
            <span>{label}</span>
        </button>
    );
};

const Footer: React.FC<FooterProps> = ({ rooms, onSetFilter, currentFilter }) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = totalRooms - occupiedRooms;

  return (
    <footer className="fixed sm:static bottom-0 left-0 right-0 z-10 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm py-2 border-t border-slate-200 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          {/* Stats on the left */}
          <div className="flex items-center flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-1">
             <StatButton
                icon={<BuildingOfficeIcon className="w-4 h-4 text-indigo-500" />}
                count={totalRooms}
                label="Tổng phòng"
                status="all"
                currentFilter={currentFilter}
                onSetFilter={onSetFilter}
            />
             <StatButton
                icon={<UserCheckIcon className="w-4 h-4 text-teal-500" />}
                count={occupiedRooms}
                label="Đã thuê"
                status="occupied"
                currentFilter={currentFilter}
                onSetFilter={onSetFilter}
            />
            <StatButton
                icon={<KeyIcon className="w-4 h-4 text-amber-500" />}
                count={vacantRooms}
                label="Phòng trống"
                status="vacant"
                currentFilter={currentFilter}
                onSetFilter={onSetFilter}
            />
          </div>

          {/* Info on the right */}
          <div className="text-center sm:text-right text-xs sm:text-sm">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{LANDLORD_INFO.name}</span>
            <span className="hidden sm:inline mx-2">|</span>
            <span className="block sm:inline">SĐT: {LANDLORD_INFO.phone}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;