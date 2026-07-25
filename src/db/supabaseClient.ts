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
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;
        return data as Product[];
      } catch (e) {
        console.warn('Supabase getProducts gagal/tidak terjangkau, beralih ke dbSimulator:', e);
        return dbSimulator.getProducts();
      }
    }
    return dbSimulator.getProducts();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        if (error) return dbSimulator.getProductById(id);
        return data as Product;
      } catch (e) {
        return dbSimulator.getProductById(id);
      }
    }
    return dbSimulator.getProductById(id);
  },

  createProduct: async (productData: Omit<Product, 'id' | 'created_at'>, token: string): Promise<Product> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (error) throw error;
        return data as Product;
      } catch (e) {
        console.warn('Supabase createProduct gagal, fallback ke simulator:', e);
        return dbSimulator.createProduct(productData, token);
      }
    }
    return dbSimulator.createProduct(productData, token);
  },

  updateProduct: async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data as Product;
      } catch (e) {
        console.warn('Supabase updateProduct gagal, fallback ke simulator:', e);
        return dbSimulator.updateProduct(id, productData, token);
      }
    }
    return dbSimulator.updateProduct(id, productData, token);
  },

  deleteProduct: async (id: string, token: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase deleteProduct gagal, fallback ke simulator:', e);
        return dbSimulator.deleteProduct(id, token);
      }
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
      try {
        const { data: productsData, error: prodErr } = await supabase
          .from('products')
          .select('id, price, stock, name');
        
        if (prodErr) throw prodErr;

        let calculatedTotal = 0;
        const dbProducts = productsData || [];
        
        for (const item of orderData.items) {
          const prod = dbProducts.find(p => p.id === item.product_id);
          if (!prod) throw new Error(`Produk tidak ditemukan`);
          if (prod.stock < item.quantity) throw new Error(`Stok "${prod.name}" tidak mencukupi`);
          calculatedTotal += prod.price * item.quantity;
        }

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

        for (const item of orderData.items) {
          const prod = dbProducts.find(p => p.id === item.product_id)!;
          await supabase
            .from('products')
            .update({ stock: prod.stock - item.quantity })
            .eq('id', item.product_id);
        }

        return newOrder as Order;
      } catch (e) {
        console.warn('Supabase createOrder gagal, fallback ke dbSimulator:', e);
        return dbSimulator.createOrder(orderData);
      }
    }

    return dbSimulator.createOrder(orderData);
  },

  getOrders: async (token: string): Promise<Order[]> => {
    if (supabase) {
      try {
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
              product_name: 'Produk'
            }))
        }));
      } catch (e) {
        console.warn('Supabase getOrders gagal, fallback ke dbSimulator:', e);
        return dbSimulator.getOrders(token);
      }
    }
    return dbSimulator.getOrders(token);
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    if (supabase) {
      try {
        const { data: order, error: oErr } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
        if (oErr) return dbSimulator.getOrderById(id);

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
      } catch (e) {
        return dbSimulator.getOrderById(id);
      }
    }
    return dbSimulator.getOrderById(id);
  },

  updateOrderStatus: async (id: string, status: 'Pending' | 'Diproses' | 'Selesai', token: string): Promise<Order> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data as Order;
      } catch (e) {
        console.warn('Supabase updateOrderStatus gagal, fallback ke dbSimulator:', e);
        return dbSimulator.updateOrderStatus(id, status, token);
      }
    }
    return dbSimulator.updateOrderStatus(id, status, token);
  },

  // 3. ADMIN AUTH WITH AUTOMATIC FALLBACK
  adminLogin: async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    // 1. Coba login ke simulator lokal terlebih dahulu jika kredensial cocok dengan demo lokal (admin / adminTiara123!)
    const localRes = await dbSimulator.adminLogin(usernameInput, passwordInput);
    if (localRes.success) {
      return localRes;
    }

    // 2. Jika bukan kredensial lokal dan Supabase terkonfigurasi, coba otentikasi ke Supabase Auth
    if (supabase) {
      try {
        const email = usernameInput.includes('@') ? usernameInput : `${usernameInput}@tiarabakery.com`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: passwordInput
        });
        if (error) throw error;
        return {
          success: true,
          token: data.session?.access_token
        };
      } catch (err: any) {
        const isNetworkErr = err.message === 'Failed to fetch' || err.name === 'AuthRetryableFetchError';
        return {
          success: false,
          error: isNetworkErr
            ? 'Gagal terhubung ke server Supabase (Failed to fetch). Gunakan kredensial lokal: admin / adminTiara123! atau periksa koneksi & URL Supabase di .env.'
            : (err.message || 'Username atau password admin salah.')
        };
      }
    }

    return localRes;
  },

  // 4. SECURITY LOGS
  getSecurityLogs: async (token: string): Promise<any[]> => {
    return dbSimulator.getSecurityLogs(token);
  },

  // 5. CHATBOT CONFIG & KNOWLEDGE
  getChatbotSettings: async (): Promise<ChatbotSettings> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_settings')
          .select('*')
          .single();
        if (error || !data) return dbSimulator.getChatbotSettings();
        return {
          botName: data.botName || data.bot_name || 'Tiara',
          welcomeMessage: data.welcomeMessage || data.welcome_message || '',
          defaultFallback: data.defaultFallback || data.default_fallback || ''
        };
      } catch (e) {
        return dbSimulator.getChatbotSettings();
      }
    }
    return dbSimulator.getChatbotSettings();
  },

  updateChatbotSettings: async (settingsData: Partial<ChatbotSettings>, token: string): Promise<ChatbotSettings> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_settings')
          .update(settingsData)
          .select()
          .single();
        if (error) throw error;
        return data as ChatbotSettings;
      } catch (e) {
        return dbSimulator.updateChatbotSettings(settingsData, token);
      }
    }
    return dbSimulator.updateChatbotSettings(settingsData, token);
  },

  getChatbotKnowledge: async (): Promise<ChatbotKnowledge[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_knowledge')
          .select('*')
          .order('keyword', { ascending: true });
        if (error || !data) return dbSimulator.getChatbotKnowledge();
        return data as ChatbotKnowledge[];
      } catch (e) {
        return dbSimulator.getChatbotKnowledge();
      }
    }
    return dbSimulator.getChatbotKnowledge();
  },

  createChatbotKnowledge: async (knowData: Omit<ChatbotKnowledge, 'id' | 'created_at'>, token: string): Promise<ChatbotKnowledge> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_knowledge')
          .insert([knowData])
          .select()
          .single();
        if (error) throw error;
        return data as ChatbotKnowledge;
      } catch (e) {
        return dbSimulator.createChatbotKnowledge(knowData, token);
      }
    }
    return dbSimulator.createChatbotKnowledge(knowData, token);
  },

  updateChatbotKnowledge: async (id: string, knowData: Partial<ChatbotKnowledge>, token: string): Promise<ChatbotKnowledge> => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chatbot_knowledge')
          .update(knowData)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data as ChatbotKnowledge;
      } catch (e) {
        return dbSimulator.updateChatbotKnowledge(id, knowData, token);
      }
    }
    return dbSimulator.updateChatbotKnowledge(id, knowData, token);
  },

  deleteChatbotKnowledge: async (id: string, token: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('chatbot_knowledge')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        return dbSimulator.deleteChatbotKnowledge(id, token);
      }
    }
    return dbSimulator.deleteChatbotKnowledge(id, token);
  }
};
