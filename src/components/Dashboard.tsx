import React from 'react';
import { ShoppingBag, Landmark, History as HistoryIcon, Utensils, UtensilsCrossed } from 'lucide-react';
import { motion } from 'motion/react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

export default function Dashboard({ setView }: DashboardProps) {
  return (
    <div className="relative p-6 bakery-grid min-h-[calc(100vh-64px)] flex flex-col justify-center gap-8 overflow-hidden">
      {/* Background Image Layer with Gradient Overlay */}
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
        <img 
          src="https://iili.io/BZC9wYP.md.webp" 
          alt="background" 
          className="w-full h-full object-cover scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bakery-cream/80 via-transparent to-bakery-cream/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-bakery-cream/40 via-transparent to-bakery-cream/40" />
      </div>

      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl border-4 border-bakery-warm overflow-hidden"
        >
          <img 
            src="https://iili.io/BZC9wYP.md.webp" 
            alt="Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <h2 className="text-3xl font-display font-black text-bakery-brown">Selamat Berjualan!</h2>
        <p className="text-bakery-brown-light font-medium">Pilih menu untuk memulai transaksi hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('sales')}
          className="group relative flex flex-col items-center justify-center p-8 bg-gradient-to-br from-bakery-orange to-[#ff9f43] text-white rounded-[2.5rem] shadow-2xl shadow-bakery-orange/40 overflow-hidden sm:col-span-2"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag size={100} />
          </div>
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-4 bg-white/20 rounded-3xl mb-4 backdrop-blur-sm"
          >
            <ShoppingBag className="w-10 h-10" />
          </motion.div>
          <span className="text-3xl font-display font-black">PENJUALAN</span>
          <span className="text-sm font-bold opacity-90 mt-1 uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">Buka Kasir Baru</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('reports')}
          className="sm:col-span-1 flex flex-col items-center justify-center p-8 bg-white border-2 border-bakery-warm text-bakery-brown rounded-[2.5rem] shadow-xl hover:shadow-bakery-orange/10 transition-all"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-bakery-warm to-white rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Landmark className="w-8 h-8 text-bakery-orange" />
          </div>
          <span className="text-lg font-black uppercase tracking-tight">Laporan Bagian</span>
          <span className="text-xs font-bold text-bakery-brown-light mt-1 bg-bakery-cream px-2 py-0.5 rounded-md">Modal & Bagi Hasil</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('menu')}
          className="sm:col-span-1 flex flex-col items-center justify-center p-8 bg-white border-2 border-bakery-warm text-bakery-brown rounded-[2.5rem] shadow-xl hover:shadow-bakery-orange/10 transition-all"
        >
          <div className="w-16 h-16 bg-gradient-to-tr from-bakery-warm to-white rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <UtensilsCrossed className="w-8 h-8 text-bakery-orange" />
          </div>
          <span className="text-lg font-black uppercase tracking-tight">Kelola Menu</span>
          <span className="text-xs font-bold text-bakery-brown-light mt-1 bg-bakery-cream px-2 py-0.5 rounded-md">Atur Daftar Jualan</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('history')}
          className="sm:col-span-2 group relative flex flex-center items-center justify-center p-6 bg-gradient-to-r from-bakery-brown to-bakery-brown-light text-white rounded-[2rem] shadow-xl overflow-hidden"
        >
          <div className="absolute left-6 opacity-20">
            <HistoryIcon size={24} />
          </div>
          <span className="text-lg font-black uppercase tracking-widest">Lihat Riwayat Transaksi</span>
        </motion.button>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-bakery-brown/40 uppercase tracking-widest">
        <div className="w-8 h-[1px] bg-bakery-brown/20" />
        <span>Roti Bakar Digital POS</span>
        <div className="w-8 h-[1px] bg-bakery-brown/20" />
      </div>
    </div>
  );
}
