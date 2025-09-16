import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from './icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-600'
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
       <div className="text-center -mt-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white" id="modal-title">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 grid grid-flow-row-dense grid-cols-2 gap-3">
        <button
          type="button"
          className={`col-start-2 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${confirmButtonClass}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className="col-start-1 mt-0 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          onClick={onClose}
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
