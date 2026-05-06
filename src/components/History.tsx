import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Receipt, ChevronRight, Search, RotateCcw } from 'lucide-react';
import { Sale } from '../types';

interface HistoryProps {
  sales: Sale[];
}

export default function History({ sales }: HistoryProps) {
  const [searchDate, setSearchDate] = useState<string>('');

  const filteredSales = React.useMemo(() => {
    let result = [...sales];
    if (searchDate) {
      result = result.filter(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate === searchDate;
      });
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [sales, searchDate]);

  const dailyTotal = sales
    .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center bakery-grid min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-bakery-warm rounded-3xl flex items-center justify-center mb-6 opacity-50">
          <Receipt className="w-10 h-10 text-bakery-brown-light" />
        </div>
        <h3 className="text-xl font-bold text-bakery-brown mb-2">Belum Ada Transaksi</h3>
        <p className="text-bakery-brown-light max-w-[200px]">Mulailah berjualan dan data akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bakery-grid min-h-[calc(100vh-64px)]">
      {/* Daily Summary Card */}
      <div className="bg-bakery-orange p-6 rounded-[2rem] text-white shadow-xl shadow-bakery-orange/20 relative overflow-hidden">
        <LandmarkIcon className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Calendar size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Penjualan Hari Ini</span>
          </div>
          <h2 className="text-4xl font-display font-black">
            Rp {dailyTotal.toLocaleString('id-ID')}
          </h2>
          <p className="text-sm mt-1 opacity-90">{sales.length} Transaksi Selesai</p>
        </div>
      </div>

      {/* Date Search Section */}
      <div className="bg-white p-4 rounded-3xl border border-bakery-warm shadow-md space-y-3">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-bakery-brown-light flex items-center gap-2">
            <Search size={12} />
            Cari Riwayat Tanggal
          </label>
          {searchDate && (
            <button 
              onClick={() => setSearchDate('')}
              className="text-[10px] font-bold text-bakery-orange flex items-center gap-1"
            >
              <RotateCcw size={10} /> Reset
            </button>
          )}
        </div>
        <input 
          type="date" 
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="w-full p-3 bg-bakery-cream/50 border border-bakery-warm rounded-xl font-bold text-bakery-brown focus:ring-2 focus:ring-bakery-orange/20 outline-none transition-all"
        />
      </div>

      <div className="space-y-4 pb-20">
        <h3 className="text-sm font-bold text-bakery-brown-light uppercase tracking-widest px-1">
          {searchDate ? `Hasil Pencarian (${filteredSales.length})` : 'Riwayat Transaksi'}
        </h3>
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-bakery-warm border-dashed">
            <p className="text-bakery-brown-light font-medium italic">Tidak ada transaksi di tanggal ini.</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <motion.div
              key={sale.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-5 rounded-3xl border border-bakery-warm shadow-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-sm text-bakery-orange">{sale.transactionCode}</span>
                  <div className="flex gap-1">
                    <span className="text-[10px] bg-bakery-warm text-bakery-brown-light px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] bg-bakery-orange/10 text-bakery-orange px-2 py-0.5 rounded-full font-bold">
                      {new Date(sale.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sale.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-bakery-brown-light font-medium">
                  {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </p>
                <p className="text-lg font-bold text-bakery-brown">
                  Rp {sale.total.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-bakery-warm/30 flex items-center justify-center text-bakery-brown-light">
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function LandmarkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
