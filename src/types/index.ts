export type Customer = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  notes?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
};

export type Item = {
  id: number;
  owner_customer_id: number;
  title: string;
  description?: string;
  category?: string;
  size?: string;
  brand?: string;
  color?: string;
  start_price: number;
  image_url?: string;
  status: string;
  is_in_store: number;
  is_online_visible: number;
  sold_at?: string | null;
  created_at?: string;
  updated_at?: string;
  first_name: string;
  last_name: string;
  customer_number?: string;
  verkaufspreis?: number;
  verkauferAnteil?: number;
  shopAnteil?: number;
};


export type CustomerFormData = {
  customer_number: string;
  first_name: string;
  last_name: string;
  city: string;
  postal_code: string;
  street: string;
  house_number: string;
  phone: string;
  email: string;
};

export type ItemFormData = {
  owner_customer_id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  brand: string;
  color: string;
  price: string;
  is_online_visible: boolean;
};

export type Sale = {
  id: number;
  item_id: number;
  owner_customer_id: number;
  sale_date: string;
  sale_price: number;
  owner_amount: number;
  shop_amount: number;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes?: string;
  title: string;
  brand?: string;
  category?: string;
  customer_number?: string;
  first_name: string;
  last_name: string;
  buyer_customer_id: number;
};

export type SaleFormData = {
  item_id: string;
  sale_price: string;
  sale_type: 'store' | 'online';
  payment_method: 'cash' | 'bank_transfer';
  notes: string;
  buyer_customer_id: string;
};

export type CustomerCredit = {
  id: number;
  customer_number: string;
  first_name: string;
  last_name: string;
  sold_items_count: number;
  credit_balance: number;
  total_credit_earned: number;
  total_credit_spent: number;
  bought_items_count: number;
  available_items_count: number;
  total_items_count: number;
};

export type ShopItem = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  size?: string;
  brand?: string;
  color?: string;
  price: number;
  image_url?: string;
  status: string;
  is_in_store: number;
  is_online_visible: number;
  created_at?: string;
  updated_at?: string;
};

export type CartItem = ShopItem;

export type CheckoutFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  notes: string;
};

export type ShopOrder = {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  street: string;
  house_number?: string;
  postal_code: string;
  city: string;
  payment_method: 'bank_transfer';
  order_status: 'open' | 'reserved' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
  items: {
    id: number;
    order_id: number;
    item_id: number;
    item_title: string;
    item_price: number;
    created_at: string;
  }[];
};

export type AdminShopOrderItem = {
  id: number;
  order_id: number;
  item_id: number;
  item_title: string;
  item_price: number;
  created_at: string;
};

export type AdminShopOrder = {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  street: string;
  house_number?: string;
  postal_code: string;
  city: string;
  payment_method: 'bank_transfer';
  order_status: 'open' | 'reserved' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: AdminShopOrderItem[];
};


