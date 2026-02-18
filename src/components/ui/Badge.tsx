import React from 'react';
import { Star } from 'lucide-react';

interface BadgeProps {
    text: string;
}

export const Badge: React.FC<BadgeProps> = ({ text }) => (
    <div className="absolute top-4 right-4 bg-amber-400 text-[#007ACC] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 z-10 shadow-sm animate-pulse">
        <Star size={10} fill="currentColor" /> {text}
    </div>
);
