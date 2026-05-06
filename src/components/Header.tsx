import React from 'react';
import { ChefHat, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  title: string;
}

export default function Header({ onBack, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-bakery-cream/90 backdrop-blur-md border-b border-bakery-brown/5 px-4 h-16 flex items-center">
      <div className="w-full max-w-5xl mx-auto flex items-center relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 p-2 text-bakery-brown hover:bg-bakery-warm rounded-full transition-all active:scale-90"
            aria-label="Kembali"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
        )}
        
        <div className={`flex items-center gap-3 ${onBack ? 'ml-12' : 'ml-2'} transition-all`}>
          <div className="hidden sm:flex w-9 h-9 bg-bakery-orange rounded-xl items-center justify-center shadow-lg shadow-bakery-orange/20">
            <ChefHat className="text-white w-5 h-5" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-bakery-brown">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
