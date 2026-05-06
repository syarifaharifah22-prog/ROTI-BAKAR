import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, UtensilsCrossed } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuManagementProps {
  menuItems: MenuItem[];
  onUpdateMenu: (items: MenuItem[]) => void;
}

export default function MenuManagement({ menuItems, onUpdateMenu }: MenuManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    icon: '🍞'
  });

  const handleSave = () => {
    if (!formData.name || !formData.price) return;

    if (editingId) {
      onUpdateMenu(menuItems.map(item => 
        item.id === editingId ? { ...item, name: formData.name, price: parseInt(formData.price), icon: formData.icon } : item
      ));
      setEditingId(null);
    } else {
      const newItem: MenuItem = {
        id: crypto.randomUUID(),
        name: formData.name,
        price: parseInt(formData.price),
        category: 'Roti',
        icon: formData.icon
      };
      onUpdateMenu([...menuItems, newItem]);
    }

    setFormData({ name: '', price: '', icon: '🍞' });
    setIsAdding(false);
  };

  const startEdit = (item: MenuItem) => {
    setFormData({ name: item.name, price: item.price.toString(), icon: item.icon || '🍞' });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const deleteItem = (id: string) => {
    if (confirm('Hapus menu ini?')) {
      onUpdateMenu(menuItems.filter(item => item.id !== id));
    }
  };

  return (
    <div className="p-4 space-y-6 bakery-grid min-h-[calc(100vh-64px)] pb-20 overflow-y-auto">
      <div className="bg-bakery-orange p-6 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black">Daftar Menu</h2>
          <p className="text-sm opacity-80">Tambah atau ubah menu jualan</p>
        </div>
        <UtensilsCrossed className="w-12 h-12 opacity-20" />
      </div>

      {!isAdding ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="w-full py-4 bg-white border-2 border-dashed border-bakery-orange text-bakery-orange rounded-2xl font-bold flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Tambah Menu Baru
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border-2 border-bakery-orange shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between uppercase tracking-widest text-[10px] font-black text-bakery-orange">
            <span>{editingId ? 'Edit Menu' : 'Input Menu Baru'}</span>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-bakery-brown-light">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nama Menu (Misal: Roti Cokelat Keju)"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-bakery-cream border border-bakery-warm rounded-xl font-bold placeholder:font-normal"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Harga"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="flex-1 p-3 bg-bakery-cream border border-bakery-warm rounded-xl font-bold"
              />
              <input
                type="text"
                placeholder="Ikon"
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-16 p-3 bg-bakery-cream border border-bakery-warm rounded-xl text-center text-xl"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-bakery-orange text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Simpan Menu
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-bakery-warm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bakery-warm rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                {item.icon?.startsWith('http') ? (
                  <img src={item.icon} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  item.icon
                )}
              </div>
              <div>
                <p className="font-bold text-bakery-brown">{item.name}</p>
                <p className="text-sm font-bold text-bakery-orange">Rp {item.price.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEdit(item)}
                className="p-2 text-bakery-brown-light hover:bg-bakery-warm rounded-lg"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => deleteItem(item.id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
