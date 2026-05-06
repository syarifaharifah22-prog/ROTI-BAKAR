export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  icon?: string;
};

export type CartItem = MenuItem & {
  quantity: number;
};

export type Sale = {
  id: string;
  transactionCode?: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'Cash' | 'Transfer';
  status?: 'completed';
};

export type AppView = 'dashboard' | 'sales' | 'history' | 'reports' | 'menu';
