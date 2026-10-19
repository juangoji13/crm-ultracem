import React from 'react';
import { RecencyStatus } from '@/lib/types';

interface RecencyBadgeProps {
  status?: RecencyStatus;
  days?: number;
  className?: string;
}

export const RecencyBadge: React.FC<RecencyBadgeProps> = ({ status = 'optimo', days, className = '' }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'optimo':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-[#38A169]',
          label: days !== undefined ? `Hace ${days} días` : 'Activo (<15d)',
        };
      case 'alerta':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          dot: 'bg-[#FFCA00]',
          label: days !== undefined ? `Hace ${days} días` : 'Alerta (16-30d)',
        };
      case 'critico':
      case 'inactivo':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          dot: 'bg-[#E53E3E]',
          label: days !== undefined ? `Hace ${days} días` : 'Crítico (>30d)',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
};
