import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className = "w-8 h-8" }: LoadingSpinnerProps) {
  return (
    <div className={`animate-spin rounded-full border-2 border-orange-200 border-t-orange-500 ${className}`} />
  );
}