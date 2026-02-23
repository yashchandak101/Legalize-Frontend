import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

export const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  overlayClassName,
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  const modalClasses = clsx(
    'bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden',
    sizeClasses[size] || sizeClasses.md,
    className
  );

  const overlayClasses = clsx(
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
    overlayClassName
  );

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={overlayClasses}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={modalClasses}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export const ModalHeader = ({ children, className, ...props }) => (
  <div className={clsx('px-6 py-4 border-b border-gray-200', className)} {...props}>
    {children}
  </div>
);

export const ModalBody = ({ children, className, ...props }) => (
  <div className={clsx('px-6 py-4 overflow-y-auto', className)} {...props}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className, ...props }) => (
  <div className={clsx('px-6 py-4 border-t border-gray-200 bg-gray-50', className)} {...props}>
    {children}
  </div>
);
