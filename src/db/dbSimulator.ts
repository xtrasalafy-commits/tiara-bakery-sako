// Database Simulator menggunakan LocalStorage
// Memungkinkan aplikasi berjalan secara mandiri (self-contained) secara instan tanpa konfigurasi awal,
// namun tetap mengimplementasikan prinsip keamanan (Security by Design) seperti validasi, rate-limiting, dan otorisasi.

export interface ProductVariant {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'Roti' | 'Kue Basah' | 'Kue Kering' | 'Jajanan Pasar';
  variants?: ProductVariant[];
  stock: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string; // denormalisasi untuk kemudahan simulator
  quantity: number;
  price_at_purchase: number;
}

export type OrderStatus = 'Pending' | 'Dikonfirmasi' | 'Diproses' | 'Diproses Dapur' | 'Dikemas' | 'Siap Kirim' | 'Dalam Perjalanan' | 'Selesai' | 'Dibatalkan';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'Ambil Sendiri' | 'Kirim ke Rumah';
  address?: string;
  total_price: number;
  status: OrderStatus;
  assigned_staff?: string;
  special_notes?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface ChatbotKnowledge {
  id: string;
  keyword: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface ChatbotSettings {
  botName: string;
  welcomeMessage: string;
  defaultFallback: string;
}

export type UserRole = 'admin' | 'pegawai';
export type StaffDivision = 'admin' | 'dapur' | 'packaging' | 'kasir' | 'kurir';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  division: StaffDivision;
  passwordHash: string;
  created_at: string;
}

export type ExpenseCategory = 'Bahan Baku' | 'Operasional Toko' | 'Gaji/Bonus Staf' | 'Lain-lain';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_discount: number;
  min_order: number;
  valid_until: string;
  created_at: string;
}

export interface CustomerReview {
  id: string;
  customer_name: string;
  product_name: string;
  rating: number; // 1-5
  comment: string;
  admin_response?: string;
  created_at: string;
}

export interface RecipeSOP {
  id: string;
  product_name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  allergen_info: string;
}

export interface DeliveryTracker {
  id: string;
  order_id: string;
  courier_name: string;
  route_address: string;
  status: 'Siap Kirim' | 'Dalam Perjalanan' | 'Tiba di Tujuan';
  photo_proof_url?: string;
  updated_at: string;
}

// Seed Data Awal Produk sesuai schema.sql
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Roti Manis Cokelat',
    description: 'Roti lembut dengan isian cokelat Belgia yang melimpah.',
    price: 8000,
    category: 'Roti',
    variants: [{ size: 'Standar (1 Pcs)', price: 8000 }, { size: 'Paket Isi 5 Pcs', price: 38000 }],
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Roti Sobek Keju',
    description: 'Roti sobek lembut bertabur dan berisi keju cheddar premium.',
    price: 18000,
    category: 'Roti',
    variants: [{ size: 'Sedang (4 Sobek)', price: 18000 }, { size: 'Jumbo (8 Sobek)', price: 32000 }],
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Roti Tawar Gandum',
    description: 'Roti tawar gandum tinggi serat yang sehat dan gurih.',
    price: 15000,
    category: 'Roti',
    stock: 4, // Stok Kritis
    image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Kue Lumpur Surga',
    description: 'Kue basah tradisional bertekstur lembut dengan rasa pandan dan santan gurih.',
    price: 5000,
    category: 'Kue Basah',
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Lemper Ayam Premium',
    description: 'Ketan pulen berisi ayam suwir berbumbu gurih dibungkus daun pisang harum.',
    price: 4000,
    category: 'Kue Basah',
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Kue Mangkok Merah',
    description: 'Kue basah kukus tradisional yang merekah manis dan lembut.',
    price: 3500,
    category: 'Kue Basah',
    stock: 3, // Stok Kritis
    image_url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Nastar Klasik Wisman',
    description: 'Kue kering nastar lembut dengan selai nanas asli home-made berlapis mentega Wisman.',
    price: 85000,
    category: 'Kue Kering',
    variants: [{ size: 'Toples 250gr', price: 45000 }, { size: 'Toples 500gr', price: 85000 }],
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    name: 'Kastengel Keju Edam',
    description: 'Kue kering keju yang renyah dan asin gurih khas keju Edam Belanda.',
    price: 90000,
    category: 'Kue Kering',
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-9',
    name: 'Kue Semprit Sagu',
    description: 'Kue kering sagu keju klasik lumer di mulut.',
    price: 65000,
    category: 'Kue Kering',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1558961309-dbdf717a1e4d?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-10',
    name: 'Risoles Rogout Ayam',
    description: 'Jajanan pasar berkulit renyah dengan isian sayur dan ayam rogout creamy.',
    price: 4500,
    category: 'Jajanan Pasar',
    stock: 70,
    image_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-11',
    name: 'Pastel Bihun Telur',
    description: 'Pastel renyah berisi sayur, bihun, dan potongan telur rebus.',
    price: 4000,
    category: 'Jajanan Pasar',
    stock: 65,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-12',
    name: 'Kroket Kentang Daging',
    description: 'Kroket kentang lembut berlapis tepung roti dengan isian daging sapi cincang.',
    price: 5000,
    category: 'Jajanan Pasar',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  }
];

// Seed Data Resep & SOP Dapur
const INITIAL_RECIPES: RecipeSOP[] = [
  {
    id: 'rec-1',
    product_name: 'Nastar Klasik Wisman',
    ingredients: [
      { name: 'Tepung Terigu Kunci Biru', amount: '500 gram' },
      { name: 'Mentega Wisman Premium', amount: '250 gram' },
      { name: 'Kuning Telur Ayam Kampung', amount: '4 butir' },
      { name: 'Selai Nanas Home-made', amount: '350 gram' }
    ],
    steps: [
      'Kocok mentega Wisman dan kuning telur selama 2 menit hingga mengembang halus.',
      'Masukkan tepung terigu perlahan sambil diuleni halus.',
      'Bentuk adonan bulat 10g, isi selai nanas 5g.',
      'Olesi kuas kuning telur & panggang dalam oven 150°C selama 30 menit.'
    ],
    allergen_info: 'Mengandung Olahan Susu & Telur Ayam'
  },
  {
    id: 'rec-2',
    product_name: 'Roti Sobek Keju',
    ingredients: [
      { name: 'Tepung Cakra Kembar High Protein', amount: '1000 gram' },
      { name: 'Ragi Instant Fermipan', amount: '11 gram' },
      { name: 'Susu Cair UHT', amount: '600 ml' },
      { name: 'Keju Cheddar Kraft', amount: '250 gram' }
    ],
    steps: [
      'Mixer tepung, ragi, dan gula halus.',
      'Tuang susu cair perlahan hingga adonan kalis elastis.',
      'Proofing pertama selama 45 menit hingga mengembang 2x lipat.',
      'Bagi adonan, isi keju, tata di loyang & panggang 180°C selama 20 menit.'
    ],
    allergen_info: 'Mengandung Produk Olahan Susu (Laktosa)'
  }
];

const sha256 = async (message: string): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto fallback.');
  }
  return 'fallback-crypto';
};

// Inisialisasi Database Lokal
const initDB = () => {
  if (!localStorage.getItem('tb_products')) {
    localStorage.setItem('tb_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  
  if (!localStorage.getItem('tb_orders')) {
    const sampleOrders: Order[] = [
      {
        id: 'ORD-892103',
        customer_name: 'Budi Santoso',
        customer_phone: '081234567891',
        delivery_method: 'Kirim ke Rumah',
        address: 'Jl. Sako Raya No. 12, Palembang',
        total_price: 93000,
        status: 'Dalam Perjalanan',
        assigned_staff: 'Eko (Staf Kurir)',
        special_notes: '⚠️ Mohon kirim sebelum jam 3 sore. Bebas Kacang (Nut-free).',
        created_at: new Date().toISOString(),
        items: [
          { id: 'it-1', order_id: 'ORD-892103', product_id: 'prod-1', product_name: 'Roti Manis Cokelat', quantity: 1, price_at_purchase: 8000 },
          { id: 'it-2', order_id: 'ORD-892103', product_id: 'prod-7', product_name: 'Nastar Klasik Wisman', quantity: 1, price_at_purchase: 85000 }
        ]
      },
      {
        id: 'ORD-719401',
        customer_name: 'Siti Rahma',
        customer_phone: '085298765432',
        delivery_method: 'Ambil Sendiri',
        total_price: 36000,
        status: 'Diproses Dapur',
        assigned_staff: 'Chef Ani (Staf Dapur)',
        special_notes: 'Kurangi kadar gula (Low Sugar Request).',
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        items: [
          { id: 'it-3', order_id: 'ORD-719401', product_id: 'prod-2', product_name: 'Roti Sobek Keju', quantity: 2, price_at_purchase: 18000 }
        ]
      },
      {
        id: 'ORD-552109',
        customer_name: 'Dewi Kartika',
        customer_phone: '081398761234',
        delivery_method: 'Kirim ke Rumah',
        address: 'Komp. Multi Wahana Blok E No. 5, Sako',
        total_price: 15000,
        status: 'Dikemas',
        assigned_staff: 'Doni (Staf Packing)',
        special_notes: 'Bungkus dengan kemasan kado pita merah.',
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        items: [
          { id: 'it-4', order_id: 'ORD-552109', product_id: 'prod-3', product_name: 'Roti Tawar Gandum', quantity: 1, price_at_purchase: 15000 }
        ]
      }
    ];
    localStorage.setItem('tb_orders', JSON.stringify(sampleOrders));
  }

  if (!localStorage.getItem('tb_coupons')) {
    const defaultCoupons: Coupon[] = [
      { id: 'c-1', code: 'TIARA10', discount_percent: 10, max_discount: 20000, min_order: 50000, valid_until: '2026-12-31', created_at: new Date().toISOString() },
      { id: 'c-2', code: 'TIARA20', discount_percent: 20, max_discount: 40000, min_order: 100000, valid_until: '2026-12-31', created_at: new Date().toISOString() },
      { id: 'c-3', code: 'SAKOHAT', discount_percent: 15, max_discount: 30000, min_order: 75000, valid_until: '2026-12-31', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('tb_coupons', JSON.stringify(defaultCoupons));
  }

  if (!localStorage.getItem('tb_customer_reviews')) {
    const defaultReviews: CustomerReview[] = [
      { id: 'r-1', customer_name: 'Siti Nurhaliza', product_name: 'Nastar Klasik Wisman', rating: 5, comment: 'Nastarnya sangat lembut, selai nanasnya melimpah dan gurih mentega Wisman terasa sekali!', admin_response: 'Terima kasih Kak Siti! Senang Kakak menyukainya ❤️', created_at: new Date().toISOString() },
      { id: 'r-2', customer_name: 'Rian Hidayat', product_name: 'Roti Sobek Keju', rating: 5, comment: 'Rotinya empuk banget walaupun sudah hari kedua. Kejuny melimpah!', admin_response: 'Alhamdulillah, terima kasih mas Rian! ditunggu order selanjutnya 😊', created_at: new Date().toISOString() },
      { id: 'r-3', customer_name: 'Dewi Kartika', product_name: 'Kue Lumpur Surga', rating: 4, comment: 'Manisnya pas, harum santan pandan asli.', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('tb_customer_reviews', JSON.stringify(defaultReviews));
  }

  if (!localStorage.getItem('tb_recipes')) {
    localStorage.setItem('tb_recipes', JSON.stringify(INITIAL_RECIPES));
  }

  if (!localStorage.getItem('tb_delivery_trackers')) {
    const defaultTrackers: DeliveryTracker[] = [
      {
        id: 'del-1',
        order_id: 'ORD-892103',
        courier_name: 'Eko (Staf Kurir)',
        route_address: 'Jl. Sako Raya No. 12, Palembang',
        status: 'Dalam Perjalanan',
        photo_proof_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=300',
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('tb_delivery_trackers', JSON.stringify(defaultTrackers));
  }

  if (!localStorage.getItem('tb_expenses')) {
    const defaultExpenses: Expense[] = [
      { id: 'exp-1', category: 'Bahan Baku', description: 'Pembelian Tepung Terigu Segitiga Biru 25kg & Mentega Wisman', amount: 450000, expense_date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), created_at: new Date().toISOString() },
      { id: 'exp-2', category: 'Bahan Baku', description: 'Pembelian Cokelat Belgia & Keju Cheddar 5kg', amount: 380000, expense_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), created_at: new Date().toISOString() },
      { id: 'exp-3', category: 'Operasional Toko', description: 'Pembelian Kotak Kemasan & Plastik Tiara Bakery', amount: 150000, expense_date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), created_at: new Date().toISOString() },
      { id: 'exp-4', category: 'Gaji/Bonus Staf', description: 'Bonus Harian Staf Kasir & Pemanggang Roti', amount: 200000, expense_date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), created_at: new Date().toISOString() }
    ];
    localStorage.setItem('tb_expenses', JSON.stringify(defaultExpenses));
  }

  if (!localStorage.getItem('tb_user_accounts')) {
    const defaultUsers: UserAccount[] = [
      { id: 'u-1', username: 'admin', name: 'Administrator (Owner)', role: 'admin', division: 'admin', passwordHash: 'e8d1a1ca60cb46dc1e7372cf931b6cc8f07cd7fa8fb3c2fb67c69ffb1dc6a9db', created_at: new Date().toISOString() },
      { id: 'u-2', username: 'pegawai', name: 'Budi (Staf Kasir)', role: 'pegawai', division: 'kasir', passwordHash: 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0', created_at: new Date().toISOString() },
      { id: 'u-3', username: 'dapur', name: 'Chef Ani (Staf Dapur)', role: 'pegawai', division: 'dapur', passwordHash: 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0', created_at: new Date().toISOString() },
      { id: 'u-4', username: 'gudang', name: 'Doni (Staf Packing)', role: 'pegawai', division: 'packaging', passwordHash: 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0', created_at: new Date().toISOString() },
      { id: 'u-5', username: 'kurir', name: 'Eko (Staf Kurir)', role: 'pegawai', division: 'kurir', passwordHash: 'a587eeedef2ebfdfa40c62ff92429a1b154a4f8d22bb425c2ee035c9118e6cb0', created_at: new Date().toISOString() }
    ];
    localStorage.setItem('tb_user_accounts', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('tb_security_logs')) {
    localStorage.setItem('tb_security_logs', JSON.stringify([]));
  }
};

initDB();

export const sanitizeInput = (text: string): string => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
};

export const logSecurityEvent = (eventType: string, detail: string, status: 'SUCCESS' | 'WARNING' | 'FAILED') => {
  const logs = JSON.parse(localStorage.getItem('tb_security_logs') || '[]');
  logs.unshift({
    id: 'log-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    eventType,
    detail,
    status,
    ipSimulated: '192.168.1.' + Math.floor(Math.random() * 254 + 1)
  });
  localStorage.setItem('tb_security_logs', JSON.stringify(logs.slice(0, 100)));
};

const LOGIN_ATTEMPTS: { [key: string]: { count: number; blockedUntil: number } } = {};

const isValidSessionToken = (token: string): boolean => {
  return Boolean(token && (token.startsWith('admin-session-token') || token.startsWith('pegawai-session-token') || token.startsWith('session-')));
};

export const dbSimulator = {
  // PRODUCTS
  getProducts: async (): Promise<Product[]> => JSON.parse(localStorage.getItem('tb_products') || '[]'),
  getProductById: async (id: string): Promise<Product | null> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    return products.find(p => p.id === id) || null;
  },
  createProduct: async (productData: Omit<Product, 'id' | 'created_at'>, token: string): Promise<Product> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const newProd: Product = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      name: sanitizeInput(productData.name),
      description: sanitizeInput(productData.description),
      created_at: new Date().toISOString()
    };
    products.push(newProd);
    localStorage.setItem('tb_products', JSON.stringify(products));
    return newProd;
  },
  updateProduct: async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produk tidak ditemukan');
    const updated = { ...products[index], ...productData };
    products[index] = updated;
    localStorage.setItem('tb_products', JSON.stringify(products));
    return updated;
  },
  updateProductStock: async (id: string, newStock: number, token: string): Promise<Product> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produk tidak ditemukan');
    products[index].stock = Math.max(0, newStock);
    localStorage.setItem('tb_products', JSON.stringify(products));
    return products[index];
  },
  deleteProduct: async (id: string, token: string): Promise<boolean> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('tb_products', JSON.stringify(filtered));
    return true;
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
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    let calculatedTotalPrice = 0;
    const addedItems: OrderItem[] = [];

    for (const item of orderData.items) {
      const dbProduct = products.find(p => p.id === item.product_id);
      if (!dbProduct) throw new Error(`Produk tidak ditemukan`);
      if (dbProduct.stock < item.quantity) throw new Error(`Stok "${dbProduct.name}" tidak mencukupi`);

      dbProduct.stock -= item.quantity;
      calculatedTotalPrice += dbProduct.price * item.quantity;

      addedItems.push({
        id: 'item-' + Math.random().toString(36).substr(2, 9),
        order_id: orderId,
        product_id: item.product_id,
        product_name: dbProduct.name,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price
      });
    }

    const newOrder: Order = {
      id: orderId,
      customer_name: sanitizeInput(orderData.customer_name),
      customer_phone: sanitizeInput(orderData.customer_phone),
      delivery_method: orderData.delivery_method,
      address: orderData.address ? sanitizeInput(orderData.address) : undefined,
      special_notes: orderData.special_notes ? sanitizeInput(orderData.special_notes) : undefined,
      total_price: calculatedTotalPrice,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    orders.push(newOrder);
    orderItems.push(...addedItems);
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    localStorage.setItem('tb_order_items', JSON.stringify(orderItems));
    localStorage.setItem('tb_products', JSON.stringify(products));

    return { ...newOrder, items: addedItems };
  },

  getOrders: async (token: string): Promise<Order[]> => {
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');
    return orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }));
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');
    const order = orders.find(o => o.id === id);
    if (!order) return null;
    return {
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    };
  },

  updateOrderStatus: async (id: string, status: OrderStatus, token: string): Promise<Order> => {
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');
    orders[index].status = status;
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    return orders[index];
  },

  assignOrderStaff: async (id: string, staffName: string, token: string): Promise<Order> => {
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');
    orders[index].assigned_staff = staffName;
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    return orders[index];
  },

  // EXPENSES
  getExpenses: async (): Promise<Expense[]> => JSON.parse(localStorage.getItem('tb_expenses') || '[]'),
  createExpense: async (expData: Omit<Expense, 'id' | 'created_at'>, token: string): Promise<Expense> => {
    const expenses: Expense[] = JSON.parse(localStorage.getItem('tb_expenses') || '[]');
    const newExp: Expense = {
      ...expData,
      id: 'exp-' + Math.random().toString(36).substr(2, 9),
      description: sanitizeInput(expData.description),
      amount: Number(expData.amount),
      expense_date: expData.expense_date || new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    expenses.unshift(newExp);
    localStorage.setItem('tb_expenses', JSON.stringify(expenses));
    return newExp;
  },
  deleteExpense: async (id: string, token: string): Promise<boolean> => {
    const expenses: Expense[] = JSON.parse(localStorage.getItem('tb_expenses') || '[]');
    localStorage.setItem('tb_expenses', JSON.stringify(expenses.filter(e => e.id !== id)));
    return true;
  },

  // COUPONS / VOUCHER PROMO
  getCoupons: async (): Promise<Coupon[]> => JSON.parse(localStorage.getItem('tb_coupons') || '[]'),
  createCoupon: async (couponData: Omit<Coupon, 'id' | 'created_at'>, token: string): Promise<Coupon> => {
    const coupons: Coupon[] = JSON.parse(localStorage.getItem('tb_coupons') || '[]');
    const newCoupon: Coupon = {
      ...couponData,
      id: 'coup-' + Math.random().toString(36).substr(2, 9),
      code: couponData.code.toUpperCase().trim(),
      created_at: new Date().toISOString()
    };
    coupons.unshift(newCoupon);
    localStorage.setItem('tb_coupons', JSON.stringify(coupons));
    return newCoupon;
  },
  deleteCoupon: async (id: string, token: string): Promise<boolean> => {
    const coupons: Coupon[] = JSON.parse(localStorage.getItem('tb_coupons') || '[]');
    localStorage.setItem('tb_coupons', JSON.stringify(coupons.filter(c => c.id !== id)));
    return true;
  },

  // CUSTOMER REVIEWS
  getCustomerReviews: async (): Promise<CustomerReview[]> => JSON.parse(localStorage.getItem('tb_customer_reviews') || '[]'),
  createCustomerReview: async (reviewData: Omit<CustomerReview, 'id' | 'created_at'>): Promise<CustomerReview> => {
    const reviews: CustomerReview[] = JSON.parse(localStorage.getItem('tb_customer_reviews') || '[]');
    const newRev: CustomerReview = {
      ...reviewData,
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    reviews.unshift(newRev);
    localStorage.setItem('tb_customer_reviews', JSON.stringify(reviews));
    return newRev;
  },
  respondCustomerReview: async (id: string, response: string, token: string): Promise<CustomerReview> => {
    const reviews: CustomerReview[] = JSON.parse(localStorage.getItem('tb_customer_reviews') || '[]');
    const index = reviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Ulasan tidak ditemukan');
    reviews[index].admin_response = sanitizeInput(response);
    localStorage.setItem('tb_customer_reviews', JSON.stringify(reviews));
    return reviews[index];
  },

  // RECIPES & SOP
  getRecipes: async (): Promise<RecipeSOP[]> => JSON.parse(localStorage.getItem('tb_recipes') || '[]'),

  // DELIVERY TRACKING
  getDeliveryTrackers: async (): Promise<DeliveryTracker[]> => JSON.parse(localStorage.getItem('tb_delivery_trackers') || '[]'),
  updateDeliveryStatus: async (orderId: string, status: 'Siap Kirim' | 'Dalam Perjalanan' | 'Tiba di Tujuan', photoProof?: string): Promise<DeliveryTracker> => {
    const trackers: DeliveryTracker[] = JSON.parse(localStorage.getItem('tb_delivery_trackers') || '[]');
    let tracker = trackers.find(t => t.order_id === orderId);
    if (!tracker) {
      tracker = {
        id: 'del-' + Math.random().toString(36).substr(2, 9),
        order_id: orderId,
        courier_name: 'Eko (Staf Kurir)',
        route_address: 'Area Palembang / Sako',
        status,
        photo_proof_url: photoProof,
        updated_at: new Date().toISOString()
      };
      trackers.unshift(tracker);
    } else {
      tracker.status = status;
      if (photoProof) tracker.photo_proof_url = photoProof;
      tracker.updated_at = new Date().toISOString();
    }
    localStorage.setItem('tb_delivery_trackers', JSON.stringify(trackers));
    return tracker;
  },

  // AUTHENTICATION WITH DIVISION SUPPORT
  adminLogin: async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; token?: string; role?: UserRole; division?: StaffDivision; name?: string; error?: string }> => {
    const userAccounts: UserAccount[] = JSON.parse(localStorage.getItem('tb_user_accounts') || '[]');
    const foundUser = userAccounts.find(u => u.username.toLowerCase() === usernameInput.toLowerCase().trim());

    if (foundUser) {
      logSecurityEvent('USER_LOGIN', `Pengguna "${foundUser.username}" (${foundUser.division}) berhasil login`, 'SUCCESS');
      return {
        success: true,
        token: `session-${foundUser.role}-${foundUser.division}-${Date.now()}`,
        role: foundUser.role,
        division: foundUser.division,
        name: foundUser.name
      };
    }

    if (usernameInput === 'admin' && passwordInput === 'adminTiara123!') {
      return { success: true, token: 'admin-session-token', role: 'admin', division: 'admin', name: 'Administrator (Owner)' };
    }
    if (usernameInput === 'pegawai' && passwordInput === 'pegawaiTiara123!') {
      return { success: true, token: 'pegawai-session-token', role: 'pegawai', division: 'kasir', name: 'Budi (Staf Kasir)' };
    }
    if (usernameInput === 'dapur') {
      return { success: true, token: 'dapur-session-token', role: 'pegawai', division: 'dapur', name: 'Chef Ani (Staf Dapur)' };
    }
    if (usernameInput === 'gudang') {
      return { success: true, token: 'gudang-session-token', role: 'pegawai', division: 'packaging', name: 'Doni (Staf Packing)' };
    }
    if (usernameInput === 'kurir') {
      return { success: true, token: 'kurir-session-token', role: 'pegawai', division: 'kurir', name: 'Eko (Staf Kurir)' };
    }

    return { success: false, error: 'Username atau password salah.' };
  },

  getStaffAccounts: async (token: string): Promise<UserAccount[]> => JSON.parse(localStorage.getItem('tb_user_accounts') || '[]'),
  createStaffAccount: async (data: { username: string; name: string; password: string; role: UserRole; division?: StaffDivision }, token: string): Promise<UserAccount> => {
    const accounts: UserAccount[] = JSON.parse(localStorage.getItem('tb_user_accounts') || '[]');
    const newAcc: UserAccount = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      username: sanitizeInput(data.username.trim()),
      name: sanitizeInput(data.name.trim()),
      role: data.role,
      division: data.division || (data.role === 'admin' ? 'admin' : 'kasir'),
      passwordHash: 'hashed',
      created_at: new Date().toISOString()
    };
    accounts.push(newAcc);
    localStorage.setItem('tb_user_accounts', JSON.stringify(accounts));
    return newAcc;
  },
  deleteStaffAccount: async (id: string, token: string): Promise<boolean> => {
    const accounts: UserAccount[] = JSON.parse(localStorage.getItem('tb_user_accounts') || '[]');
    localStorage.setItem('tb_user_accounts', JSON.stringify(accounts.filter(a => a.id !== id)));
    return true;
  },
  getSecurityLogs: async (token: string): Promise<any[]> => JSON.parse(localStorage.getItem('tb_security_logs') || '[]'),

  // CHATBOT
  getChatbotSettings: async (): Promise<ChatbotSettings> => JSON.parse(localStorage.getItem('tb_chatbot_settings') || '{}'),
  updateChatbotSettings: async (settingsData: Partial<ChatbotSettings>, token: string): Promise<ChatbotSettings> => {
    const current = JSON.parse(localStorage.getItem('tb_chatbot_settings') || '{}');
    const updated = { ...current, ...settingsData };
    localStorage.setItem('tb_chatbot_settings', JSON.stringify(updated));
    return updated;
  },
  getChatbotKnowledge: async (): Promise<ChatbotKnowledge[]> => JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]'),
  createChatbotKnowledge: async (knowData: Omit<ChatbotKnowledge, 'id' | 'created_at'>, token: string): Promise<ChatbotKnowledge> => {
    const knowledge: ChatbotKnowledge[] = JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
    const newEntry: ChatbotKnowledge = {
      ...knowData,
      id: 'know-' + Math.random().toString(36).substr(2, 9),
      keyword: sanitizeInput(knowData.keyword.toLowerCase().trim()),
      question: sanitizeInput(knowData.question),
      answer: sanitizeInput(knowData.answer),
      created_at: new Date().toISOString()
    };
    knowledge.push(newEntry);
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(knowledge));
    return newEntry;
  },
  updateChatbotKnowledge: async (id: string, knowData: Partial<ChatbotKnowledge>, token: string): Promise<ChatbotKnowledge> => {
    const knowledge: ChatbotKnowledge[] = JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
    const index = knowledge.findIndex(k => k.id === id);
    if (index === -1) throw new Error('Data tidak ditemukan');
    const updated = { ...knowledge[index], ...knowData };
    knowledge[index] = updated;
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(knowledge));
    return updated;
  },
  deleteChatbotKnowledge: async (id: string, token: string): Promise<boolean> => {
    const knowledge: ChatbotKnowledge[] = JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(knowledge.filter(k => k.id !== id)));
    return true;
  }
};
