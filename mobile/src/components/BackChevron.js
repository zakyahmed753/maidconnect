import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import useLangStore from '../store/langStore';

export default function BackChevron({ color = '#fff', size = 22 }) {
  const isRTL = useLangStore(s => s.lang) === 'ar';
  return <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={size} color={color} />;
}
