import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, CheckCircle2 } from 'lucide-react';
import { CartItem, MenuItem, Sale } from '../types';

interface SalesProps {
  onComplete: (sale: Sale) => void;
  menuItems: MenuItem[];
}

export default function Sales({ onComplete, menuItems }: SalesProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [success, setSuccess] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer'>('Cash');

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const change = useMemo(() => {
    if (paymentMethod === 'Transfer') return 0;
    const cash = parseFloat(cashAmount) || 0;
    return Math.max(0, cash - total);
  }, [cashAmount, total, paymentMethod]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const handlePayment = () => {
    if (paymentMethod === 'Cash' && (!parseFloat(cashAmount) || parseFloat(cashAmount) < total)) return;
    
    const transactionCode = `TRX-${Date.now().toString().slice(-6)}`;
    const sale: Sale = {
      id: crypto.randomUUID(),
      transactionCode,
      date: new Date().toISOString(),
      items: cart,
      total,
      paymentMethod,
      status: 'completed'
    };

    setSuccess(true);
    setTimeout(() => {
      onComplete(sale);
      setCart([]);
      setCashAmount('');
      setShowCheckout(false);
      setSuccess(false);
    }, 2000);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] bg-bakery-orange flex flex-col items-center justify-center text-white p-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-24 h-24 mx-auto mb-6" />
          <h2 className="text-4xl font-display font-black mb-2">Transaksi Berhasil!</h2>
          <p className="text-xl opacity-90">Pesanan telah disimpan ke sistem.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bakery-grid">
        <h3 className="text-lg font-bold mb-6 px-2 text-bakery-brown flex items-center gap-2 border-l-4 border-bakery-orange">
          Daftar Menu
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(item)}
              className="p-5 rounded-3xl shadow-lg border border-bakery-warm bg-white text-left flex flex-col justify-between min-h-[160px] group transition-all hover:border-bakery-orange/30 hover:shadow-xl"
            >
              <div className="w-14 h-14 bg-bakery-warm rounded-2xl flex items-center justify-center text-3xl group-hover:bg-bakery-orange/10 group-hover:scale-110 transition-transform overflow-hidden">
                {item.icon?.startsWith('http') ? (
                  <img src={item.icon} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  item.icon
                )}
              </div>
              <div>
                <p className="font-bold text-base leading-tight text-bakery-brown group-hover:text-bakery-orange transition-colors">
                  {item.name}
                </p>
                <p className="text-sm font-bold text-bakery-brown-light mt-1">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Summary Panel */}
      <div className={`fixed inset-x-0 bottom-0 z-50 md:relative md:inset-auto md:w-[400px] md:border-l border-bakery-warm bg-white flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:shadow-none transition-transform duration-300 ${cart.length === 0 ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
        <div className="bg-bakery-cream/50 p-4 border-b border-bakery-warm shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-bakery-orange" />
              <span className="font-bold">Pesanan Saat Ini</span>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-[10px] font-black text-red-500 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider"
              >
                Reset
              </button>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[100px] max-h-[40vh] md:max-h-none">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8">
              <ShoppingCart size={48} className="mb-2" />
              <p className="text-sm font-bold">Keranjang Kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="flex items-center justify-between bg-white p-4 rounded-2xl border border-bakery-warm group"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm leading-tight">{item.name}</p>
                  <p className="text-xs font-bold text-bakery-orange">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-bakery-warm/30 rounded-xl p-1 border border-bakery-warm/50">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded-lg transition-colors"><Minus size={14}/></button>
                    <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded-lg transition-colors"><Plus size={14}/></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="p-6 bg-bakery-cream border-t border-bakery-warm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-bakery-brown-light">Total Pembayaran</span>
            <span className="text-2xl font-display font-black text-bakery-brown">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full bg-bakery-orange text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-bakery-orange/30 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
          >
            <CreditCard size={20} />
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bakery-brown/80 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-bakery-cream w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <p className="text-bakery-brown-light font-bold text-sm uppercase tracking-widest mb-1">Total Pembayaran</p>
                <h2 className="text-4xl font-display font-black text-bakery-brown">
                  Rp {total.toLocaleString('id-ID')}
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-bakery-brown-light mb-3">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('Cash')}
                      className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'Cash' ? 'bg-bakery-orange text-white shadow-lg' : 'bg-white text-bakery-brown-light border border-bakery-warm'}`}
                    >
                      <CreditCard size={18} /> Tunai
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Transfer')}
                      className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${paymentMethod === 'Transfer' ? 'bg-bakery-orange text-white shadow-lg' : 'bg-white text-bakery-brown-light border border-bakery-warm'}`}
                    >
                      <CheckCircle2 size={18} /> Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === 'Cash' ? (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-bakery-brown-light mb-2">Uang Diterima</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-bakery-brown-light">Rp</span>
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          placeholder="Input jumlah uang..."
                          className="w-full bg-white border-2 border-bakery-warm rounded-2xl py-4 pl-12 pr-4 text-xl font-bold text-bakery-brown focus:border-bakery-orange focus:ring-0 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="bg-bakery-warm/30 p-4 rounded-2xl border border-bakery-warm">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-bakery-brown-light">Kembalian</span>
                        <span className={`text-2xl font-display font-black ${change > 0 ? 'text-green-600' : 'text-bakery-brown-light'}`}>
                          Rp {change.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-bakery-orange/10 p-6 rounded-2xl border-2 border-dashed border-bakery-orange text-center">
                    <CheckCircle2 className="w-10 h-10 text-bakery-orange mx-auto mb-2" />
                    <p className="font-bold text-bakery-brown">Konfirmasi Transfer</p>
                    <p className="text-xs text-bakery-brown-light">Pastikan dana sudah masuk ke rekening sebelum konfirmasi.</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="py-4 rounded-2xl font-bold text-bakery-brown-light bg-bakery-warm/50 hover:bg-bakery-warm transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    disabled={paymentMethod === 'Cash' && (!parseFloat(cashAmount) || parseFloat(cashAmount) < total)}
                    onClick={handlePayment}
                    className="py-4 rounded-2xl font-bold text-white bg-bakery-brown shadow-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
                  >
                    Selesaikan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
