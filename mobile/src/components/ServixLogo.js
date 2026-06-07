import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, G, Polygon, Ellipse, Text as SvgText } from 'react-native-svg';

export default function ServixLogo({ width = 160, style }) {
  const height = Math.round(width * (330 / 690));
  return (
    <Svg width={width} height={height} viewBox="0 0 690 330" style={style}>
      <Defs>
        <LinearGradient id="gg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4A843"/>
          <Stop offset="100%" stopColor="#C49A2A"/>
        </LinearGradient>
        <LinearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#2A1800"/>
          <Stop offset="100%" stopColor="#3D2000"/>
        </LinearGradient>
      </Defs>
      <Rect width="680" height="320" rx="16" fill="url(#bg)"/>
      <G transform="translate(130,160)">
        <Rect x="-28" y="-18" width="56" height="42" rx="3" fill="#E8B87A" opacity="0.9"/>
        <Polygon points="-38,-18 0,-54 38,-18" fill="#C0503A" opacity="0.95"/>
        <Rect x="-9" y="6" width="18" height="18" rx="2" fill="#A0622A"/>
        <Rect x="-24" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
        <Rect x="10" y="-10" width="14" height="12" rx="2" fill="#6AABCC" opacity="0.85"/>
        <Ellipse cx="-46" cy="-4" rx="18" ry="20" fill="#5A9E3A" opacity="0.95"/>
        <Ellipse cx="46" cy="4" rx="14" ry="16" fill="#4A8E2A" opacity="0.9"/>
      </G>
      <SvgText x="212" y="148" fontFamily="Georgia, serif" fontSize="78" fontWeight="700" fill="url(#gg)" letterSpacing="-1">Servix</SvgText>
      <SvgText x="214" y="178" fontFamily="Arial, sans-serif" fontSize="13" fill="#C49A2A" opacity="0.8" letterSpacing="4">PREMIUM DOMESTIC STAFFING</SvgText>
      <Rect x="214" y="192" width="340" height="1" rx="0.5" fill="#C49A2A" opacity="0.3"/>
    </Svg>
  );
}
