import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLangStore from '../store/langStore';

export default function BackChevron({ color = '#fff', size = 22 }) {
  const isRTL = useLangStore(s => s.lang) === 'ar';
  const name = isRTL && Platform.OS !== 'ios' ? 'chevron-forward' : 'chevron-back';
  return <Ionicons name={name} size={size} color={color} />;
}
