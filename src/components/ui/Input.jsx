import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const Input = React.forwardRef(({
  label,
  error,
  helper,
  icon,
  rightIcon,
  className,
  containerClassName,
  ...props
}, ref) => {
  const inputClasses = clsx(
    'form-input',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    icon && 'pl-10',
    rightIcon && 'pr-10',
    className
  );

  return (
    <div className={clsx('form-group', containerClassName)}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: '16px', top: '70%', transform: 'translateY(-50%)' }}>
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <motion.input
          ref={ref}
          className={inputClasses}
          style={{
            paddingLeft: icon ? '48px' : undefined,
            paddingRight: rightIcon ? '48px' : undefined
          }}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center" style={{ paddingRight: '16px' }}>
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
      </div>
      {error && (
        <motion.p 
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="text-gray-500 text-sm mt-1">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  label,
  error,
  helper,
  className,
  containerClassName,
  ...props
}, ref) => {
  const textareaClasses = clsx(
    'form-input form-textarea',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div className={clsx('form-group', containerClassName)}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <motion.textarea
        ref={ref}
        className={textareaClasses}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      />
      {error && (
        <motion.p 
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="text-gray-500 text-sm mt-1">{helper}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({
  label,
  error,
  helper,
  options,
  className,
  containerClassName,
  ...props
}, ref) => {
  const selectClasses = clsx(
    'form-input form-select',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div className={clsx('form-group', containerClassName)}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}
      <motion.select
        ref={ref}
        className={selectClasses}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.p 
          className="text-red-500 text-sm mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {helper && !error && (
        <p className="text-gray-500 text-sm mt-1">{helper}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
