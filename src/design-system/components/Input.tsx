import React from 'react';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost';
}

export const Input: React.FC<InputProps> = ({ variant = 'default', style, ...props }) => (
  <input
    style={{
      background: variant === 'ghost' ? 'transparent' : colors.surface,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: 6,
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.base,
      fontFamily: typography.fontFamily.sans,
      outline: 'none',
      ...style,
    }}
    {...props}
  />
);
