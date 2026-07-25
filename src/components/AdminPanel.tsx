import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, LogOut, Package, ShoppingBag, Terminal, Edit3, Trash2, Plus, 
  AlertCircle, RefreshCw, X, MessageSquare, UserPlus, Store, Lock,
  BarChart3, DollarSign, TrendingUp, AlertTriangle, Printer, Wallet, Award, FileText
} from 'lucide-react';
import { db } from '../db/supabaseClient';
import type { Product, Order, ChatbotKnowledge, UserRole, UserAccount, Expense, ExpenseCategory } from '../db/supabaseClient';

interface AdminPanelProps {
  products: Product[];
  refreshProducts: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, refreshProducts }) => {
  // Authentication & Role State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab & Operational States
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'expenses' | 'security' | 'chatbot'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'Semua' | 'Pending' | 'Diproses' | 'Selesai'>('Semua');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<UserAccount[]>([]);

  // Filter Periode Laporan (Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini, Semua)
  const [reportTimeframe, setReportTimeframe] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // State POS Kasir Modal
  const [showPosModal, setShowPosModal] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Toko (Walk-in)');
  const [posCustomerPhone, setPosCustomerPhone] = useState('081234567890');
  const [posDeliveryMethod, setPosDeliveryMethod] = useState<'Ambil Sendiri' | 'Kirim ke Rumah'>('Ambil Sendiri');
  const [posAddress, setPosAddress] = useState('');
  const [posCart, setPosCart] = useState<{ product_id: string; quantity: number }[]>([]);
  const [posError, setPosError] = useState('');
  const [posSuccess, setPosSuccess] = useState('');

  // State Pengeluaran Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Bahan Baku');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(100000);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expError, setExpError] = useState('');

  // State CRUD Produk
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodCategory, setProdCategory] = useState<'Roti' | 'Kue Basah' | 'Kue Kering' | 'Jajanan Pasar'>('Roti');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [crudError, setCrudError] = useState('');

  // State Chatbot Settings & FAQ
  const [chatbotKnowledge, setChatbotKnowledge] = useState<ChatbotKnowledge[]>([]);
  const [isSavingBotSettings, setIsSavingBotSettings] = useState(false);
  const [botSettingsSuccess, setBotSettingsSuccess] = useState('');
  const [botNameInput, setBotNameInput] = useState('');
  const [welcomeMessageInput, setWelcomeMessageInput] = useState('');
  const [defaultFallbackInput, setDefaultFallbackInput] = useState('');

  // State FAQ CRUD
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editFaq, setEditFaq] = useState<ChatbotKnowledge | null>(null);
  const [faqKeyword, setFaqKeyword] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqError, setFaqError] = useState('');

  // State Tambah Staf Baru
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('pegawai');
  const [staffError, setStaffError] = useState('');

  // Sesi Persisten
  useEffect(() => {
    const savedToken = sessionStorage.getItem('tb_admin_token');
    const savedRole = sessionStorage.getItem('tb_admin_role') as UserRole | null;
    const savedName = sessionStorage.getItem('tb_admin_name');
    if (savedToken) {
      setToken(savedToken);
      if (savedRole) setUserRole(savedRole);
      if (savedName) setUserDisplayName(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch Data Sesuai Peran
  const fetchAdminData = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const fetchedOrders = await db.getOrders(activeToken);
      setOrders(fetchedOrders);

      const fetchedExpenses = await db.getExpenses();
      setExpenses(fetchedExpenses);

      if (userRole === 'admin' || activeToken.includes('admin')) {
        const logs = await db.getSecurityLogs(activeToken);
        setSecurityLogs(logs);

        const accounts = await db.getStaffAccounts(activeToken);
        setStaffAccounts(accounts);
      }

      const botSettings = await db.getChatbotSettings();
      setBotNameInput(botSettings.botName || '');
      setWelcomeMessageInput(botSettings.welcomeMessage || '');
      setDefaultFallbackInput(botSettings.defaultFallback || '');

      const botKnowledge = await db.getChatbotKnowledge();
      setChatbotKnowledge(botKnowledge);
    } catch (err: any) {
      console.error('Fetch Admin Data Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchAdminData(token);
    }
  }, [isLoggedIn, token]);

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await db.adminLogin(username, password);
      
      if (res.success && res.token) {
        setToken(res.token);
        const role = res.role || (username.toLowerCase().includes('pegawai') ? 'pegawai' : 'admin');
        const name = res.name || (role === 'admin' ? 'Administrator (Owner)' : 'Staf Operasional / Kasir');

        setUserRole(role);
        setUserDisplayName(name);
        setIsLoggedIn(true);

        sessionStorage.setItem('tb_admin_token', res.token);
        sessionStorage.setItem('tb_admin_role', role);
        sessionStorage.setItem('tb_admin_name', name);

        setPassword('');
        setLoginError('');
      } else {
        setLoginError(res.error || 'Username atau password salah.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    setUserRole('admin');
    setUserDisplayName('');
    sessionStorage.removeItem('tb_admin_token');
    sessionStorage.removeItem('tb_admin_role');
    sessionStorage.removeItem('tb_admin_name');
  };

  // Update Status Pesanan
  const handleUpdateStatus = async (orderId: string, status: 'Pending' | 'Diproses' | 'Selesai') => {
    try {
      await db.updateOrderStatus(orderId, status, token);
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // Quick Update Stok Produk
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      await db.updateProductStock(productId, newStock, token);
      await refreshProducts();
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal memperbarui stok: ${err.message}`);
    }
  };

  // POS Kasir Cart Handlers
  const handlePosAddToCart = (productId: string) => {
    const existing = posCart.find(i => i.product_id === productId);
    if (existing) {
      setPosCart(posCart.map(i => i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setPosCart([...posCart, { product_id: productId, quantity: 1 }]);
    }
  };

  const handlePosRemoveFromCart = (productId: string) => {
    const existing = posCart.find(i => i.product_id === productId);
    if (existing && existing.quantity > 1) {
      setPosCart(posCart.map(i => i.product_id === productId ? { ...i, quantity: i.quantity - 1 } : i));
    } else {
      setPosCart(posCart.filter(i => i.product_id !== productId));
    }
  };

  const handlePosSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosError('');
    setPosSuccess('');

    if (posCart.length === 0) {
      setPosError('Pilih setidaknya 1 produk untuk checkout POS!');
      return;
    }

    try {
      const newOrder = await db.createOrder({
        customer_name: posCustomerName || 'Pelanggan Toko',
        customer_phone: posCustomerPhone || '081234567890',
        delivery_method: posDeliveryMethod,
        address: posDeliveryMethod === 'Kirim ke Rumah' ? posAddress : undefined,
        items: posCart
      });

      setPosSuccess(`Pesanan POS #${newOrder.id} berhasil dibuat! (Total: Rp${newOrder.total_price.toLocaleString()})`);
      setPosCart([]);
      await refreshProducts();
      await fetchAdminData(token);
      setTimeout(() => {
        setPosSuccess('');
        setShowPosModal(false);
      }, 2000);
    } catch (err: any) {
      setPosError(err.message || 'Gagal membuat pesanan POS.');
    }
  };

  // Expenses Handlers
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpError('');

    if (!expDescription.trim() || expAmount <= 0) {
      setExpError('Keterangan dan nominal pengeluaran wajib diisi!');
      return;
    }

    try {
      await db.createExpense({
        category: expCategory,
        description: expDescription,
        amount: Number(expAmount),
        expense_date: expDate ? new Date(expDate).toISOString() : new Date().toISOString()
      }, token);

      setShowExpenseModal(false);
      setExpDescription('');
      setExpAmount(100000);
      await fetchAdminData(token);
    } catch (err: any) {
      setExpError(err.message || 'Gagal mencatat pengeluaran.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Hapus catatan pengeluaran ini?')) return;
    try {
      await db.deleteExpense(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus pengeluaran: ${err.message}`);
    }
  };

  // CRUD Produk Actions (Admin Only)
  const handleOpenAddModal = () => {
    setEditProduct(null);
    setProdName('');
    setProdPrice(5000);
    setProdStock(10);
    setProdCategory('Roti');
    setProdDescription('');
    setProdImage('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400');
    setCrudError('');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditProduct(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdStock(p.stock);
    setProdCategory(p.category);
    setProdDescription(p.description);
    setProdImage(p.image_url);
    setCrudError('');
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError('');
    if (!prodName.trim()) {
      setCrudError('Nama produk wajib diisi.');
      return;
    }

    try {
      const payload = {
        name: prodName,
        price: Number(prodPrice),
        stock: Number(prodStock),
        category: prodCategory,
        description: prodDescription,
        image_url: prodImage
      };

      if (editProduct) {
        await db.updateProduct(editProduct.id, payload, token);
      } else {
        await db.createProduct(payload, token);
      }

      await refreshProducts();
      await fetchAdminData(token);
      setShowProductModal(false);
    } catch (err: any) {
      setCrudError(err.message || 'Gagal menyimpan produk.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (userRole !== 'admin') {
      alert('Akses Terbatas: Hanya Admin (Owner) yang diperbolehkan menghapus produk.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini secara permanen?')) return;
    try {
      await db.deleteProduct(id, token);
      await refreshProducts();
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus produk: ${err.message}`);
    }
  };

  // Chatbot & FAQ Handlers
  const handleSaveBotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    setIsSavingBotSettings(true);
    setBotSettingsSuccess('');
    try {
      await db.updateChatbotSettings({
        botName: botNameInput,
        welcomeMessage: welcomeMessageInput,
        defaultFallback: defaultFallbackInput
      }, token);

      setBotSettingsSuccess('Pengaturan profil Chatbot berhasil disimpan!');
      setTimeout(() => setBotSettingsSuccess(''), 3000);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menyimpan pengaturan chatbot: ${err.message}`);
    } finally {
      setIsSavingBotSettings(false);
    }
  };

  const handleOpenAddFaqModal = () => {
    setEditFaq(null);
    setFaqKeyword('');
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqError('');
    setShowFaqModal(true);
  };

  const handleOpenEditFaqModal = (faq: ChatbotKnowledge) => {
    setEditFaq(faq);
    setFaqKeyword(faq.keyword);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqError('');
    setShowFaqModal(true);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaqError('');
    if (!faqKeyword.trim() || !faqQuestion.trim() || !faqAnswer.trim()) {
      setFaqError('Semua kolom FAQ harus diisi.');
      return;
    }

    try {
      const payload = {
        keyword: faqKeyword,
        question: faqQuestion,
        answer: faqAnswer
      };

      if (editFaq) {
        await db.updateChatbotKnowledge(editFaq.id, payload, token);
      } else {
        await db.createChatbotKnowledge(payload, token);
      }

      await fetchAdminData(token);
      setShowFaqModal(false);
    } catch (err: any) {
      setFaqError(err.message || 'Gagal menyimpan FAQ.');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;
    try {
      await db.deleteChatbotKnowledge(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus FAQ: ${err.message}`);
    }
  };

  // Tambah Staf Baru
  const handleAddStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    if (!newStaffUsername.trim() || !newStaffName.trim() || !newStaffPassword.trim()) {
      setStaffError('Semua kolom wajib diisi!');
      return;
    }

    try {
      await db.createStaffAccount({
        username: newStaffUsername,
        name: newStaffName,
        password: newStaffPassword,
        role: newStaffRole
      }, token);

      setShowAddStaffModal(false);
      setNewStaffUsername('');
      setNewStaffName('');
      setNewStaffPassword('');
      await fetchAdminData(token);
      alert('Akun staf berhasil dibuat!');
    } catch (err: any) {
      setStaffError(err.message || 'Gagal menambahkan akun staf.');
    }
  };

  const handleDeleteStaffAccount = async (id: string, staffName: string) => {
    if (!window.confirm(`Hapus akun staf "${staffName}"?`)) return;
    try {
      await db.deleteStaffAccount(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus akun: ${err.message}`);
    }
  };

  // Cetak / Print Laporan
  const handlePrintReport = () => {
    window.print();
  };

  // 1. FORM LOGIN DUAL-ROLE
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: '24px' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: '460px', padding: '36px', textAlign: 'left' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              className="flex-center"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(78, 12, 13, 0.1)',
                color: 'var(--color-primary)',
                margin: '0 auto 12px'
              }}
            >
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Portal Masuk Pengelola</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              TIARA BAKERY SAKO • Sistem Manajemen & Operasional Toko
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan username anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                Kata Sandi (Password)
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan kata sandi anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <div style={{ backgroundColor: 'rgba(217, 83, 79, 0.1)', color: '#D9534F', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}>
              {isLoading ? 'Memverifikasi...' : <>Masuk Sistem <Key size={16} /></>}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '16px', lineHeight: '1.5' }}>
            🔒 <strong>Otentikasi Berbasis Peran:</strong> Masuk dengan username & password Anda. Sistem akan secara otomatis mengarahkan ke Dasbor Admin (Owner) atau Dasbor Pegawai (Kasir) sesuai dengan peran akun Anda.
          </div>

        </div>
      </div>
    );
  }

  // Filter Order & Analitik Penjualan Berkala
  const filteredOrders = orders.filter(o => orderFilter === 'Semua' || o.status === orderFilter);

  // Filter Date Helper Laporan Berkala
  const now = new Date();
  const getFilteredTimeframeOrders = () => {
    return orders.filter(o => {
      if (o.status !== 'Selesai') return false; // Hanya hitung pesanan selesai sebagai pendapatan riil
      const oDate = new Date(o.created_at);
      if (reportTimeframe === 'today') {
        return oDate.toDateString() === now.toDateString();
      }
      if (reportTimeframe === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
        return oDate >= oneWeekAgo;
      }
      if (reportTimeframe === 'month') {
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      if (reportTimeframe === 'year') {
        return oDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  };

  const timeframeOrders = getFilteredTimeframeOrders();
  const totalRevenue = timeframeOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Filter Expenses by timeframe
  const timeframeExpenses = expenses.filter(e => {
    const eDate = new Date(e.expense_date);
    if (reportTimeframe === 'today') return eDate.toDateString() === now.toDateString();
    if (reportTimeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      return eDate >= oneWeekAgo;
    }
    if (reportTimeframe === 'month') return eDate.getMonth() === now.getMonth() && eDate.getFullYear() === now.getFullYear();
    if (reportTimeframe === 'year') return eDate.getFullYear() === now.getFullYear();
    return true;
  });

  const totalExpenseAmount = timeframeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenseAmount;
  const avgOrderValue = timeframeOrders.length > 0 ? Math.round(totalRevenue / timeframeOrders.length) : 0;

  // Analitik Produk Terlaris (Best Seller)
  const productSalesMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
  timeframeOrders.forEach(o => {
    o.items?.forEach(item => {
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.product_name].qty += item.quantity;
      productSalesMap[item.product_name].revenue += item.price_at_purchase * item.quantity;
    });
  });

  const bestSellingProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty);

  // Detect Low Stock Products (<= 5)
  const lowStockProducts = products.filter(p => p.stock <= 5);

  // POS Total Calculation
  const posTotalCalculated = posCart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.product_id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  // 2. DASBOR UTAMA UMKM (ADMIN & PEGAWAI)
  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '75vh' }}>
      
      {/* HEADER DASBOR & INDIKATOR HAK AKSES */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', margin: 0 }}>
            Dasbor Pengelolaan UMKM
            {userRole === 'admin' ? (
              <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #8B0000, #4E0C0D)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>
                👑 ADMINISTRATOR (OWNER)
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #0288D1, #01579B)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>
                👨‍🍳 STAF OPERASIONAL / KASIR
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Selamat bekerja, <strong>{userDisplayName}</strong> di TIARA BAKERY SAKO
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setShowPosModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '10px 16px', backgroundColor: '#2E7D32' }}>
            <Store size={18} /> POS Kasir Cepat
          </button>
          <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D9534F', borderColor: '#D9534F', padding: '10px 16px' }}>
            Keluar <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* BANNER PERINGATAN STOK KRITIS (LOW STOCK ALERT) */}
      {lowStockProducts.length > 0 && (
        <div
          style={{
            backgroundColor: '#FDEDEC',
            border: '1px solid #FADBD8',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            textAlign: 'left',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#78281F' }}>
            <AlertTriangle size={24} style={{ color: '#D9534F', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>⚠️ Peringatan Stok Kritis ({lowStockProducts.length} Produk Hampir Habis):</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>
                {lowStockProducts.map(p => `${p.name} (${p.stock} Pcs)`).join(', ')}. Harap segera buat jadwal pemanggangan/restock kue!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '6px 14px',
              backgroundColor: '#D9534F',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            Update Stok Sekarang
          </button>
        </div>
      )}

      {/* DASHBOARD GRID NAVIGATION & TABS */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px' }} className="grid">
        
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'orders' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <ShoppingBag size={18} /> Pesanan & POS Kasir
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'products' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Package size={18} /> Katalog & Stok Produk
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'analytics' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'analytics' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <BarChart3 size={18} /> Analitik & Laporan Berkala
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'expenses' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'expenses' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Wallet size={18} /> Pengelunaran Toko (HPP)
          </button>

          <button
            onClick={() => setActiveTab('chatbot')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'chatbot' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'chatbot' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <MessageSquare size={18} /> Chatbot AI & FAQ {userRole === 'pegawai' && '(Read-Only)'}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`btn-secondary`}
            style={{
              justifyContent: 'flex-start',
              width: '100%',
              backgroundColor: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-card-cream)',
              color: activeTab === 'security' ? 'white' : 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <Terminal size={18} /> {userRole === 'admin' ? 'Log Audit & Akun Staf' : 'Info Akses Sistem'}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="premium-card" style={{ padding: '24px', backgroundColor: 'var(--color-card-cream)' }}>
          
          {/* TAB 1: MANAJEMEN PESANAN & POS KASIR */}
          {activeTab === 'orders' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Daftar Pesanan Masuk ({filteredOrders.length})</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Kelola status pesanan masuk dari aplikasi website atau input langsung via POS Kasir
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as any)}
                    className="form-input"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="Semua">Semua Status ({orders.length})</option>
                    <option value="Pending">Pending ({orders.filter(o => o.status === 'Pending').length})</option>
                    <option value="Diproses">Diproses ({orders.filter(o => o.status === 'Diproses').length})</option>
                    <option value="Selesai">Selesai ({orders.filter(o => o.status === 'Selesai').length})</option>
                  </select>

                  <button onClick={() => fetchAdminData(token)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Memuat data pesanan...</div>
              ) : filteredOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredOrders.map((o) => (
                    <div key={o.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFDF9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--color-border)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Pesanan #{o.id}
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: o.delivery_method === 'Ambil Sendiri' ? '#E8F5E9' : '#E3F2FD', color: o.delivery_method === 'Ambil Sendiri' ? '#2E7D32' : '#1565C0', fontWeight: 'bold' }}>
                              {o.delivery_method}
                            </span>
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Waktu: {new Date(o.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ubah Status:</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              backgroundColor: o.status === 'Pending' ? '#FEEFB3' : o.status === 'Diproses' ? '#BDE5F8' : '#DFF2BF',
                              color: o.status === 'Pending' ? '#9F6000' : o.status === 'Diproses' ? '#00529B' : '#4F8A10',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">⏳ Pending</option>
                            <option value="Diproses">👨‍🍳 Diproses</option>
                            <option value="Selesai">✅ Selesai</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.88rem', marginBottom: '14px' }} className="grid">
                        <div>
                          <p style={{ margin: '0 0 4px' }}><strong>Pelanggan:</strong> {o.customer_name}</p>
                          <p style={{ margin: 0 }}><strong>No. WhatsApp:</strong> {o.customer_phone}</p>
                        </div>
                        <div>
                          {o.address && <p style={{ margin: '0 0 4px' }}><strong>Alamat Pengiriman:</strong> {o.address}</p>}
                          <p style={{ margin: 0 }}><strong>Total Pesanan:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp{o.total_price.toLocaleString()}</span></p>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'var(--color-bg-cream)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <h5 style={{ fontSize: '0.85rem', margin: '0 0 8px', color: 'var(--color-primary)' }}>Rincian Item Belanja:</h5>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                              <th style={{ paddingBottom: '6px' }}>Nama Produk</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'center' }}>Jumlah</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Harga Satuan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map((item) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '6px 0' }}>{item.product_name}</td>
                                <td style={{ padding: '6px 0', textAlign: 'center' }}>{item.quantity}x</td>
                                <td style={{ padding: '6px 0', textAlign: 'right' }}>Rp{item.price_at_purchase.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Belum ada pesanan masuk.</div>
              )}
            </div>
          )}

          {/* TAB 2: KATALOG PRODUK & PENYESUAIAN STOK */}
          {activeTab === 'products' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Katalog Produk & Penyesuaian Stok</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    {userRole === 'admin' ? 'Kelola produk penuh (Tambah, Edit, Hapus, & Update Stok)' : 'Staf dapat melihat katalog & memperbarui jumlah stok kue'}
                  </p>
                </div>
                {userRole === 'admin' && (
                  <button onClick={handleOpenAddModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Tambah Produk Baru
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map((p) => (
                  <div key={p.id} style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', backgroundColor: '#FFFDF9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                        <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>{p.name}</h4>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--color-bg-cream)', border: '1px solid var(--color-border)' }}>
                          {p.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-secondary-gold)', margin: '0 0 10px' }}>
                        Rp{p.price.toLocaleString()}
                      </p>

                      <div style={{ backgroundColor: p.stock <= 5 ? '#FDEDEC' : 'rgba(78, 12, 13, 0.04)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Stok Tersedia:</span>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: p.stock <= 5 ? '#D9534F' : '#2E7D32' }}>
                            {p.stock} Pcs {p.stock <= 5 && '⚠️'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleQuickStockUpdate(p.id, Math.max(0, p.stock - 1))} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>-1</button>
                          <button onClick={() => handleQuickStockUpdate(p.id, p.stock + 1)} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>+1</button>
                          <button onClick={() => handleQuickStockUpdate(p.id, p.stock + 5)} style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}>+5</button>
                        </div>
                      </div>
                    </div>

                    {userRole === 'admin' ? (
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '10px' }}>
                        <button onClick={() => handleOpenEditModal(p)} className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.8rem', justifyContent: 'center' }}>
                          <Edit3 size={14} /> Edit Detail
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '6px 10px', backgroundColor: '#FDEDEC', color: '#D9534F', border: '1px solid #FADBD8', borderRadius: '6px', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: '6px' }}>
                        💡 Staf dapat langsung menyesuaikan stok di atas
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ANALITIK & LAPORAN BERKALA UMKM (NEW FITUR UTAMA) */}
          {activeTab === 'analytics' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={24} style={{ color: 'var(--color-primary)' }} /> Laporan & Analitik Keuangan UMKM
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Ringkasan performa penjualan, pengeluaran operasional, dan estimasi Laba Bersih toko
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Filter Periode */}
                  <select
                    value={reportTimeframe}
                    onChange={(e) => setReportTimeframe(e.target.value as any)}
                    className="form-input"
                    style={{ padding: '8px 14px', fontSize: '0.85rem', fontWeight: 'bold' }}
                  >
                    <option value="today">📅 Hari Ini</option>
                    <option value="week">📅 7 Hari Terakhir</option>
                    <option value="month">📅 Bulan Ini</option>
                    <option value="year">📅 Tahun Ini</option>
                    <option value="all">📅 Semua Waktu</option>
                  </select>

                  <button
                    onClick={handlePrintReport}
                    className="btn-outline"
                    style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} /> Ekspor / Cetak Laporan
                  </button>
                </div>
              </div>

              {/* EXECUTIVE KPI SUMMARY CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }} className="grid">
                {/* 1. Pendapatan Kotor */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFDF9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <DollarSign size={18} style={{ color: 'var(--color-primary)' }} /> Pendapatan Kotor (Omzet)
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    Rp{totalRevenue.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>dari {timeframeOrders.length} pesanan selesai</span>
                </div>

                {/* 2. Pengeluaran Operasional */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFDF9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <Wallet size={18} style={{ color: '#D9534F' }} /> Total Pengeluaran
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#D9534F' }}>
                    Rp{totalExpenseAmount.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>HPP bahan baku & toko</span>
                </div>

                {/* 3. Laba Bersih */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', backgroundColor: netProfit >= 0 ? '#E8F5E9' : '#FDEDEC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <TrendingUp size={18} style={{ color: netProfit >= 0 ? '#2E7D32' : '#D9534F' }} /> Estimasi Laba Bersih
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: netProfit >= 0 ? '#2E7D32' : '#D9534F' }}>
                    Rp{netProfit.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: netProfit >= 0 ? '#2E7D32' : '#D9534F', fontWeight: 'bold' }}>
                    {netProfit >= 0 ? 'Surplus Laba' : 'Defisit (Perlu Efisiensi)'}
                  </span>
                </div>

                {/* 4. Rata-rata Nilai Transaksi */}
                <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '18px', backgroundColor: '#FFFDF9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <FileText size={18} style={{ color: '#0288D1' }} /> Rata-Rata Transaksi
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#0288D1' }}>
                    Rp{avgOrderValue.toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>per transaksi pelanggan</span>
                </div>
              </div>

              {/* TABLE PRODUK TERLARIS (BEST SELLING PRODUCTS) */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', backgroundColor: '#FFFDF9', marginBottom: '28px' }}>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 16px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} /> Produk Paling Terlaris (Best Sellers)
                </h4>

                {bestSellingProducts.length > 0 ? (
                  <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '8px' }}># Peringkat</th>
                        <th style={{ padding: '8px' }}>Nama Produk</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Total Terjual</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total Kontribusi Omzet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestSellingProducts.map((p, idx) => (
                        <tr key={p.name} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>#{idx + 1}</td>
                          <td style={{ padding: '10px 8px' }}><strong>{p.name}</strong></td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <span style={{ padding: '2px 10px', backgroundColor: 'rgba(78,12,13,0.1)', color: 'var(--color-primary)', borderRadius: '12px', fontWeight: 'bold' }}>
                              {p.qty} Pcs
                            </span>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-secondary-gold)' }}>
                            Rp{p.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '20px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Belum ada data transaksi selesai pada periode ini.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PENGELUARAN OPERASIONAL TOKO (EXPENSES) */}
          {activeTab === 'expenses' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={22} style={{ color: 'var(--color-primary)' }} /> Pencatatan Pengeluaran & HPP Toko
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Catat pembelian bahan baku (terigu, keju), operasional (kemasan/listrik), dan gaji staf untuk akurasi Laba Bersih UMKM
                  </p>
                </div>

                <button onClick={() => setShowExpenseModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Catat Pengeluaran Baru
                </button>
              </div>

              {/* TABLE EXPENSES */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFDF9' }}>
                <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Tanggal</th>
                      <th style={{ padding: '12px' }}>Kategori</th>
                      <th style={{ padding: '12px' }}>Keterangan Pengeluaran</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Nominal (Rp)</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px' }}>{new Date(exp.expense_date).toLocaleDateString('id-ID')}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: exp.category === 'Bahan Baku' ? '#E8F5E9' : exp.category === 'Operasional Toko' ? '#E3F2FD' : '#FFF3E0', color: exp.category === 'Bahan Baku' ? '#2E7D32' : exp.category === 'Operasional Toko' ? '#1565C0' : '#E65100' }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}><strong>{exp.description}</strong></td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#D9534F' }}>
                          Rp{exp.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteExpense(exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D9534F' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CHATBOT AI & FAQ */}
          {activeTab === 'chatbot' && (
            <div style={{ textAlign: 'left' }}>
              {userRole === 'pegawai' && (
                <div style={{ backgroundColor: 'rgba(2, 136, 209, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid #0288D1', color: '#01579B', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} />
                  <span><strong>Mode Baca (Read-Only):</strong> Hanya Admin yang memiliki wewenang mengubah sistem prompt dan FAQ Chatbot.</span>
                </div>
              )}

              <h3 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Pengaturan Pelayan Virtual "Tiara"</h3>

              <form onSubmit={handleSaveBotSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nama Pelayan Virtual</label>
                  <input type="text" className="form-input" value={botNameInput} onChange={(e) => setBotNameInput(e.target.value)} disabled={userRole !== 'admin'} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pesan Menyapa Awal (Welcome Message)</label>
                  <textarea className="form-input" rows={3} value={welcomeMessageInput} onChange={(e) => setWelcomeMessageInput(e.target.value)} disabled={userRole !== 'admin'} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pesan Jawaban Default (Fallback Message)</label>
                  <textarea className="form-input" rows={3} value={defaultFallbackInput} onChange={(e) => setDefaultFallbackInput(e.target.value)} disabled={userRole !== 'admin'} />
                </div>
                {botSettingsSuccess && <div style={{ color: 'var(--color-success-green)', fontSize: '0.85rem', fontWeight: 'bold' }}>{botSettingsSuccess}</div>}
                {userRole === 'admin' && (
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={isSavingBotSettings}>
                    {isSavingBotSettings ? 'Menyimpan...' : 'Simpan Pengaturan Chatbot'}
                  </button>
                )}
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '24px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Basis Pengetahuan FAQ Chatbot ({chatbotKnowledge.length})</h4>
                {userRole === 'admin' && (
                  <button onClick={handleOpenAddFaqModal} className="btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    <Plus size={14} /> Tambah Kata Kunci FAQ
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatbotKnowledge.map((faq) => (
                  <div key={faq.id} style={{ border: '1px solid var(--color-border)', padding: '14px', borderRadius: '8px', backgroundColor: '#FFFDF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '4px' }}>
                        Kata Kunci: "{faq.keyword}"
                      </span>
                      {userRole === 'admin' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEditFaqModal(faq)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteFaq(faq.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D9534F' }}><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>T: {faq.question}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>J: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT KEAMANAN & AKUN STAF */}
          {activeTab === 'security' && (
            <div style={{ textAlign: 'left' }}>
              {userRole !== 'admin' ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Lock size={48} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.3rem' }}>Akses Khusus Administrator (Owner)</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '8px auto 0' }}>
                    Log audit keamanan dan pengelolaan akun staf pegawai hanya dapat diakses oleh Administrator.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Kelola Akun Staf Pegawai ({staffAccounts.length})</h3>
                    <button onClick={() => setShowAddStaffModal(true)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
                      <UserPlus size={16} /> Tambah Staf Baru
                    </button>
                  </div>

                  <div style={{ marginBottom: '32px', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'left' }}>
                          <th style={{ padding: '10px' }}>Nama Lengkap</th>
                          <th style={{ padding: '10px' }}>Username</th>
                          <th style={{ padding: '10px' }}>Peran (Role)</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Tindakan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffAccounts.map((acc) => (
                          <tr key={acc.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FFFDF9' }}>
                            <td style={{ padding: '10px' }}><strong>{acc.name}</strong></td>
                            <td style={{ padding: '10px' }}><code>{acc.username}</code></td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: acc.role === 'admin' ? '#FADBD8' : '#D4E6F1', color: acc.role === 'admin' ? '#78281F' : '#1B4F72' }}>
                                {acc.role.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>
                              {acc.username !== 'admin' && (
                                <button onClick={() => handleDeleteStaffAccount(acc.id, acc.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D9534F' }}>
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Audit Log Aktivitas Keamanan ({securityLogs.length})</h3>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', backgroundColor: '#1E1E1E', color: '#00FF66', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {securityLogs.map((log) => (
                      <div key={log.id} style={{ marginBottom: '6px', borderBottom: '1px dashed #333', paddingBottom: '4px' }}>
                        [{new Date(log.timestamp).toLocaleTimeString()}] [{log.status}] [{log.eventType}] - {log.detail} (IP: {log.ipSimulated})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL POS KASIR */}
      {showPosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={22} /> POS Kasir - Buat Pesanan Toko Langsung
              </h3>
              <button onClick={() => setShowPosModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handlePosSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nama Pelanggan Walk-in</label>
                  <input type="text" className="form-input" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>No. WhatsApp / HP</label>
                  <input type="text" className="form-input" value={posCustomerPhone} onChange={(e) => setPosCustomerPhone(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Metode Penyerahan</label>
                  <select className="form-input" value={posDeliveryMethod} onChange={(e) => setPosDeliveryMethod(e.target.value as any)}>
                    <option value="Ambil Sendiri">Ambil Sendiri di Toko</option>
                    <option value="Kirim ke Rumah">Kirim ke Rumah (Kurir)</option>
                  </select>
                </div>
                {posDeliveryMethod === 'Kirim ke Rumah' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Alamat Pengiriman</label>
                    <input type="text" className="form-input" placeholder="Alamat lengkap" value={posAddress} onChange={(e) => setPosAddress(e.target.value)} required />
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Pilih Produk Belanjaan:</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px', backgroundColor: '#FFF' }}>
                  {products.map((prod) => {
                    const cartItem = posCart.find(i => i.product_id === prod.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    return (
                      <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', borderBottom: '1px solid #eee' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{prod.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Rp{prod.price.toLocaleString()} • Stok: {prod.stock}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button type="button" onClick={() => handlePosRemoveFromCart(prod.id)} disabled={qty === 0} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                          <button type="button" onClick={() => handlePosAddToCart(prod.id)} disabled={prod.stock <= qty} style={{ padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg-cream)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  <span>Total Transaksi POS:</span>
                  <span>Rp{posTotalCalculated.toLocaleString()}</span>
                </div>
              </div>

              {posError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{posError}</div>}
              {posSuccess && <div style={{ color: 'var(--color-success-green)', fontSize: '0.85rem', fontWeight: 'bold' }}>{posSuccess}</div>}

              <button type="submit" className="btn-primary" style={{ padding: '12px', justifyContent: 'center' }}>
                Proses Transaksi Kasir POS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATAT PENGELUARAN BARU */}
      {showExpenseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '480px', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} /> Catat Pengeluaran Operasional
              </h3>
              <button onClick={() => setShowExpenseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Kategori Pengeluaran</label>
                <select className="form-input" value={expCategory} onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}>
                  <option value="Bahan Baku">Bahan Baku (Terigu, Mentega, Cokelat)</option>
                  <option value="Operasional Toko">Operasional Toko (Listrik, Plastik/Dus)</option>
                  <option value="Gaji/Bonus Staf">Gaji / Bonus Staf</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Keterangan Rincian Pengeluaran</label>
                <input type="text" className="form-input" placeholder="contoh: Pembelian Tepung Terigu 25kg" value={expDescription} onChange={(e) => setExpDescription(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nominal (Rp)</label>
                  <input type="number" className="form-input" value={expAmount} onChange={(e) => setExpAmount(Number(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tanggal Transaksi</label>
                  <input type="date" className="form-input" value={expDate} onChange={(e) => setExpDate(e.target.value)} required />
                </div>
              </div>

              {expError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{expError}</div>}

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '12px' }}>
                Simpan Catatan Pengeluaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUCT CRUD */}
      {showProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{editProduct ? 'Edit Detail Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nama Produk</label>
                <input type="text" className="form-input" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="grid">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Harga (Rp)</label>
                  <input type="number" className="form-input" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Jumlah Stok</label>
                  <input type="number" className="form-input" value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Kategori Produk</label>
                <select className="form-input" value={prodCategory} onChange={(e) => setProdCategory(e.target.value as any)}>
                  <option value="Roti">Roti</option>
                  <option value="Kue Basah">Kue Basah</option>
                  <option value="Kue Kering">Kue Kering</option>
                  <option value="Jajanan Pasar">Jajanan Pasar</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Deskripsi Produk</label>
                <textarea className="form-input" rows={2} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>URL Gambar Produk</label>
                <input type="text" className="form-input" value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
              </div>
              {crudError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{crudError}</div>}
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Simpan Produk</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FAQ CRUD */}
      {showFaqModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '480px', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{editFaq ? 'Edit Entri FAQ' : 'Tambah Kata Kunci FAQ Baru'}</h3>
              <button onClick={() => setShowFaqModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Kata Kunci Pencarian (Keyword)</label>
                <input type="text" className="form-input" placeholder="contoh: halal, ongkir, alamat" value={faqKeyword} onChange={(e) => setFaqKeyword(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Pertanyaan</label>
                <input type="text" className="form-input" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Jawaban Chatbot Virtual</label>
                <textarea className="form-input" rows={3} value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} required />
              </div>
              {faqError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{faqError}</div>}
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Simpan Entri FAQ</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH STAF BARU */}
      {showAddStaffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Buat Akun Staf Baru</h3>
              <button onClick={() => setShowAddStaffModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStaffAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nama Lengkap Staf</label>
                <input type="text" className="form-input" placeholder="contoh: Siti (Kasir)" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Username</label>
                <input type="text" className="form-input" placeholder="contoh: siti_kasir" value={newStaffUsername} onChange={(e) => setNewStaffUsername(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Kata Sandi (Password)</label>
                <input type="password" className="form-input" value={newStaffPassword} onChange={(e) => setNewStaffPassword(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Peran (Role)</label>
                <select className="form-input" value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value as UserRole)}>
                  <option value="pegawai">Pegawai (Staf Operasional / Kasir)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>
              {staffError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{staffError}</div>}
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Buat Akun Staf</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
