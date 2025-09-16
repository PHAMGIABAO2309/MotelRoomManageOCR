import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4 p-4 sm:p-6 relative animate-fade-in-up border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm p-1.5"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;