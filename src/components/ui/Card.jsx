import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export const Card = React.forwardRef(({
  children,
  className,
  hover = true,
  padding = 'normal',
  ...props
}, ref) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8'
  };

  const classes = clsx(
    'card',
    paddingClasses[padding] || paddingClasses.normal,
    hover && 'hover:shadow-lg hover:-translate-y-1',
    className
  );

  return (
    <motion.div
      ref={ref}
      className={classes}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx('card-header', className)} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className, ...props }) => (
  <div className={clsx('card-body', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx('card-footer', className)} {...props}>
    {children}
  </div>
);
