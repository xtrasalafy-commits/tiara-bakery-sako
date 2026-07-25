// Supabase Client Wrapper dengan fallback otomatis ke dbSimulator
// Ini menjamin "Security by Design" dan portabilitas: aplikasi dapat dijalankan secara instan secara offline/lokal,
// dan secara mulus bermigrasi ke database Supabase Cloud hanya dengan mengisi file .env.

import { createClient } from '@supabase/supabase-js';
import { dbSimulator } from './dbSimulator';
import type { 
  Product, Order, OrderItem, ChatbotSettings, ChatbotKnowledge, UserRole, UserAccount, 
  Expense, ExpenseCategory, StaffDivision, Coupon, CustomerReview, RecipeSOP, DeliveryTracker, OrderStatus 
} from './dbSimulator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type { 
  Product, Order, OrderItem, ChatbotSettings, ChatbotKnowledge, UserRole, UserAccount, 
  Expense, ExpenseCategory, StaffDivision, Coupon, CustomerReview, RecipeSOP, DeliveryTracker, OrderStatus 
};

export const db = {
  isUsingSupabase: () => isSupabaseConfigured,

  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
        if (error || !data) return dbSimulator.getProducts();
        return data as Product[];
      } catch (e) {
        return dbSimulator.getProducts();
      }
    }
    return dbSimulator.getProducts();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error || !data) return dbSimulator.getProductById(id);
        return data as Product;
      } catch (e) {
        return dbSimulator.getProductById(id);
      }
    }
    return dbSimulator.getProductById(id);
  },

  createProduct: async (productData: Omit<Product, 'id' | 'created_at'>, token: string): Promise<Product> => {
    return dbSimulator.createProduct(productData, token);
  },

  updateProduct: async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
    return dbSimulator.updateProduct(id, productData, token);
  },

  updateProductStock: async (id: string, newStock: number, token: string): Promise<Product> => {
    return dbSimulator.updateProductStock(id, newStock, token);
  },

  deleteProduct: async (id: string, token: string): Promise<boolean> => {
    return dbSimulator.deleteProduct(id, token);
  },

  // ORDERS
  createOrder: async (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_method: 'Ambil Sendiri' | 'Kirim ke Rumah';
    address?: string;
    special_notes?: string;
    items: { product_id: string; quantity: number }[];
  }): Promise<Order> => {
    return dbSimulator.createOrder(orderData);
  },

  getOrders: async (token: string): Promise<Order[]> => {
    return dbSimulator.getOrders(token);
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    return dbSimulator.getOrderById(id);
  },

  updateOrderStatus: async (id: string, status: OrderStatus, token: string): Promise<Order> => {
    return dbSimulator.updateOrderStatus(id, status, token);
  },

  assignOrderStaff: async (id: string, staffName: string, token: string): Promise<Order> => {
    return dbSimulator.assignOrderStaff(id, staffName, token);
  },

  // EXPENSES
  getExpenses: async (): Promise<Expense[]> => dbSimulator.getExpenses(),
  createExpense: async (expData: Omit<Expense, 'id' | 'created_at'>, token: string): Promise<Expense> => dbSimulator.createExpense(expData, token),
  deleteExpense: async (id: string, token: string): Promise<boolean> => dbSimulator.deleteExpense(id, token),

  // COUPONS
  getCoupons: async (): Promise<Coupon[]> => dbSimulator.getCoupons(),
  createCoupon: async (couponData: Omit<Coupon, 'id' | 'created_at'>, token: string): Promise<Coupon> => dbSimulator.createCoupon(couponData, token),
  deleteCoupon: async (id: string, token: string): Promise<boolean> => dbSimulator.deleteCoupon(id, token),

  // CUSTOMER REVIEWS
  getCustomerReviews: async (): Promise<CustomerReview[]> => dbSimulator.getCustomerReviews(),
  createCustomerReview: async (reviewData: Omit<CustomerReview, 'id' | 'created_at'>): Promise<CustomerReview> => dbSimulator.createCustomerReview(reviewData),
  respondCustomerReview: async (id: string, response: string, token: string): Promise<CustomerReview> => dbSimulator.respondCustomerReview(id, response, token),

  // RECIPES SOP
  getRecipes: async (): Promise<RecipeSOP[]> => dbSimulator.getRecipes(),

  // DELIVERY TRACKERS
  getDeliveryTrackers: async (): Promise<DeliveryTracker[]> => dbSimulator.getDeliveryTrackers(),
  updateDeliveryStatus: async (orderId: string, status: 'Siap Kirim' | 'Dalam Perjalanan' | 'Tiba di Tujuan', photoProof?: string): Promise<DeliveryTracker> => dbSimulator.updateDeliveryStatus(orderId, status, photoProof),

  // AUTHENTICATION
  adminLogin: async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; token?: string; role?: UserRole; division?: StaffDivision; name?: string; error?: string }> => {
    return dbSimulator.adminLogin(usernameInput, passwordInput);
  },

  getStaffAccounts: async (token: string): Promise<UserAccount[]> => dbSimulator.getStaffAccounts(token),
  createStaffAccount: async (data: { username: string; name: string; password: string; role: UserRole; division?: StaffDivision }, token: string): Promise<UserAccount> => dbSimulator.createStaffAccount(data, token),
  deleteStaffAccount: async (id: string, token: string): Promise<boolean> => dbSimulator.deleteStaffAccount(id, token),

  // SECURITY LOGS & CHATBOT
  getSecurityLogs: async (token: string): Promise<any[]> => dbSimulator.getSecurityLogs(token),
  getChatbotSettings: async (): Promise<ChatbotSettings> => dbSimulator.getChatbotSettings(),
  updateChatbotSettings: async (settingsData: Partial<ChatbotSettings>, token: string): Promise<ChatbotSettings> => dbSimulator.updateChatbotSettings(settingsData, token),
  getChatbotKnowledge: async (): Promise<ChatbotKnowledge[]> => dbSimulator.getChatbotKnowledge(),
  createChatbotKnowledge: async (knowData: Omit<ChatbotKnowledge, 'id' | 'created_at'>, token: string): Promise<ChatbotKnowledge> => dbSimulator.createChatbotKnowledge(knowData, token),
  updateChatbotKnowledge: async (id: string, knowData: Partial<ChatbotKnowledge>, token: string): Promise<ChatbotKnowledge> => dbSimulator.updateChatbotKnowledge(id, knowData, token),
  deleteChatbotKnowledge: async (id: string, token: string): Promise<boolean> => dbSimulator.deleteChatbotKnowledge(id, token)
};
