import { View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <View 
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
