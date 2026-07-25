// Supabase Client Wrapper dengan fallback otomatis ke dbSimulator
// Ini menjamin "Security by Design" dan portabilitas: aplikasi dapat dijalankan secara instan secara offline/lokal,
// dan secara mulus bermigrasi ke database Supabase Cloud hanya dengan mengisi file .env.

import { createClient } from '@supabase/supabase-js';
import { dbSimulator } from './dbSimulator';
import type { Product, Order, OrderItem, ChatbotSettings, ChatbotKnowledge } from './dbSimulator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

// Inisialisasi client Supabase asli jika kredensial diisi
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Ekspor tipe data
export type { Product, Order, OrderItem, ChatbotSettings, ChatbotKnowledge };

// Unified DB Interface: Menjamin kode frontend memanggil fungsi database yang sama
export const db = {
  isUsingSupabase: () => isSupabaseConfigured,

  // 1. PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Product[];
    }
    return dbSimulator.getProducts();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Product;
    }
    return dbSimulator.getProductById(id);
  },

  createProduct: async (productData: Omit<Product, 'id' | 'created_at'>, token: string): Promise<Product> => {
    if (supabase) {
      // Pada Supabase asli, keamanan (RLS) ditangani di database.
      // Kami mengirim request menggunakan JWT token user.
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    }
    return dbSimulator.createProduct(productData, token);
  },

  updateProduct: async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    }
    return dbSimulator.updateProduct(id, productData, token);
  },

  deleteProduct: async (id: string, token: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    return dbSimulator.deleteProduct(id, token);
  },

  // 2. ORDERS & ORDER ITEMS
  createOrder: async (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_method: 'Ambil Sendiri' | 'Kirim ke Rumah';
    address?: string;
    items: { product_id: string; quantity: number }[];
  }): Promise<Order> => {
    if (supabase) {
      // 1. Panggil RPC Supabase atau lakukan transaksi manual.
      // Untuk keamanan transaksi dan perhitungan harga riil, idealnya menggunakan Database Function di Supabase
      // guna mencocokkan harga asli di database dan memotong stok.
      // Berikut simulasi transaksinya di sisi client (tetap tervalidasi karena RLS dan constraint di database):
      const { data: productsData, error: prodErr } = await supabase
        .from('products')
        .select('id, price, stock, name');
      
      if (prodErr) throw prodErr;

      let calculatedTotal = 0;
      const dbProducts = productsData || [];
      
      // Hitung total harga riil (Security Check)
      for (const item of orderData.items) {
        const prod = dbProducts.find(p => p.id === item.product_id);
        if (!prod) throw new Error(`Produk tidak ditemukan`);
        if (prod.stock < item.quantity) throw new Error(`Stok "${prod.name}" tidak mencukupi`);
        calculatedTotal += prod.price * item.quantity;
      }

      // a. Simpan Order
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          delivery_method: orderData.delivery_method,
          address: orderData.address,
          total_price: calculatedTotal,
          status: 'Pending'
        }])
        .select()
        .single();
      
      if (orderErr) throw orderErr;

      // b. Simpan Order Items & Kurangi Stok Produk (secara terpisah karena demo client-side)
      const itemsToInsert = orderData.items.map(item => {
        const prod = dbProducts.find(p => p.id === item.product_id)!;
        return {
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: prod.price
        };
      });

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert);
      
      if (itemsErr) throw itemsErr;

      // c. Update stok produk
      for (const item of orderData.items) {
        const prod = dbProducts.find(p => p.id === item.product_id)!;
        await supabase
          .from('products')
          .update({ stock: prod.stock - item.quantity })
          .eq('id', item.product_id);
      }

      return newOrder as Order;
    }

    return dbSimulator.createOrder(orderData);
  },

  getOrders: async (token: string): Promise<Order[]> => {
    if (supabase) {
      const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (oErr) throw oErr;

      const { data: items, error: iErr } = await supabase
        .from('order_items')
        .select('*');
      if (iErr) throw iErr;

      return (orders as Order[]).map(order => ({
        ...order,
        items: (items as any[] || [])
          .filter(item => item.order_id === order.id)
          .map(item => ({
            ...item,
            product_name: 'Produk' // pada Supabase asli, gunakan join query
          }))
      }));
    }
    return dbSimulator.getOrders(token);
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    if (supabase) {
      const { data: order, error: oErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      if (oErr) return null;

      const { data: items, error: iErr } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', id);
      
      if (iErr) return order as Order;

      return {
        ...order,
        items: (items as any[]).map(item => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Produk Selesai',
          quantity: item.quantity,
          price_at_purchase: item.price_at_purchase
        }))
      } as Order;
    }
    return dbSimulator.getOrderById(id);
  },

  updateOrderStatus: async (id: string, status: 'Pending' | 'Diproses' | 'Selesai', token: string): Promise<Order> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Order;
    }
    return dbSimulator.updateOrderStatus(id, status, token);
  },

  // 3. ADMIN AUTH
  adminLogin: async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    if (supabase) {
      // Pada Supabase asli, gunakan supabase.auth.signInWithPassword
      // Dan return session token JWT dari Supabase.
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${usernameInput}@tiarabakery.com`, // Simulasi email dari username
          password: passwordInput
        });
        if (error) throw error;
        return {
          success: true,
          token: data.session?.access_token
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Login gagal.'
        };
      }
    }
    return dbSimulator.adminLogin(usernameInput, passwordInput);
  },

  // 4. SECURITY LOGS
  getSecurityLogs: async (token: string): Promise<any[]> => {
    if (supabase) {
      // Logs di Supabase asli dapat dilihat langsung melalui dasbor monitoring Supabase.
      // Kita return list kosong atau gabungan simulator untuk kepentingan UI.
      return dbSimulator.getSecurityLogs(token);
    }
    return dbSimulator.getSecurityLogs(token);
  },

  // 5. CHATBOT CONFIG & KNOWLEDGE
  getChatbotSettings: async (): Promise<ChatbotSettings> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .single();
      // fallback if table doesn't exist or is empty
      if (error) return dbSimulator.getChatbotSettings();
      return data as ChatbotSettings;
    }
    return dbSimulator.getChatbotSettings();
  },

  updateChatbotSettings: async (settingsData: Partial<ChatbotSettings>, token: string): Promise<ChatbotSettings> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('chatbot_settings')
        .update(settingsData)
        .select()
        .single();
      if (error) throw error;
      return data as ChatbotSettings;
    }
    return dbSimulator.updateChatbotSettings(settingsData, token);
  },

  getChatbotKnowledge: async (): Promise<ChatbotKnowledge[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('chatbot_knowledge')
        .select('*')
        .order('keyword', { ascending: true });
      if (error) return dbSimulator.getChatbotKnowledge();
      return data as ChatbotKnowledge[];
    }
    return dbSimulator.getChatbotKnowledge();
  },

  createChatbotKnowledge: async (knowData: Omit<ChatbotKnowledge, 'id' | 'created_at'>, token: string): Promise<ChatbotKnowledge> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('chatbot_knowledge')
        .insert([knowData])
        .select()
        .single();
      if (error) throw error;
      return data as ChatbotKnowledge;
    }
    return dbSimulator.createChatbotKnowledge(knowData, token);
  },

  updateChatbotKnowledge: async (id: string, knowData: Partial<ChatbotKnowledge>, token: string): Promise<ChatbotKnowledge> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('chatbot_knowledge')
        .update(knowData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ChatbotKnowledge;
    }
    return dbSimulator.updateChatbotKnowledge(id, knowData, token);
  },

  deleteChatbotKnowledge: async (id: string, token: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase
        .from('chatbot_knowledge')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
    return dbSimulator.deleteChatbotKnowledge(id, token);
  }
};
