import React from 'react';

export const BrunchLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`flex items-center justify-center bg-[#fe6e00]/10 rounded-xl border border-[#fe6e00]/30 ${className}`}>
      <span className="text-xl">🥐</span>
    </div>
  );
};
