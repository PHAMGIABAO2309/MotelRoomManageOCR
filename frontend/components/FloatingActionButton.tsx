import React from 'react';
import { PlusIcon } from './icons';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => (
  <div className="sm:hidden fixed bottom-20 right-4 z-20">
    <button
      onClick={onClick}
      className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 active:scale-95"
      aria-label="Thêm phòng mới"
    >
      <PlusIcon className="w-7 h-7" />
    </button>
  </div>
);

export default FloatingActionButton;
