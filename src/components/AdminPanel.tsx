import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, LogOut, Package, ShoppingBag, Terminal, Edit3, Trash2, Plus, 
  AlertCircle, RefreshCw, X, MessageSquare, UserPlus, Store, Lock 
} from 'lucide-react';
import { db } from '../db/supabaseClient';
import type { Product, Order, ChatbotKnowledge, UserRole, UserAccount } from '../db/supabaseClient';

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
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'security' | 'chatbot'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'Semua' | 'Pending' | 'Diproses' | 'Selesai'>('Semua');
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<UserAccount[]>([]);

  // State POS Kasir Modal (Buat Pesanan Langsung di Toko)
  const [showPosModal, setShowPosModal] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Toko (Walk-in)');
  const [posCustomerPhone, setPosCustomerPhone] = useState('081234567890');
  const [posDeliveryMethod, setPosDeliveryMethod] = useState<'Ambil Sendiri' | 'Kirim ke Rumah'>('Ambil Sendiri');
  const [posAddress, setPosAddress] = useState('');
  const [posCart, setPosCart] = useState<{ product_id: string; quantity: number }[]>([]);
  const [posError, setPosError] = useState('');
  const [posSuccess, setPosSuccess] = useState('');

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

  // State Tambah Staf Baru (Khusus Admin)
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

  // Quick Preset Login Handler
  const handleQuickLogin = (rolePreset: 'admin' | 'pegawai') => {
    if (rolePreset === 'admin') {
      setUsername('admin');
      setPassword('adminTiara123!');
    } else {
      setUsername('pegawai');
      setPassword('pegawaiTiara123!');
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

  // Quick Update Stok Produk (Dapat diakses Admin & Pegawai)
  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      await db.updateProductStock(productId, newStock, token);
      await refreshProducts();
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal memperbarui stok: ${err.message}`);
    }
  };

  // POS Kasir: Tambah/Kurang Item ke Keranjang POS
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

  // CRUD Produk Actions (Khusus Admin)
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

  // Chatbot Settings Handler (Admin Only)
  const handleSaveBotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang dapat mengubah pengaturan chatbot.');
      return;
    }
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

  // FAQ CRUD Handlers (Admin Only for Save/Delete)
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
    if (userRole !== 'admin') {
      alert('Akses Terbatas: Hanya Admin yang diperbolehkan menghapus FAQ.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;
    try {
      await db.deleteChatbotKnowledge(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus FAQ: ${err.message}`);
    }
  };

  // Tambah Staf Baru (Admin Only)
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

  // 1. FORM LOGIN DUAL-ROLE (ADMIN & PEGAWAI)
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
              TIARA BAKERY SAKO • Otorisasi Berbasis Peran (RBAC)
            </p>
          </div>

          {/* Quick Role Fill Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              style={{
                padding: '10px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--color-primary)',
                backgroundColor: username === 'admin' ? 'var(--color-primary)' : 'transparent',
                color: username === 'admin' ? 'white' : 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              👑 Login Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pegawai')}
              style={{
                padding: '10px',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #0288D1',
                backgroundColor: username === 'pegawai' ? '#0288D1' : 'transparent',
                color: username === 'pegawai' ? 'white' : '#0288D1',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              👨‍🍳 Login Pegawai
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                Username Pengguna
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan username (admin / pegawai)"
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
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <div
                style={{
                  backgroundColor: 'rgba(217, 83, 79, 0.1)',
                  color: '#D9534F',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  lineHeight: '1.4'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '1rem',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Memverifikasi Sesi...' : (
                <>
                  Masuk ke Dasbor Sistem <Key size={16} />
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'left', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔑 Kredensial Demo Pengujian:</p>
            <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <li><strong>Admin (Owner)</strong>: <code>admin</code> / <code>adminTiara123!</code></li>
              <li><strong>Pegawai (Kasir)</strong>: <code>pegawai</code> / <code>pegawaiTiara123!</code></li>
            </ul>
          </div>

        </div>
      </div>
    );
  }

  // Filter Order List
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'Semua') return true;
    return o.status === orderFilter;
  });

  // Calculate POS Order Total
  const posTotalCalculated = posCart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.product_id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  // 2. DASBOR UTAMA BERBASIS PERAN (ADMIN & PEGAWAI)
  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '75vh' }}>
      
      {/* Header Dashboard & Role Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            Dasbor Pengelolaan
            {userRole === 'admin' ? (
              <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #8B0000, #4E0C0D)', color: 'white', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                👑 ADMINISTRATOR (OWNER)
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'linear-gradient(135deg, #0288D1, #01579B)', color: 'white', borderRadius: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                👨‍🍳 STAF OPERASIONAL / KASIR
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Selamat bekerja, <strong>{userDisplayName}</strong> di TIARA BAKERY SAKO
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick POS button available for both Admin and Pegawai */}
          <button
            onClick={() => setShowPosModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '10px 16px', backgroundColor: '#2E7D32' }}
          >
            <Store size={18} /> POS Kasir Cepat
          </button>

          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D9534F', borderColor: '#D9534F', padding: '10px 16px' }}
          >
            Keluar <LogOut size={16} />
          </button>
        </div>
      </div>

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

          {/* Info Hak Akses Peran */}
          <div
            style={{
              marginTop: '20px',
              backgroundColor: userRole === 'admin' ? 'rgba(78, 12, 13, 0.05)' : 'rgba(2, 136, 209, 0.08)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-dark)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', marginBottom: '6px', color: userRole === 'admin' ? 'var(--color-primary)' : '#0288D1' }}>
              Hak Akses Peran Aktif:
            </h4>
            {userRole === 'admin' ? (
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li>✅ Full CRUD Produk & Katalog</li>
                <li>✅ Manajemen Kelola Pesanan</li>
                <li>✅ Manajemen Akun Staf Pegawai</li>
                <li>✅ Audit Log & Konfigurasi AI</li>
              </ul>
            ) : (
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                <li>✅ Pemrosesan Pesanan & POS Kasir</li>
                <li>✅ Update Stok Produk Cepat</li>
                <li>🔒 Hapus Produk/Pesanan Dibatasi</li>
                <li>🔒 Konfigurasi Akun/Log Dibatasi</li>
              </ul>
            )}
          </div>
        </div>

        {/* Tab Contents */}
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

                  <button
                    onClick={() => fetchAdminData(token)}
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Memuat data pesanan...</div>
              ) : filteredOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '18px',
                        backgroundColor: '#FFFDF9'
                      }}
                    >
                      {/* Order Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          borderBottom: '1px dashed var(--color-border)',
                          paddingBottom: '12px',
                          marginBottom: '12px',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
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

                        {/* Status Switcher */}
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

                      {/* Customer Details */}
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

                      {/* Items Rincian */}
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Belum ada pesanan masuk untuk kategori ini.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KATALOG & MANAJEMEN STOK PRODUK */}
          {activeTab === 'products' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Katalog Produk & Penyesuaian Stok</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                    {userRole === 'admin' ? 'Kelola produk penuh (Tambah, Edit, Hapus, & Update Stok)' : 'Staf dapat melihat katalog & memperbarui jumlah stok kue yang tersedia'}
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
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: '#FFFDF9',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
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

                      {/* Quick Stock Controller */}
                      <div style={{ backgroundColor: 'rgba(78, 12, 13, 0.04)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Stok Tersedia:</span>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: p.stock <= 5 ? '#D9534F' : '#2E7D32' }}>
                            {p.stock} Pcs
                          </span>
                        </div>

                        {/* Quick adjustment buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, Math.max(0, p.stock - 1))}
                            style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock + 1)}
                            style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock + 5)}
                            style={{ flex: 1, padding: '4px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </div>

                    {userRole === 'admin' ? (
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn-outline"
                          style={{ flex: 1, padding: '6px', fontSize: '0.8rem', justifyContent: 'center' }}
                        >
                          <Edit3 size={14} /> Edit Detail
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          style={{ padding: '6px 10px', backgroundColor: '#FDEDEC', color: '#D9534F', border: '1px solid #FADBD8', borderRadius: '6px', cursor: 'pointer' }}
                        >
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

          {/* TAB 3: CHATBOT AI & FAQ KNOWLEDGE BASE */}
          {activeTab === 'chatbot' && (
            <div style={{ textAlign: 'left' }}>
              {userRole === 'pegawai' && (
                <div style={{ backgroundColor: 'rgba(2, 136, 209, 0.1)', padding: '12px 16px', borderRadius: '8px', border: '1px solid #0288D1', color: '#01579B', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} />
                  <span><strong>Mode Baca (Read-Only):</strong> Hanya Admin yang memiliki wewenang mengubah sistem prompt dan FAQ Chatbot.</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Pengaturan Pelayan Virtual "Tiara"</h3>
              </div>

              {/* Bot Persona Form */}
              <form onSubmit={handleSaveBotSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nama Pelayan Virtual</label>
                  <input
                    type="text"
                    className="form-input"
                    value={botNameInput}
                    onChange={(e) => setBotNameInput(e.target.value)}
                    disabled={userRole !== 'admin'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pesan Menyapa Awal (Welcome Message)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={welcomeMessageInput}
                    onChange={(e) => setWelcomeMessageInput(e.target.value)}
                    disabled={userRole !== 'admin'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pesan Jawaban Default (Fallback Message)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={defaultFallbackInput}
                    onChange={(e) => setDefaultFallbackInput(e.target.value)}
                    disabled={userRole !== 'admin'}
                  />
                </div>

                {botSettingsSuccess && (
                  <div style={{ color: 'var(--color-success-green)', fontSize: '0.85rem', fontWeight: 'bold' }}>{botSettingsSuccess}</div>
                )}

                {userRole === 'admin' && (
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={isSavingBotSettings}>
                    {isSavingBotSettings ? 'Menyimpan...' : 'Simpan Pengaturan Chatbot'}
                  </button>
                )}
              </form>

              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '24px 0' }} />

              {/* FAQ Knowledge Table */}
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

          {/* TAB 4: LOG AUDIT KEAMANAN & AKUN STAF (KHUSUS ADMIN) */}
          {activeTab === 'security' && (
            <div style={{ textAlign: 'left' }}>
              {userRole !== 'admin' ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Lock size={48} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.3rem' }}>Akses Khusus Administrator (Owner)</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '8px auto 0' }}>
                    Log audit keamanan dan pengelolaan akun staf pegawai hanya dapat diakses oleh Administrator dengan kredensial penuh.
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

                  {/* Staff Table */}
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
                  <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '12px', backgroundColor: '#1E1E1E', color: '#00FF66', fontFamily: 'monospace', fontSize: '0.78rem' }}>
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
                  <select
                    className="form-input"
                    value={posDeliveryMethod}
                    onChange={(e) => setPosDeliveryMethod(e.target.value as any)}
                  >
                    <option value="Ambil Sendiri">Ambil Sendiri di Toko</option>
                    <option value="Kirim ke Rumah">Kirim ke Rumah (Kurir)</option>
                  </select>
                </div>
                {posDeliveryMethod === 'Kirim ke Rumah' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Alamat Pengiriman</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Alamat lengkap tujuan"
                      value={posAddress}
                      onChange={(e) => setPosAddress(e.target.value)}
                      required
                    />
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
