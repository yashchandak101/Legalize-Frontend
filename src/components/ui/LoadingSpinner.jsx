import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white'
  };

  const classes = clsx(
    sizeClasses[size] || sizeClasses.md,
    colorClasses[color] || colorClasses.primary,
    className
  );

  return (
    <motion.svg
      className={classes}
      viewBox="0 0 24 24"
      fill="none"
      variants={spinnerVariants}
      animate="spin"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
};

export const PageLoader = ({ message = 'Loading...', className, ...props }) => (
  <div className={clsx('flex flex-col items-center justify-center min-h-[200px]', className)} {...props}>
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

export const InlineLoader = ({ message, className, ...props }) => (
  <div className={clsx('flex items-center space-x-2', className)} {...props}>
    <LoadingSpinner size="sm" />
    {message && <span className="text-sm text-gray-600">{message}</span>}
  </div>
);
