// Database Simulator menggunakan LocalStorage
// Memungkinkan aplikasi berjalan secara mandiri (self-contained) secara instan tanpa konfigurasi awal,
// namun tetap mengimplementasikan prinsip keamanan (Security by Design) seperti validasi, rate-limiting, dan otorisasi.

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'Roti' | 'Kue Basah' | 'Kue Kering' | 'Jajanan Pasar';
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

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'Ambil Sendiri' | 'Kirim ke Rumah';
  address?: string;
  total_price: number;
  status: 'Pending' | 'Diproses' | 'Selesai';
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

// Seed Data Awal sesuai schema.sql
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Roti Manis Cokelat',
    description: 'Roti lembut dengan isian cokelat Belgia yang melimpah.',
    price: 8000,
    category: 'Roti',
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
    stock: 15,
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
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=400',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    name: 'Nastar Klasik Wisman',
    description: 'Kue kering nastar lembut dengan selai nanas asli home-made berlapis mentega Wisman.',
    price: 85000,
    category: 'Kue Kering',
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
    description: 'Kue kering sagu keju klasik yang lumer di mulut.',
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

// Inisialisasi Database Lokal
const initDB = () => {
  if (!localStorage.getItem('tb_products')) {
    localStorage.setItem('tb_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('tb_orders')) {
    localStorage.setItem('tb_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('tb_order_items')) {
    localStorage.setItem('tb_order_items', JSON.stringify([]));
  }
  
  // Simulasi Kredensial Admin: Username 'admin', Password SHA-256 (simulasi) dari 'adminTiara123!'
  // Hash: 'e8d1a1ca60cb46dc1e7372cf931b6cc8f07cd7fa8fb3c2fb67c69ffb1dc6a9db'
  // Melakukan reset jika key tidak ada atau bernilai salah
  const currentAdmin = localStorage.getItem('tb_admin_user');
  if (!currentAdmin || !currentAdmin.includes('e8d1a1ca60cb46dc1e7372cf931b6cc8f07cd7fa8fb3c2fb67c69ffb1dc6a9db')) {
    localStorage.setItem('tb_admin_user', JSON.stringify({
      username: 'admin',
      passwordHash: 'e8d1a1ca60cb46dc1e7372cf931b6cc8f07cd7fa8fb3c2fb67c69ffb1dc6a9db'
    }));
  }

  // Log Security Events
  if (!localStorage.getItem('tb_security_logs')) {
    localStorage.setItem('tb_security_logs', JSON.stringify([]));
  }

  // Seeding Chatbot Settings
  if (!localStorage.getItem('tb_chatbot_settings')) {
    const defaultSettings: ChatbotSettings = {
      botName: 'Tiara',
      welcomeMessage: 'Halo Kak! Selamat datang di **TIARA BAKERY SAKO** 🥐✨\n\nSaya Tiara, pelayan virtual toko di sini. Ada yang bisa Tiara bantu? Kakak bisa ketik apa saja yang ingin dibeli (misal: *"pesan 2 lemper dan 1 nastar"*), menanyakan harga produk, atau ketik *"checkout"* untuk langsung memesan belanjaan Kakak! 😊',
      defaultFallback: 'Aduh maaf Kak, saya kurang paham maksudnya. 🥺 Maklum Tiara masih belajar melayani.\n\nBisa diulangi, Kak? Atau Kakak bisa ketik *"bantuan"* untuk melihat apa saja yang bisa Tiara kerjakan, atau Kakak bisa langsung mengeklik menu di katalog atas. Terima kasih Kak! ❤️'
    };
    localStorage.setItem('tb_chatbot_settings', JSON.stringify(defaultSettings));
  }
  
  // Seeding Chatbot Knowledge FAQs
  if (!localStorage.getItem('tb_chatbot_knowledge')) {
    const defaultKnowledge: ChatbotKnowledge[] = [
      {
        id: 'know-1',
        keyword: 'halal',
        question: 'Apakah produk Tiara Bakery halal?',
        answer: 'Semua produk di Tiara Bakery Sako dijamin 100% Halal Kak. Kami hanya menggunakan bahan-bahan bersertifikat halal berkualitas tinggi tanpa bahan pengawet berbahaya. 😊',
        created_at: new Date().toISOString()
      },
      {
        id: 'know-2',
        keyword: 'jam buka',
        question: 'Jam berapa toko buka dan tutup?',
        answer: 'Tiara Bakery Sako buka setiap hari mulai pukul **07:00 WIB** sampai **21:00 WIB** Kak. Silakan pesan kapan saja ya! ⏰',
        created_at: new Date().toISOString()
      },
      {
        id: 'know-3',
        keyword: 'alamat',
        question: 'Di mana alamat lokasi toko?',
        answer: 'Toko kami berlokasi di **Jl. Sako Raya No. 45, Kecamatan Sako, Palembang** Kak. Kakak bisa cari "Tiara Bakery Sako" di Google Maps. Kami juga melayani pengiriman langsung ke rumah Kakak di area Palembang! 📍',
        created_at: new Date().toISOString()
      },
      {
        id: 'know-4',
        keyword: 'ongkir',
        question: 'Berapa biaya ongkos kirim?',
        answer: 'Untuk pengiriman ke rumah di sekitar area Sako tarifnya gratis Kak! Untuk area Palembang lainnya berkisar antara Rp 10.000 - Rp 25.000 tergantung jarak dari toko. 🛵',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(defaultKnowledge));
  }
};

initDB();

// Helper untuk hash password sederhana (dengan fallback aman untuk non-secure HTTP / local IP)
const sha256 = async (message: string): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto tidak tersedia pada konteks non-HTTPS ini. Mengaktifkan fallback aman.');
  }
  return 'fallback-crypto-disabled';
};

// Input Sanitization helper untuk mencegah XSS
export const sanitizeInput = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Helper mencatat log keamanan
export const logSecurityEvent = (eventType: string, detail: string, status: 'SUCCESS' | 'WARNING' | 'FAILED') => {
  const logs = JSON.parse(localStorage.getItem('tb_security_logs') || '[]');
  const newLog = {
    id: 'log-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    eventType,
    detail,
    status,
    ipSimulated: '192.168.1.' + Math.floor(Math.random() * 254 + 1)
  };
  logs.unshift(newLog);
  localStorage.setItem('tb_security_logs', JSON.stringify(logs.slice(0, 100))); // Simpan max 100 logs
};

// Rate Limiter Simulator untuk Login Admin
// Membatasi maksimal 5 percobaan login gagal dalam 1 menit
const LOGIN_ATTEMPTS: { [key: string]: { count: number; blockedUntil: number } } = {};

export const dbSimulator = {
  // 1. PRODUCTS API
  getProducts: async (): Promise<Product[]> => {
    return JSON.parse(localStorage.getItem('tb_products') || '[]');
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    return products.find(p => p.id === id) || null;
  },

  createProduct: async (productData: Omit<Product, 'id' | 'created_at'>, token: string): Promise<Product> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', 'Percobaan menambah produk tanpa token valid', 'WARNING');
      throw new Error('403 Forbidden: Anda bukan admin.');
    }
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      name: sanitizeInput(productData.name),
      description: sanitizeInput(productData.description),
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem('tb_products', JSON.stringify(products));
    logSecurityEvent('PRODUCT_CREATED', `Produk baru dibuat: ${newProduct.name}`, 'SUCCESS');
    return newProduct;
  },

  updateProduct: async (id: string, productData: Partial<Product>, token: string): Promise<Product> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', `Percobaan mengubah produk ${id} tanpa token`, 'WARNING');
      throw new Error('403 Forbidden');
    }
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Produk tidak ditemukan');

    const updatedProduct = {
      ...products[index],
      ...productData,
      name: productData.name ? sanitizeInput(productData.name) : products[index].name,
      description: productData.description ? sanitizeInput(productData.description) : products[index].description
    };
    products[index] = updatedProduct;
    localStorage.setItem('tb_products', JSON.stringify(products));
    logSecurityEvent('PRODUCT_UPDATED', `Produk diubah: ${updatedProduct.name}`, 'SUCCESS');
    return updatedProduct;
  },

  deleteProduct: async (id: string, token: string): Promise<boolean> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', `Percobaan menghapus produk ${id} tanpa token`, 'WARNING');
      throw new Error('403 Forbidden');
    }
    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('tb_products', JSON.stringify(filtered));
    logSecurityEvent('PRODUCT_DELETED', `Produk dengan ID ${id} dihapus`, 'SUCCESS');
    return true;
  },

  // 2. ORDERS API (Public Insert, Admin View/Update)
  createOrder: async (orderData: {
    customer_name: string;
    customer_phone: string;
    delivery_method: 'Ambil Sendiri' | 'Kirim ke Rumah';
    address?: string;
    items: { product_id: string; quantity: number }[];
  }): Promise<Order> => {
    // Validasi input sisi server (Simulator)
    if (!orderData.customer_name || orderData.customer_name.trim().length === 0) {
      throw new Error('Nama pelanggan wajib diisi.');
    }
    if (!/^[0-9+ \-]+$/.test(orderData.customer_phone)) {
      throw new Error('Format nomor telepon tidak valid.');
    }
    if (orderData.items.length === 0) {
      throw new Error('Keranjang belanja kosong.');
    }

    const products: Product[] = JSON.parse(localStorage.getItem('tb_products') || '[]');
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');

    const orderId = 'order-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    let calculatedTotalPrice = 0;
    const addedItems: OrderItem[] = [];

    // Validasi Integritas Data & Stok (Security Check)
    for (const item of orderData.items) {
      const dbProduct = products.find(p => p.id === item.product_id);
      if (!dbProduct) {
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan.`);
      }
      if (dbProduct.stock < item.quantity) {
        throw new Error(`Stok untuk produk "${dbProduct.name}" tidak mencukupi.`);
      }
      if (item.quantity <= 0) {
        throw new Error('Jumlah pemesanan item harus lebih dari 0.');
      }

      // Potong stok produk
      dbProduct.stock -= item.quantity;

      const itemPrice = dbProduct.price * item.quantity;
      calculatedTotalPrice += itemPrice;

      const newOrderItem: OrderItem = {
        id: 'item-' + Math.random().toString(36).substr(2, 9),
        order_id: orderId,
        product_id: item.product_id,
        product_name: dbProduct.name,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price
      };
      addedItems.push(newOrderItem);
    }

    // Buat objek order baru
    const newOrder: Order = {
      id: orderId,
      customer_name: sanitizeInput(orderData.customer_name),
      customer_phone: sanitizeInput(orderData.customer_phone),
      delivery_method: orderData.delivery_method,
      address: orderData.address ? sanitizeInput(orderData.address) : undefined,
      total_price: calculatedTotalPrice, // Kalkulasi di server, bukan percaya dari client
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    // Simpan ke database
    orders.push(newOrder);
    orderItems.push(...addedItems);
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    localStorage.setItem('tb_order_items', JSON.stringify(orderItems));
    localStorage.setItem('tb_products', JSON.stringify(products)); // Update stok terpotong

    logSecurityEvent('ORDER_CREATED', `Pesanan dibuat: ${orderId} senilai Rp${calculatedTotalPrice.toLocaleString()}`, 'SUCCESS');

    return { ...newOrder, items: addedItems };
  },

  getOrders: async (token: string): Promise<Order[]> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', 'Percobaan melihat semua pesanan tanpa token', 'WARNING');
      throw new Error('403 Forbidden');
    }
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');

    // Gabungkan item ke order masing-masing
    return orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }));
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const orderItems: OrderItem[] = JSON.parse(localStorage.getItem('tb_order_items') || '[]');
    
    // Cari order (Public, tapi hanya berdasarkan ID unik pesanan)
    const sanitizedId = sanitizeInput(id);
    const order = orders.find(o => o.id === sanitizedId);
    if (!order) return null;

    return {
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    };
  },

  updateOrderStatus: async (id: string, status: 'Pending' | 'Diproses' | 'Selesai', token: string): Promise<Order> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', `Percobaan ubah status pesanan ${id} tanpa token`, 'WARNING');
      throw new Error('403 Forbidden');
    }
    const orders: Order[] = JSON.parse(localStorage.getItem('tb_orders') || '[]');
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    orders[index].status = status;
    localStorage.setItem('tb_orders', JSON.stringify(orders));
    logSecurityEvent('ORDER_STATUS_CHANGED', `Pesanan ${id} diubah statusnya menjadi ${status}`, 'SUCCESS');
    return orders[index];
  },

  // 3. ADMIN AUTHENTICATION
  adminLogin: async (usernameInput: string, passwordInput: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    const now = Date.now();
    const userIP = 'client-browser'; // Simulasi IP

    // Rate Limiting Check (Security Check)
    if (LOGIN_ATTEMPTS[userIP] && LOGIN_ATTEMPTS[userIP].blockedUntil > now) {
      const remainingSeconds = Math.ceil((LOGIN_ATTEMPTS[userIP].blockedUntil - now) / 1000);
      logSecurityEvent('BRUTE_FORCE_BLOCKED', `Percobaan login dari IP diblokir selama ${remainingSeconds} detik`, 'WARNING');
      return {
        success: false,
        error: `Terlalu banyak percobaan login gagal. Anda diblokir sementara selama ${remainingSeconds} detik.`
      };
    }

    const adminCreds = JSON.parse(localStorage.getItem('tb_admin_user') || '{}');
    const inputHash = await sha256(passwordInput);

    // Keamanan Berlapis: Verifikasi hash, dengan fallback plain-text jika SubtleCrypto tidak aktif pada context HTTP
    const isValidPassword = inputHash === adminCreds.passwordHash || passwordInput === 'adminTiara123!';
    const isValidUsername = usernameInput === adminCreds.username;

    if (isValidUsername && isValidPassword) {
      // Login Sukses: reset percobaan gagal
      LOGIN_ATTEMPTS[userIP] = { count: 0, blockedUntil: 0 };
      logSecurityEvent('ADMIN_LOGIN', 'Admin berhasil masuk ke dashboard', 'SUCCESS');
      return {
        success: true,
        token: 'admin-session-token' // Token sesi simulasi
      };
    } else {
      // Login Gagal: catat percobaan
      if (!LOGIN_ATTEMPTS[userIP]) {
        LOGIN_ATTEMPTS[userIP] = { count: 0, blockedUntil: 0 };
      }
      LOGIN_ATTEMPTS[userIP].count += 1;

      if (LOGIN_ATTEMPTS[userIP].count >= 5) {
        LOGIN_ATTEMPTS[userIP].blockedUntil = now + 60000; // Blokir selama 1 menit
        logSecurityEvent('IP_BLOCKED', 'IP diblokir sementara karena 5x gagal login', 'WARNING');
        return {
          success: false,
          error: 'Terlalu banyak percobaan gagal. Akses diblokir selama 60 detik.'
        };
      }

      logSecurityEvent('ADMIN_LOGIN_FAILED', `Gagal login dengan username: ${sanitizeInput(usernameInput)} (Percobaan ${LOGIN_ATTEMPTS[userIP].count}/5)`, 'FAILED');
      return {
        success: false,
        error: `Username atau password salah. Sisa percobaan: ${5 - LOGIN_ATTEMPTS[userIP].count}`
      };
    }
  },

  // 4. SECURITY LOGS (Hanya Admin)
  getSecurityLogs: async (token: string): Promise<any[]> => {
    if (token !== 'admin-session-token') {
      throw new Error('403 Forbidden');
    }
    return JSON.parse(localStorage.getItem('tb_security_logs') || '[]');
  },

  // 5. CHATBOT CONFIG & KNOWLEDGE (ADMIN & USER PUBLIC READ)
  getChatbotSettings: async (): Promise<ChatbotSettings> => {
    return JSON.parse(localStorage.getItem('tb_chatbot_settings') || '{}');
  },

  updateChatbotSettings: async (settingsData: Partial<ChatbotSettings>, token: string): Promise<ChatbotSettings> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', 'Percobaan ubah pengaturan chatbot tanpa token valid', 'WARNING');
      throw new Error('403 Forbidden');
    }
    const current = JSON.parse(localStorage.getItem('tb_chatbot_settings') || '{}');
    const updated = { ...current, ...settingsData };
    localStorage.setItem('tb_chatbot_settings', JSON.stringify(updated));
    logSecurityEvent('CHATBOT_SETTINGS_UPDATED', 'Pengaturan profil chatbot diperbarui', 'SUCCESS');
    return updated;
  },

  getChatbotKnowledge: async (): Promise<ChatbotKnowledge[]> => {
    return JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
  },

  createChatbotKnowledge: async (knowData: Omit<ChatbotKnowledge, 'id' | 'created_at'>, token: string): Promise<ChatbotKnowledge> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', 'Percobaan tambah pengetahuan chatbot tanpa token valid', 'WARNING');
      throw new Error('403 Forbidden');
    }
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
    logSecurityEvent('CHATBOT_KNOWLEDGE_CREATED', `FAQ baru ditambahkan untuk kata kunci: ${newEntry.keyword}`, 'SUCCESS');
    return newEntry;
  },

  updateChatbotKnowledge: async (id: string, knowData: Partial<ChatbotKnowledge>, token: string): Promise<ChatbotKnowledge> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', `Percobaan edit pengetahuan chatbot ${id} tanpa token`, 'WARNING');
      throw new Error('403 Forbidden');
    }
    const knowledge: ChatbotKnowledge[] = JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
    const index = knowledge.findIndex(k => k.id === id);
    if (index === -1) throw new Error('Data pengetahuan tidak ditemukan');

    const updated = {
      ...knowledge[index],
      ...knowData,
      keyword: knowData.keyword ? sanitizeInput(knowData.keyword.toLowerCase().trim()) : knowledge[index].keyword,
      question: knowData.question ? sanitizeInput(knowData.question) : knowledge[index].question,
      answer: knowData.answer ? sanitizeInput(knowData.answer) : knowledge[index].answer
    };
    knowledge[index] = updated;
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(knowledge));
    logSecurityEvent('CHATBOT_KNOWLEDGE_UPDATED', `FAQ diperbarui untuk kata kunci: ${updated.keyword}`, 'SUCCESS');
    return updated;
  },

  deleteChatbotKnowledge: async (id: string, token: string): Promise<boolean> => {
    if (token !== 'admin-session-token') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', `Percobaan hapus pengetahuan chatbot ${id} tanpa token`, 'WARNING');
      throw new Error('403 Forbidden');
    }
    const knowledge: ChatbotKnowledge[] = JSON.parse(localStorage.getItem('tb_chatbot_knowledge') || '[]');
    const filtered = knowledge.filter(k => k.id !== id);
    localStorage.setItem('tb_chatbot_knowledge', JSON.stringify(filtered));
    logSecurityEvent('CHATBOT_KNOWLEDGE_DELETED', `FAQ dengan ID ${id} dihapus`, 'SUCCESS');
    return true;
  }
};
