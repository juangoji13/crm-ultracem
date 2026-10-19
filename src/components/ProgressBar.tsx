import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  unit?: string;
  label?: string;
  subtitle?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  unit = 'Ton',
  label,
  subtitle,
  className = '',
}) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  const isComplete = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-sm font-semibold text-[#003E78]">
          <span>{label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-[4px] font-bold border ${isComplete ? 'bg-amber-50 text-[#B7791F] border-amber-200' : 'bg-blue-50 text-[#1E83EC] border-blue-200'}`}>
            {percentage}%
          </span>
        </div>
      )}

      {/* Track and Fill bar */}
      <div className="w-full bg-[#E0E6ED] h-3 rounded-[5px] overflow-hidden relative">
        <div
          className={`h-full rounded-[5px] transition-all duration-300 ease-out ${
            isComplete
              ? 'bg-[#FFCA00]'
              : 'bg-gradient-to-r from-[#1E83EC] to-[#FFCA00]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
        <span>
          <strong className="text-slate-800 font-bold">{current}</strong> / {target} {unit}
        </span>
        {subtitle && <span className="text-[#4A5568]">{subtitle}</span>}
      </div>
    </div>
  );
};
