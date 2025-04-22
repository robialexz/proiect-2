import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary: {
    background: colors.primary,
    color: colors.text,
    border: `1px solid ${colors.primary}`,
  },
  secondary: {
    background: colors.surface,
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
  },
  ghost: {
    background: 'transparent',
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
  },
  danger: {
    background: colors.error,
    color: colors.text,
    border: `1px solid ${colors.error}`,
  },
};

const sizes = {
  sm: {
    fontSize: typography.fontSize.sm,
    padding: `${spacing.xs} ${spacing.md}`,
  },
  md: {
    fontSize: typography.fontSize.base,
    padding: `${spacing.sm} ${spacing.lg}`,
  },
  lg: {
    fontSize: typography.fontSize.lg,
    padding: `${spacing.md} ${spacing.xl}`,
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    whileHover={{ scale: 1.03 }}
    transition={{ type: 'spring', stiffness: 300 }}
    style={{
      ...variants[variant],
      ...sizes[size],
      borderRadius: 8,
      fontWeight: typography.fontWeight.semibold,
      fontFamily: typography.fontFamily.sans,
      cursor: 'pointer',
      outline: 'none',
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.button>
);
