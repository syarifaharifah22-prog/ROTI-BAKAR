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
      default: return 'Kasir Roti Bakar';
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
          {view === 'reports' && <Reports sales={sales} />}
          {view === 'menu' && <MenuManagement menuItems={menuItems} onUpdateMenu={handleUpdateMenu} />}
        </main>
      </div>
    </div>
  );
}

