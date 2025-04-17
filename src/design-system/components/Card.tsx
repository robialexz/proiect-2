import React from 'react';
import { colors } from '../tokens/colors';

export const Card: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div
    style={{
      background: colors.card,
      borderRadius: 16,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
      padding: 24,
      border: `1px solid ${colors.border}`,
      color: colors.text,
    }}
  >
    {children}
  </div>
);
