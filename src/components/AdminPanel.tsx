import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, LogOut, Package, ShoppingBag, Terminal, Edit3, Trash2, Plus, 
  AlertCircle, RefreshCw, X, MessageSquare, UserPlus, Store, Lock, CheckCircle,
  BarChart3, DollarSign, TrendingUp, AlertTriangle, Printer, Wallet, Award, FileText,
  Moon, Sun, ChefHat, Box, Truck, Tag, Star, Download, MapPin, Camera, BookOpen, Users
} from 'lucide-react';
import { db } from '../db/supabaseClient';
import type { 
  Product, Order, ChatbotKnowledge, UserRole, UserAccount, Expense, ExpenseCategory, 
  StaffDivision, Coupon, CustomerReview, RecipeSOP, DeliveryTracker, OrderStatus 
} from '../db/supabaseClient';

interface AdminPanelProps {
  products: Product[];
  refreshProducts: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, refreshProducts }) => {
  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Authentication & Role State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [userDivision, setUserDivision] = useState<StaffDivision>('admin');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tab & Operational States
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'analytics' | 'expenses' | 'coupons' | 'reviews' | 'staff' | 'security' | 'chatbot' | 'dapur' | 'packaging' | 'kurir'>('orders');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('pegawai');
  const [newStaffDivision, setNewStaffDivision] = useState<StaffDivision>('kasir');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'Semua' | OrderStatus>('Semua');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [recipes, setRecipes] = useState<RecipeSOP[]>([]);
  const [deliveryTrackers, setDeliveryTrackers] = useState<DeliveryTracker[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<UserAccount[]>([]);

  // Filter Periode Laporan
  const [reportTimeframe, setReportTimeframe] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');

  // State POS Kasir Modal
  const [showPosModal, setShowPosModal] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Walk-in');
  const [posCustomerPhone, setPosCustomerPhone] = useState('081234567890');
  const [posDeliveryMethod, setPosDeliveryMethod] = useState<'Ambil Sendiri' | 'Kirim ke Rumah'>('Ambil Sendiri');
  const [posAddress, setPosAddress] = useState('');
  const [posCart, setPosCart] = useState<{ product_id: string; quantity: number }[]>([]);
  const [posError, setPosError] = useState('');

  // State Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState(10);
  const [couponMaxDisc, setCouponMaxDisc] = useState(20000);
  const [couponMinOrder, setCouponMinOrder] = useState(50000);

  // State Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Bahan Baku');
  const [expDescription, setExpDescription] = useState('');
  const [expAmount, setExpAmount] = useState<number>(100000);
  const [expDate, setExpDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State Resep SOP Modal
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeSOP | null>(null);

  // State Label Resi Pengiriman Modal
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

  // State Photo Proof Modal Kurir
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofOrderId, setProofOrderId] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=400');

  // State CRUD Produk
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodCategory, setProdCategory] = useState<'Roti' | 'Kue Basah' | 'Kue Kering' | 'Jajanan Pasar'>('Roti');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Chatbot & FAQ
  const [chatbotKnowledge, setChatbotKnowledge] = useState<ChatbotKnowledge[]>([]);

  // Sesi Persisten
  useEffect(() => {
    const savedToken = sessionStorage.getItem('tb_admin_token');
    const savedRole = sessionStorage.getItem('tb_admin_role') as UserRole | null;
    const savedDivision = sessionStorage.getItem('tb_admin_division') as StaffDivision | null;
    const savedName = sessionStorage.getItem('tb_admin_name');
    if (savedToken) {
      setToken(savedToken);
      if (savedRole) setUserRole(savedRole);
      if (savedDivision) {
        setUserDivision(savedDivision);
        if (savedDivision === 'dapur') setActiveTab('dapur');
        else if (savedDivision === 'packaging') setActiveTab('packaging');
        else if (savedDivision === 'kurir') setActiveTab('kurir');
      }
      if (savedName) setUserDisplayName(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch Data Sesuai Divisi
  const fetchAdminData = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const fetchedOrders = await db.getOrders(activeToken);
      setOrders(fetchedOrders);

      const fetchedExpenses = await db.getExpenses();
      setExpenses(fetchedExpenses);

      const fetchedCoupons = await db.getCoupons();
      setCoupons(fetchedCoupons);

      const fetchedReviews = await db.getCustomerReviews();
      setCustomerReviews(fetchedReviews);

      const fetchedRecipes = await db.getRecipes();
      setRecipes(fetchedRecipes);

      const fetchedTrackers = await db.getDeliveryTrackers();
      setDeliveryTrackers(fetchedTrackers);

      if (userRole === 'admin' || activeToken.includes('admin')) {
        const logs = await db.getSecurityLogs(activeToken);
        setSecurityLogs(logs);

        const accounts = await db.getStaffAccounts(activeToken);
        setStaffAccounts(accounts);
      }

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
        const role = res.role || 'admin';
        const division = res.division || (role === 'admin' ? 'admin' : 'kasir');
        const name = res.name || 'Pengelola Tiara Bakery';

        setUserRole(role);
        setUserDivision(division);
        setUserDisplayName(name);
        setIsLoggedIn(true);

        sessionStorage.setItem('tb_admin_token', res.token);
        sessionStorage.setItem('tb_admin_role', role);
        sessionStorage.setItem('tb_admin_division', division);
        sessionStorage.setItem('tb_admin_name', name);

        if (division === 'dapur') setActiveTab('dapur');
        else if (division === 'packaging') setActiveTab('packaging');
        else if (division === 'kurir') setActiveTab('kurir');
        else setActiveTab('orders');

        setPassword('');
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
    setUserDivision('admin');
    setUserDisplayName('');
    sessionStorage.removeItem('tb_admin_token');
    sessionStorage.removeItem('tb_admin_role');
    sessionStorage.removeItem('tb_admin_division');
    sessionStorage.removeItem('tb_admin_name');
  };

  // Update Status Pesanan
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await db.updateOrderStatus(orderId, status, token);
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // Assign Staf Ke Pesanan
  const handleAssignStaff = async (orderId: string, staffName: string) => {
    try {
      await db.assignOrderStaff(orderId, staffName, token);
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menugaskan staf: ${err.message}`);
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

  // Staff Management Handlers
  const handleAddStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffUsername.trim() || !newStaffName.trim() || !newStaffPassword.trim()) {
      alert('Semua kolom akun staf wajib diisi!');
      return;
    }
    try {
      await db.createStaffAccount({
        username: newStaffUsername,
        name: newStaffName,
        password: newStaffPassword,
        role: newStaffRole,
        division: newStaffDivision
      }, token);

      setShowAddStaffModal(false);
      setNewStaffUsername('');
      setNewStaffName('');
      setNewStaffPassword('');
      await fetchAdminData(token);
      alert('Akun staf berhasil dibuat!');
    } catch (err: any) {
      alert(`Gagal membuat akun staf: ${err.message}`);
    }
  };

  const handleDeleteStaffAccount = async (id: string, staffName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun staf "${staffName}"?`)) return;
    try {
      await db.deleteStaffAccount(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus akun: ${err.message}`);
    }
  };

  // POS Handlers
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
    if (posCart.length === 0) {
      setPosError('Pilih setidaknya 1 produk!');
      return;
    }

    try {
      await db.createOrder({
        customer_name: posCustomerName || 'Pelanggan Walk-in',
        customer_phone: posCustomerPhone || '081234567890',
        delivery_method: posDeliveryMethod,
        address: posDeliveryMethod === 'Kirim ke Rumah' ? posAddress : undefined,
        items: posCart
      });

      setPosCart([]);
      await refreshProducts();
      await fetchAdminData(token);
      setShowPosModal(false);
      alert('Transaksi Kasir POS Berhasil!');
    } catch (err: any) {
      setPosError(err.message || 'Gagal membuat pesanan POS.');
    }
  };

  // Coupon Manager
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createCoupon({
        code: couponCode,
        discount_percent: Number(couponPercent),
        max_discount: Number(couponMaxDisc),
        min_order: Number(couponMinOrder),
        valid_until: '2026-12-31'
      }, token);

      setShowCouponModal(false);
      setCouponCode('');
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal membuat voucher: ${err.message}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Hapus voucher promo ini?')) return;
    try {
      await db.deleteCoupon(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus voucher: ${err.message}`);
    }
  };

  // Expenses Handlers
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.createExpense({
        category: expCategory,
        description: expDescription,
        amount: Number(expAmount),
        expense_date: expDate ? new Date(expDate).toISOString() : new Date().toISOString()
      }, token);

      setShowExpenseModal(false);
      setExpDescription('');
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal mencatat pengeluaran: ${err.message}`);
    }
  };

  // Kurir Proof Upload
  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.updateDeliveryStatus(proofOrderId, 'Tiba di Tujuan', proofPhotoUrl);
      await db.updateOrderStatus(proofOrderId, 'Selesai', token);
      setShowProofModal(false);
      await fetchAdminData(token);
      alert('Foto bukti pengiriman berhasil diunggah! Status pesanan otomatis SELESAI.');
    } catch (err: any) {
      alert(`Gagal mengunggah foto bukti: ${err.message}`);
    }
  };

  // Ekspor Data Penjualan ke CSV
  const handleExportCSV = () => {
    const headers = ['ID Pesanan', 'Pelanggan', 'No HP', 'Metode Kirim', 'Total Harga', 'Status', 'Tanggal'];
    const rows = orders.map(o => [
      o.id,
      `"${o.customer_name}"`,
      o.customer_phone,
      o.delivery_method,
      o.total_price,
      o.status,
      new Date(o.created_at).toLocaleDateString('id-ID')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_TiaraBakery_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. FORM LOGIN UNIFIED PORTAL
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: '24px', backgroundColor: darkMode ? '#121212' : 'transparent' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: '440px', padding: '36px', textAlign: 'left', backgroundColor: darkMode ? '#1E1E1E' : '#FFF', color: darkMode ? '#E0E0E0' : 'inherit' }}>
          
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
            <h2 style={{ fontSize: '1.6rem', marginBottom: '6px', color: darkMode ? '#FFF' : 'inherit' }}>Portal Masuk Pengelola</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              TIARA BAKERY SAKO • Sistem Manajemen & Operasional Toko
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan username (admin/dapur/gudang/kurir)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
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
            🔒 <strong>Otentikasi Berbasis Divisi:</strong> Masuk dengan username & password Anda. Sistem akan secara otomatis mengarahkan ke Dasbor Admin, Dapur Produksi, Packaging Gudang, atau Kurir sesuai divisi akun Anda.
          </div>

        </div>
      </div>
    );
  }

  // Calculation Analytics
  const completedOrders = orders.filter(o => o.status === 'Selesai');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpensesAmount;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const posTotalCalculated = posCart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.product_id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  // 2. DASBOR UTAMA BERDASARKAN DIVISI & MODE GELAP
  return (
    <div style={{ backgroundColor: darkMode ? '#121212' : 'transparent', color: darkMode ? '#E0E0E0' : 'inherit', minHeight: '80vh', padding: '24px 0' }}>
      <div className="container" style={{ padding: '0 24px' }}>
        
        {/* TOP DIVISION BAR & THEME SWITCHER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '18px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.7rem', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, flexWrap: 'wrap' }}>
              TIARA BAKERY SAKO
              {userDivision === 'admin' && <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #8B0000, #4E0C0D)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>👑 OWNER / ADMIN</span>}
              {userDivision === 'dapur' && <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #E65100, #EF6C00)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>🍳 DAPUR & PRODUKSI</span>}
              {userDivision === 'packaging' && <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #6A1B9A, #8E24AA)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>📦 PACKAGING & GUDANG</span>}
              {userDivision === 'kasir' && <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #0288D1, #01579B)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>💬 KASIR & CS</span>}
              {userDivision === 'kurir' && <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)', color: 'white', borderRadius: '30px', fontWeight: 'bold' }}>🛵 KURIR & DELIVERY</span>}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Pengelola: <strong>{userDisplayName}</strong> • Layar Kerja Divisi {userDivision.toUpperCase()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {darkMode ? 'Modus Terang' : 'Modus Gelap'}
            </button>

            <button onClick={() => setShowPosModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px', backgroundColor: '#2E7D32' }}>
              <Store size={16} /> POS Kasir
            </button>
            <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D9534F', borderColor: '#D9534F', padding: '8px 14px' }}>
              Keluar <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* BANNER STOK KRITIS */}
        {lowStockProducts.length > 0 && (
          <div style={{ backgroundColor: '#FDEDEC', border: '1px solid #FADBD8', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textAlign: 'left', color: '#78281F' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} style={{ color: '#D9534F' }} />
              <span style={{ fontSize: '0.85rem' }}><strong>⚠️ Peringatan Stok Kritis ({lowStockProducts.length} Produk):</strong> {lowStockProducts.map(p => `${p.name} (${p.stock} Pcs)`).join(', ')}.</span>
            </div>
            <button onClick={() => setActiveTab('products')} style={{ padding: '4px 10px', backgroundColor: '#D9534F', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Perbarui Stok</button>
          </div>
        )}

        {/* NAVIGATION TAB BAR */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveTab('orders')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'inherit' }}><ShoppingBag size={16} /> Pesanan</button>
              <button onClick={() => setActiveTab('products')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'products' ? 'white' : 'inherit' }}><Package size={16} /> Katalog & Stok</button>
              <button onClick={() => setActiveTab('analytics')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'analytics' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'analytics' ? 'white' : 'inherit' }}><BarChart3 size={16} /> Laporan & Laba</button>
              <button onClick={() => setActiveTab('expenses')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'expenses' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'expenses' ? 'white' : 'inherit' }}><Wallet size={16} /> Pengeluaran</button>
              <button onClick={() => setActiveTab('coupons')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'coupons' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'coupons' ? 'white' : 'inherit' }}><Tag size={16} /> Promo & Voucher</button>
              <button onClick={() => setActiveTab('reviews')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'reviews' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'reviews' ? 'white' : 'inherit' }}><Star size={16} /> Rating Pelanggan</button>
              <button onClick={() => setActiveTab('staff')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'staff' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'staff' ? 'white' : 'inherit' }}><Users size={16} /> Kelola Staf & Pegawai</button>
              <button onClick={() => setActiveTab('security')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'security' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'security' ? 'white' : 'inherit' }}><Terminal size={16} /> Log Audit & Keamanan</button>
            </>
          )}

          {/* TAB SPESIFIK DIVISI */}
          <button onClick={() => setActiveTab('dapur')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'dapur' ? '#EF6C00' : 'transparent', color: activeTab === 'dapur' ? 'white' : 'inherit' }}><ChefHat size={16} /> Dapur & SOP</button>
          <button onClick={() => setActiveTab('packaging')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'packaging' ? '#8E24AA' : 'transparent', color: activeTab === 'packaging' ? 'white' : 'inherit' }}><Box size={16} /> Gudang & Packaging</button>
          <button onClick={() => setActiveTab('kurir')} className={`btn-secondary`} style={{ padding: '8px 14px', fontSize: '0.85rem', backgroundColor: activeTab === 'kurir' ? '#2E7D32' : 'transparent', color: activeTab === 'kurir' ? 'white' : 'inherit' }}><Truck size={16} /> Kurir Delivery</button>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="premium-card" style={{ padding: '24px', backgroundColor: darkMode ? '#1E1E1E' : 'var(--color-card-cream)', color: darkMode ? '#E0E0E0' : 'inherit', textAlign: 'left' }}>
          
          {/* TAB 1: ORDERS & ASSIGNMENT */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Daftar Semua Pesanan ({orders.length})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleExportCSV} className="btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} /> Unduh CSV Laporan
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {orders.map((o) => (
                  <div key={o.id} style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px', backgroundColor: darkMode ? '#2A2A2A' : '#FFFDF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--color-border)', paddingBottom: '10px', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>Pesanan #{o.id}</strong> • <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleString('id-ID')}</span>
                        {o.special_notes && <div style={{ backgroundColor: '#FFF3E0', color: '#E65100', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontWeight: 'bold' }}>{o.special_notes}</div>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Tugaskan Staf:</span>
                        <select
                          value={o.assigned_staff || 'Belum Ditugaskan'}
                          onChange={(e) => handleAssignStaff(o.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', border: '1px solid var(--color-border)' }}
                        >
                          <option value="Belum Ditugaskan">Belum Ditugaskan</option>
                          <option value="Chef Ani (Staf Dapur)">Chef Ani (Staf Dapur)</option>
                          <option value="Doni (Staf Packing)">Doni (Staf Packing)</option>
                          <option value="Eko (Staf Kurir)">Eko (Staf Kurir)</option>
                        </select>

                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                          style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold', border: '1px solid var(--color-border)' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dikonfirmasi">Dikonfirmasi</option>
                          <option value="Diproses Dapur">Diproses Dapur</option>
                          <option value="Dikemas">Dikemas</option>
                          <option value="Siap Kirim">Siap Kirim</option>
                          <option value="Dalam Perjalanan">Dalam Perjalanan</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Dibatalkan">Dibatalkan</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                      <strong>Pelanggan:</strong> {o.customer_name} ({o.customer_phone}) • <strong>Total:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Rp{o.total_price.toLocaleString()}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <strong>Item:</strong> {o.items?.map(i => `${i.product_name} (${i.quantity}x)`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB DIVISI DAPUR & PRODUKSI */}
          {activeTab === 'dapur' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#E65100' }}>
                  <ChefHat size={22} /> Layar Produksi Dapur ({orders.filter(o => o.status === 'Diproses Dapur' || o.status === 'Dikonfirmasi').length} Pesanan Dipanggang)
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid">
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Daftar Antrean Pembuatan Kue Hari Ini:</h4>
                  {orders.filter(o => o.status === 'Diproses Dapur' || o.status === 'Dikonfirmasi').map((o) => (
                    <div key={o.id} style={{ border: '1px solid #FFE0B2', borderRadius: '8px', padding: '14px', marginBottom: '10px', backgroundColor: darkMode ? '#2E1C0C' : '#FFF8E1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ color: '#E65100' }}>Pesanan #{o.id}</strong>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#FFE0B2', color: '#E65100', fontWeight: 'bold' }}>{o.status}</span>
                      </div>
                      {o.special_notes && <div style={{ fontSize: '0.8rem', color: '#D9534F', fontWeight: 'bold', marginBottom: '6px' }}>⚠️ CATATAN ALERGEN: {o.special_notes}</div>}
                      <ul style={{ paddingLeft: '20px', margin: '6px 0', fontSize: '0.85rem' }}>
                        {o.items?.map(i => (
                          <li key={i.id}><strong>{i.product_name}</strong> - {i.quantity} Pcs</li>
                        ))}
                      </ul>
                      <button onClick={() => handleUpdateStatus(o.id, 'Dikemas')} className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#E65100', width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                        <CheckCircle size={14} /> Tandai Selesai Dipanggang (Kirim ke Packaging)
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Resep & SOP Dapur Toko:</h4>
                  {recipes.map(r => (
                    <div key={r.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', marginBottom: '10px', backgroundColor: darkMode ? '#2A2A2A' : '#FFFDF9' }}>
                      <h5 style={{ margin: '0 0 6px', color: 'var(--color-primary)' }}>{r.product_name}</h5>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Bahan Baku utama: {r.ingredients.map(i => `${i.name} (${i.amount})`).join(', ')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 'bold' }}>Alergen: {r.allergen_info}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB DIVISI PACKAGING & GUDANG */}
          {activeTab === 'packaging' && (
            <div>
              <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8E24AA' }}>
                <Box size={22} /> Layar Gudang & Packaging ({orders.filter(o => o.status === 'Dikemas').length} Siap Kemas)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {orders.filter(o => o.status === 'Dikemas' || o.status === 'Diproses Dapur').map(o => (
                  <div key={o.id} style={{ border: '1px solid #E1BEE7', borderRadius: '8px', padding: '14px', backgroundColor: darkMode ? '#271B2B' : '#F3E5F5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#8E24AA' }}>Resi #{o.id}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#8E24AA' }}>{o.delivery_method}</span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem' }}><strong>Penerima:</strong> {o.customer_name} ({o.customer_phone})</p>
                    <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{o.address || 'Ambil Sendiri di Toko'}</p>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelectedLabelOrder(o)} className="btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.78rem', justifyContent: 'center' }}>
                        <Printer size={14} /> Cetak Label Resi
                      </button>
                      <button onClick={() => handleUpdateStatus(o.id, 'Siap Kirim')} className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.78rem', backgroundColor: '#8E24AA', justifyContent: 'center' }}>
                        Siap Kirim ➡️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB DIVISI KURIR DELIVERY */}
          {activeTab === 'kurir' && (
            <div>
              <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32' }}>
                <Truck size={22} /> Layar Kurir & Tracking Pengiriman ({orders.filter(o => o.status === 'Siap Kirim' || o.status === 'Dalam Perjalanan').length} Paket)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {orders.filter(o => o.status === 'Siap Kirim' || o.status === 'Dalam Perjalanan').map(o => (
                  <div key={o.id} style={{ border: '1px solid #A5D6A7', borderRadius: '8px', padding: '14px', backgroundColor: darkMode ? '#152E17' : '#E8F5E9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ color: '#2E7D32' }}>Pengiriman #{o.id}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2E7D32' }}>{o.status}</span>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.85rem' }}><strong>Tujuan:</strong> {o.customer_name} ({o.customer_phone})</p>
                    <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {o.address || 'Lokasi Toko Sako'}
                    </p>

                    {o.status === 'Siap Kirim' ? (
                      <button onClick={() => handleUpdateStatus(o.id, 'Dalam Perjalanan')} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', backgroundColor: '#2E7D32', justifyContent: 'center' }}>
                        🛵 Jalankan Pengiriman
                      </button>
                    ) : (
                      <button onClick={() => { setProofOrderId(o.id); setShowProofModal(true); }} className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.8rem', backgroundColor: '#1565C0', justifyContent: 'center' }}>
                        <Camera size={14} /> Upload Foto Bukti Diterima
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB VOUCHER & PROMO */}
          {activeTab === 'coupons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={20} /> Manajemen Kode Voucher Promo ({coupons.length})
                </h3>
                <button onClick={() => setShowCouponModal(true)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  <Plus size={14} /> Buat Voucher Baru
                </button>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Kode Voucher</th>
                      <th style={{ padding: '10px' }}>Diskon (%)</th>
                      <th style={{ padding: '10px' }}>Maks. Potongan</th>
                      <th style={{ padding: '10px' }}>Min. Belanja</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '10px' }}><code style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.9rem' }}>{c.code}</code></td>
                        <td style={{ padding: '10px' }}><strong>{c.discount_percent}%</strong></td>
                        <td style={{ padding: '10px' }}>Rp{c.max_discount.toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>Rp{c.min_order.toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button onClick={() => handleDeleteCoupon(c.id)} style={{ background: 'none', border: 'none', color: '#D9534F', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB RATING & REVIEW PELANGGAN */}
          {activeTab === 'reviews' && (
            <div>
              <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={20} style={{ color: 'var(--color-secondary-gold)' }} /> Ulasan & Rating Pelanggan ({customerReviews.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customerReviews.map(r => (
                  <div key={r.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '14px', backgroundColor: darkMode ? '#2A2A2A' : '#FFFDF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>{r.customer_name}</strong> - <span style={{ color: 'var(--color-secondary-gold)', fontWeight: 'bold' }}>{'★'.repeat(r.rating)} ({r.product_name})</span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>"{r.comment}"</p>
                    {r.admin_response ? (
                      <div style={{ backgroundColor: 'rgba(78,12,13,0.05)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', marginTop: '6px' }}>
                        <strong>Balasan Toko:</strong> {r.admin_response}
                      </div>
                    ) : (
                      <button onClick={async () => {
                        const reply = prompt(`Beri balasan ulasan ${r.customer_name}:`);
                        if (reply) {
                          await db.respondCustomerReview(r.id, reply, token);
                          fetchAdminData(token);
                        }
                      }} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}>
                        💬 Balas Ulasan Pelanggan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB MANAJEMEN STAF & PEGAWAI */}
          {activeTab === 'staff' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} style={{ color: 'var(--color-primary)' }} /> Direktori & Pengelolaan Akun Staf Pegawai ({staffAccounts.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    Tambah, hapus, dan atur penugasan divisi operasional untuk setiap staf pegawai toko
                  </p>
                </div>
                <button onClick={() => setShowAddStaffModal(true)} className="btn-primary" style={{ fontSize: '0.85rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={16} /> Tambah Akun Pegawai Baru
                </button>
              </div>

              <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden', backgroundColor: darkMode ? '#2A2A2A' : '#FFFDF9' }}>
                <table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-primary)', color: 'white', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Nama Lengkap Staf</th>
                      <th style={{ padding: '12px' }}>Username</th>
                      <th style={{ padding: '12px' }}>Peran (Role)</th>
                      <th style={{ padding: '12px' }}>Divisi Kerja</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffAccounts.map((acc) => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px' }}><strong>{acc.name}</strong></td>
                        <td style={{ padding: '12px' }}><code style={{ fontWeight: 'bold' }}>{acc.username}</code></td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: acc.role === 'admin' ? '#FADBD8' : '#D4E6F1', color: acc.role === 'admin' ? '#78281F' : '#1B4F72' }}>
                            {acc.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: acc.division === 'dapur' ? '#FFE0B2' : acc.division === 'packaging' ? '#E1BEE7' : acc.division === 'kurir' ? '#C8E6C9' : '#E3F2FD', color: acc.division === 'dapur' ? '#E65100' : acc.division === 'packaging' ? '#8E24AA' : acc.division === 'kurir' ? '#2E7D32' : '#0288D1' }}>
                            {acc.division === 'dapur' ? '🍳 Dapur Produksi' : acc.division === 'packaging' ? '📦 Packaging Gudang' : acc.division === 'kurir' ? '🛵 Kurir Delivery' : acc.division === 'kasir' ? '💬 Kasir & CS' : '👑 Owner Admin'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {acc.username !== 'admin' ? (
                            <button onClick={() => handleDeleteStaffAccount(acc.id, acc.name)} style={{ background: 'none', border: 'none', color: '#D9534F', cursor: 'pointer' }}>
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Akun Utama</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL PRINT LABEL RESI */}
      {selectedLabelOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'left', backgroundColor: '#FFF', color: '#000' }}>
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px', textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>TIARA BAKERY SAKO</h3>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Resi Pengiriman Paket #{selectedLabelOrder.id}</p>
            </div>
            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Penerima:</strong> {selectedLabelOrder.customer_name} ({selectedLabelOrder.customer_phone})</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Alamat:</strong> {selectedLabelOrder.address || 'Ambil Sendiri'}</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0' }}><strong>Daftar Item:</strong> {selectedLabelOrder.items?.map(i => `${i.product_name} (${i.quantity}x)`).join(', ')}</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Cetak Resi</button>
              <button onClick={() => setSelectedLabelOrder(null)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUKTI FOTO KURIR */}
      {showProofModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 12px' }}>Upload Bukti Foto Penerimaan</h3>
            <form onSubmit={handleUploadProof} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>URL Foto Paket di Tangan Pelanggan</label>
                <input type="text" className="form-input" value={proofPhotoUrl} onChange={(e) => setProofPhotoUrl(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '10px' }}>Konfirmasi Paket Tiba</button>
              <button type="button" onClick={() => setShowProofModal(false)} className="btn-outline" style={{ justifyContent: 'center', padding: '8px' }}>Batal</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL POS KASIR */}
      {showPosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', textAlign: 'left', backgroundColor: darkMode ? '#1E1E1E' : '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} /> Transaksi POS Kasir Toko
              </h3>
              <button onClick={() => setShowPosModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={20} /></button>
            </div>

            <form onSubmit={handlePosSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" className="form-input" placeholder="Nama Pelanggan" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} required />
              <input type="text" className="form-input" placeholder="No. WhatsApp" value={posCustomerPhone} onChange={(e) => setPosCustomerPhone(e.target.value)} required />
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '6px' }}>
                {products.map(p => {
                  const cartItem = posCart.find(i => i.product_id === p.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{p.name} (Rp{p.price.toLocaleString()})</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button type="button" onClick={() => handlePosRemoveFromCart(p.id)} disabled={qty === 0}>-</button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{qty}</span>
                        <button type="button" onClick={() => handlePosAddToCart(p.id)} disabled={p.stock <= qty}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-primary)', textAlign: 'right' }}>
                Total POS: Rp{posTotalCalculated.toLocaleString()}
              </div>

              {posError && <div style={{ color: '#D9534F', fontSize: '0.8rem' }}>{posError}</div>}
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '10px' }}>Proses Pembayaran POS</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH AKUN PEGAWAI BARU */}
      {showAddStaffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="premium-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', textAlign: 'left', backgroundColor: darkMode ? '#1E1E1E' : '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} /> Tambah Akun Pegawai Baru
              </h3>
              <button onClick={() => setShowAddStaffModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddStaffAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Nama Lengkap Staf</label>
                <input type="text" className="form-input" placeholder="contoh: Chef Ani (Staf Dapur)" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Username Pengguna</label>
                <input type="text" className="form-input" placeholder="contoh: chef_ani" value={newStaffUsername} onChange={(e) => setNewStaffUsername(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Kata Sandi (Password)</label>
                <input type="password" className="form-input" placeholder="Masukkan kata sandi staf" value={newStaffPassword} onChange={(e) => setNewStaffPassword(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Peran Utama (Role)</label>
                <select className="form-input" value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value as UserRole)}>
                  <option value="pegawai">Pegawai (Staf Operasional)</option>
                  <option value="admin">Administrator (Owner Full Access)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Divisi Kerja (Tampilan Layar)</label>
                <select className="form-input" value={newStaffDivision} onChange={(e) => setNewStaffDivision(e.target.value as StaffDivision)}>
                  <option value="kasir">💬 Kasir & Customer Service</option>
                  <option value="dapur">🍳 Dapur & Produksi Kue</option>
                  <option value="packaging">📦 Packaging & Gudang</option>
                  <option value="kurir">🛵 Kurir Delivery Paket</option>
                  <option value="admin">👑 Administrator (Owner)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '10px', marginTop: '6px' }}>
                Simpan & Buat Akun Pegawai
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
