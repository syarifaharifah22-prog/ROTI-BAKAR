/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import History from './components/History';
import Reports from './components/Reports';
import MenuManagement from './components/MenuManagement';
import { AppView, Sale, MenuItem } from './types';
import { MENU_ITEMS } from './constants';
import { supabase } from './lib/supabase';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [sales, setSales] = useState<Sale[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportsUnlocked, setIsReportsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passError, setPassError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ganti password sesuai permintaan
    if (passwordInput === '220602') {
      setIsReportsUnlocked(true);
      setPassError(false);
    } else {
      setPassError(true);
      setPasswordInput('');
    }
  };

  // Reset lock when leaving reports or menu
  useEffect(() => {
    if (view !== 'reports' && view !== 'menu') {
      setIsReportsUnlocked(false);
      setPasswordInput('');
      setPassError(false);
    }
  }, [view]);

  // Fetch initial data from Supabase
  useEffect(() => {
    let isMounted = true;
    
    // Safety timeout: Jika 10 detik tidak konek, anggap offline
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('Supabase request timed out. Switching to offline mode.');
        setIsLoading(false);
      }
    }, 10000);

    async function fetchData() {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Jika kredensial kosong, placeholder, atau client gagal inisialisasi
      if (!supabase || !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || supabaseUrl === '') {
        if (!isMounted) return;
        console.warn('Supabase credentials missing. Falling back to local storage.');
        const savedSales = localStorage.getItem('bakery_sales');
        const savedMenu = localStorage.getItem('bakery_menu');
        if (savedSales) setSales(JSON.parse(savedSales));
        if (savedMenu) setMenuItems(JSON.parse(savedMenu));
        else setMenuItems(MENU_ITEMS);
        setIsLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      try {
        setIsLoading(true);
        
        if (!supabase) throw new Error('Supabase client not initialized');

        // Fetch Sales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .order('date', { ascending: false });
        
        if (salesError) throw salesError;
        if (salesData) setSales(salesData);

        // Fetch Menu
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*');
        
        if (menuError) throw menuError;
        
        if (menuData && menuData.length > 0) {
          setMenuItems(menuData);
        } else {
          setMenuItems(MENU_ITEMS);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        const savedSales = localStorage.getItem('bakery_sales');
        const savedMenu = localStorage.getItem('bakery_menu');
        if (savedSales) setSales(JSON.parse(savedSales));
        if (savedMenu) setMenuItems(JSON.parse(savedMenu));
        else setMenuItems(MENU_ITEMS);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleSaleComplete = async (sale: Sale) => {
    try {
      // Optimistic update
      setSales(prev => [sale, ...prev]);
      setView('dashboard');

      // Save to Supabase
      if (supabase) {
        const { error } = await supabase
          .from('sales')
          .insert([{
            id: sale.id,
            date: sale.date,
            items: sale.items,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            transactionCode: sale.transactionCode,
            status: sale.status
          }]);

        if (error) {
          console.error('Supabase Insert Error:', error);
          throw error;
        }
      }
      
      localStorage.setItem('bakery_sales', JSON.stringify([sale, ...sales]));
    } catch (error) {
      console.error('Error saving sale to Supabase:', error);
      alert('Gagal menyimpan ke cloud. Periksa koneksi atau kolom tabel Supabase.');
    }
  };

  const handleUpdateMenu = async (newMenu: MenuItem[]) => {
    try {
      setMenuItems(newMenu);
      
      // Upsert menu items to Supabase
      if (supabase) {
        const { error } = await supabase
          .from('menu_items')
          .upsert(newMenu);

        if (error) throw error;
      }
      
      localStorage.setItem('bakery_menu', JSON.stringify(newMenu));
    } catch (error) {
      console.error('Error updating menu in Supabase:', error);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'sales': return 'Kasir Baru';
      case 'history': return 'Riwayat Transaksi';
      case 'reports': return 'Laporan Bagi Hasil';
      case 'menu': return 'Kelola Menu';
      default: return 'Rottking';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bakery-cream flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-bakery-orange border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-bakery-warm rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-bakery-brown font-display font-black text-2xl animate-pulse">Menghubungkan...</p>
            <p className="text-bakery-brown-light text-sm">Pastikan Supabase URL & Key sudah benar di menu Settings.</p>
          </div>
          <button 
            onClick={() => setIsLoading(false)}
            className="px-6 py-3 bg-white border-2 border-bakery-warm text-bakery-brown rounded-2xl font-bold text-sm shadow-sm hover:bg-bakery-warm/20 transition-all"
          >
            Gunakan Offline Saja
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bakery-cream flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white min-h-screen shadow-2xl relative flex flex-col border-x border-bakery-warm">
        <Header 
          title={getTitle()} 
          onBack={view !== 'dashboard' ? () => setView('dashboard') : undefined} 
        />
        
        <main className="flex-1 overflow-hidden">
          {view === 'dashboard' && <Dashboard setView={setView} />}
          {view === 'sales' && <Sales onComplete={handleSaleComplete} menuItems={menuItems} />}
          {view === 'history' && <History sales={sales} />}
          {view === 'reports' && (
            isReportsUnlocked ? (
              <Reports sales={sales} />
            ) : (
              <AuthGate 
                passwordInput={passwordInput} 
                setPasswordInput={setPasswordInput} 
                handlePasswordSubmit={handlePasswordSubmit} 
                passError={passError} 
                setPassError={setPassError} 
                title="Laporan Terkunci"
                subtitle="Masukkan PIN untuk melihat laporan keuangan"
              />
            )
          )}
          {view === 'menu' && (
            isReportsUnlocked ? (
              <MenuManagement menuItems={menuItems} onUpdateMenu={handleUpdateMenu} />
            ) : (
              <AuthGate 
                passwordInput={passwordInput} 
                setPasswordInput={setPasswordInput} 
                handlePasswordSubmit={handlePasswordSubmit} 
                passError={passError} 
                setPassError={setPassError} 
                title="Kelola Menu Terkunci"
                subtitle="Masukkan PIN untuk mengubah menu & harga"
              />
            )
          )}
        </main>
      </div>
    </div>
  );
}

function AuthGate({ 
  passwordInput, 
  setPasswordInput, 
  handlePasswordSubmit, 
  passError, 
  setPassError,
  title,
  subtitle
}: { 
  passwordInput: string; 
  setPasswordInput: (v: string) => void; 
  handlePasswordSubmit: (e: React.FormEvent) => void;
  passError: boolean;
  setPassError: (v: boolean) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-bakery-cream/50 min-h-[400px]">
      <div className="w-full max-w-xs bg-white p-8 rounded-3xl shadow-xl border-2 border-bakery-warm text-center space-y-6">
        <div className="w-16 h-16 bg-bakery-orange/10 text-bakery-orange rounded-full flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-black text-bakery-brown text-lg">{title}</h3>
          <p className="text-[10px] text-bakery-brown-light font-bold uppercase tracking-wider">{subtitle}</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (passError) setPassError(false);
            }}
            placeholder="PIN"
            className={`w-full text-center text-2xl tracking-[0.5em] py-3 rounded-2xl border-2 focus:ring-0 transition-all ${passError ? 'border-red-500 bg-red-50 text-red-500' : 'border-bakery-warm focus:border-bakery-orange text-bakery-brown'}`}
            autoFocus
          />
          {passError && <p className="text-red-500 text-[10px] font-bold">Pin salah, coba lagi.</p>}
          <button
            type="submit"
            className="w-full py-4 bg-bakery-brown text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm"
          >
            Buka Akses
          </button>
        </form>
      </div>
    </div>
  );
}

