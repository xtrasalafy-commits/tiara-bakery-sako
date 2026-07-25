import React, { useState, useEffect } from 'react';
import { Shield, Key, LogOut, Package, ShoppingBag, Terminal, Edit3, Trash2, Plus, AlertCircle, RefreshCw, CheckCircle, X, MessageSquare } from 'lucide-react';
import { db } from '../db/supabaseClient';
import type { Product, Order, ChatbotKnowledge } from '../db/supabaseClient';

interface AdminPanelProps {
  products: Product[];
  refreshProducts: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ products, refreshProducts }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'security' | 'chatbot'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // State Chatbot

  const [chatbotKnowledge, setChatbotKnowledge] = useState<ChatbotKnowledge[]>([]);
  const [isSavingBotSettings, setIsSavingBotSettings] = useState(false);
  const [botSettingsSuccess, setBotSettingsSuccess] = useState('');

  // State Form Chatbot Settings
  const [botNameInput, setBotNameInput] = useState('');
  const [welcomeMessageInput, setWelcomeMessageInput] = useState('');
  const [defaultFallbackInput, setDefaultFallbackInput] = useState('');
  
  // State CRUD FAQ
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editFaq, setEditFaq] = useState<ChatbotKnowledge | null>(null);
  const [faqKeyword, setFaqKeyword] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqError, setFaqError] = useState('');

  // Sesi Persisten Sederhana untuk kenyamanan demo
  useEffect(() => {
    const savedToken = sessionStorage.getItem('tb_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch Data (Pesanan, Log, Chatbot Config)
  const fetchAdminData = async (activeToken: string) => {
    setIsLoading(true);
    try {
      const fetchedOrders = await db.getOrders(activeToken);
      setOrders(fetchedOrders);

      const logs = await db.getSecurityLogs(activeToken);
      setSecurityLogs(logs);

      const botSettings = await db.getChatbotSettings();

      setBotNameInput(botSettings.botName || '');
      setWelcomeMessageInput(botSettings.welcomeMessage || '');
      setDefaultFallbackInput(botSettings.defaultFallback || '');

      const botKnowledge = await db.getChatbotKnowledge();
      setChatbotKnowledge(botKnowledge);
    } catch (err: any) {
      console.error(err);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchAdminData(token);
    }
  }, [isLoggedIn, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      // Panggil login dengan proteksi rate limit simulator di backend/dbSimulator
      const res = await db.adminLogin(username, password);
      
      if (res.success && res.token) {
        setToken(res.token);
        setIsLoggedIn(true);
        sessionStorage.setItem('tb_admin_token', res.token);
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
    sessionStorage.removeItem('tb_admin_token');
  };

  const handleUpdateStatus = async (orderId: string, status: 'Pending' | 'Diproses' | 'Selesai') => {
    try {
      await db.updateOrderStatus(orderId, status, token);
      // Refresh orders
      fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  // CRUD PRODUK ACTIONS
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
      setCrudError('Nama produk tidak boleh kosong.');
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await db.deleteProduct(id, token);
      await refreshProducts();
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus produk: ${err.message}`);
    }
  };

  // CHATBOT ACTIONS
  const handleSaveBotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBotSettings(true);
    setBotSettingsSuccess('');
    try {
      await db.updateChatbotSettings({
        botName: botNameInput,
        welcomeMessage: welcomeMessageInput,
        defaultFallback: defaultFallbackInput
      }, token);

      setBotSettingsSuccess('Pengaturan chatbot berhasil disimpan!');
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
      setFaqError('Semua field FAQ harus diisi.');
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;
    try {
      await db.deleteChatbotKnowledge(id, token);
      await fetchAdminData(token);
    } catch (err: any) {
      alert(`Gagal menghapus FAQ: ${err.message}`);
    }
  };

  // 1. TAMPILAN LOGIN FORM (JIKA BELUM LOGIN)
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: '400px', padding: '36px', textAlign: 'left' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              className="flex-center"
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(78, 12, 13, 0.1)',
                color: 'var(--color-primary)',
                margin: '0 auto 12px'
              }}
            >
              <Shield size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Login Administrator</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              TIARA BAKERY SAKO • Akses Terenkripsi Aman
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
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan password admin"
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
                  Masuk Sistem Aman <Key size={16} />
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            🔒 Uji Keamanan: Username default adalah **admin** dan password adalah **adminTiara123!**
          </div>

        </div>
      </div>
    );
  }

  // 2. TAMPILAN DASHBOARD UTAMA ADMIN
  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '70vh' }}>
      
      {/* Dashboard Header */}
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
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Dasbor Keamanan & Pengelolaan <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: 'var(--color-success-green)', color: 'white', borderRadius: '30px', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>Secured</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Selamat datang Administrator TIARA BAKERY SAKO
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D9534F', borderColor: '#D9534F' }}
        >
          Keluar Sesi <LogOut size={16} />
        </button>
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
            <ShoppingBag size={18} /> Manajemen Pesanan
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
            <Package size={18} /> Manajemen Produk (CRUD)
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
            <Terminal size={18} /> Log Keamanan (Audit)
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
            <MessageSquare size={18} /> Pengaturan Chatbot
          </button>

          <div
            style={{
              marginTop: '30px',
              backgroundColor: 'rgba(78, 12, 13, 0.05)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              fontSize: '0.8rem',
              color: 'var(--color-text-dark)'
            }}
          >
            <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-primary)' }}>Keamanan Terpasang:</h4>
            <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Row-Level Security (RLS)</li>
              <li>Input HTML Sanitized</li>
              <li>Zod Schema Validation</li>
              <li>Anti-Brute Force active</li>
            </ul>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="premium-card" style={{ padding: '24px', backgroundColor: 'var(--color-card-cream)' }}>
          
          {/* TAB 1: MANAJEMEN PESANAN */}
          {activeTab === 'orders' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Daftar Pesanan Masuk ({orders.length})</h3>
                <button
                  onClick={() => fetchAdminData(token)}
                  style={{ background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={14} /> Refresh Data
                </button>
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Memuat data pesanan...</div>
              ) : orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: '#FFFDF9'
                      }}
                    >
                      {/* Order info header */}
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
                          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>
                            Pesanan #{o.id}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Dibuat: {new Date(o.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Status update controller */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value as any)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid var(--color-border)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              backgroundColor: o.status === 'Pending' ? '#FEEFB3' : o.status === 'Diproses' ? '#BDE5F8' : '#DFF2BF',
                              color: o.status === 'Pending' ? '#9F6000' : o.status === 'Diproses' ? '#00529B' : '#4F8A10'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem', marginBottom: '16px' }} className="grid">
                        <div>
                          <p><strong>Nama:</strong> {o.customer_name}</p>
                          <p><strong>WhatsApp:</strong> {o.customer_phone}</p>
                        </div>
                        <div>
                          <p><strong>Metode:</strong> {o.delivery_method}</p>
                          {o.address && <p><strong>Alamat:</strong> {o.address}</p>}
                        </div>
                      </div>

                      {/* Items Table */}
                      <div style={{ backgroundColor: 'var(--color-bg-cream)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <h5 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-primary)' }}>Rincian Belanja:</h5>
                        <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                              <th style={{ paddingBottom: '6px' }}>Nama Produk</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'center' }}>Jumlah</th>
                              <th style={{ paddingBottom: '6px', textAlign: 'right' }}>Harga</th>
                            </tr>
                          </thead>
                          <tbody>
                            {o.items?.map((item) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                <td style={{ padding: '6px 0' }}>{item.product_name}</td>
                                <td style={{ padding: '6px 0', textAlign: 'center' }}>{item.quantity} pcs</td>
                                <td style={{ padding: '6px 0', textAlign: 'right' }}>Rp {item.price_at_purchase.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                          Total: Rp {o.total_price.toLocaleString()}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Belum ada pesanan masuk.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANAJEMEN PRODUK */}
          {activeTab === 'products' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Daftar Kue & Roti Toko</h3>
                <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Plus size={16} /> Tambah Produk Baru
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '12px' }}>Foto</th>
                      <th style={{ padding: '12px' }}>Nama Produk</th>
                      <th style={{ padding: '12px' }}>Kategori</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Harga</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Stok</th>
                      <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '12px' }}>
                          <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>{p.name}</td>
                        <td style={{ padding: '12px' }}>{p.category}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>Rp {p.price.toLocaleString()}</td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: p.stock <= 5 ? 'bold' : 'normal', color: p.stock <= 5 ? '#D9534F' : 'inherit' }}>
                          {p.stock} pcs
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => handleOpenEditModal(p)} style={{ background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)' }} title="Edit">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'transparent', cursor: 'pointer', color: '#D9534F' }} title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOG AUDIT KEAMANAN */}
          {activeTab === 'security' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Sistem Log Audit Keamanan (Security Audit Logs)
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Mencatat seluruh aktivitas otentikasi, modifikasi, dan potensi ancaman yang berhasil ditangkal secara real-time.
                  </p>
                </div>
                <button
                  onClick={() => fetchAdminData(token)}
                  style={{ background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={14} /> Refresh Logs
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '10px' }}>Waktu</th>
                      <th style={{ padding: '10px' }}>Kategori Event</th>
                      <th style={{ padding: '10px' }}>Deskripsi Rincian</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>IP Client</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: log.status === 'WARNING' ? 'rgba(217, 83, 79, 0.05)' : log.status === 'FAILED' ? 'rgba(240, 173, 78, 0.05)' : 'transparent' }}>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          <span style={{ color: log.status === 'WARNING' || log.status === 'FAILED' ? '#D9534F' : 'var(--color-primary)' }}>
                            {log.eventType}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{log.detail}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'monospace' }}>{log.ipSimulated}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              backgroundColor: log.status === 'SUCCESS' ? '#DFF2BF' : log.status === 'WARNING' ? '#FEEFB3' : '#FFD2D2',
                              color: log.status === 'SUCCESS' ? '#4F8A10' : log.status === 'WARNING' ? '#9F6000' : '#D8000C'
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* TAB 4: PENGATURAN CHATBOT */}
          {activeTab === 'chatbot' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Pengaturan Asisten Toko & Basis Pengetahuan
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Kustomisasi identitas pelayan virtual toko dan tambah data jawaban otomatis (FAQ) agar asisten pintar menjawab chat pelanggan dengan tepat.
                  </p>
                </div>
                <button
                  onClick={() => fetchAdminData(token)}
                  style={{ background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {/* Grid Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                
                {/* Bagian 1: Profil Asisten */}
                <div style={{ backgroundColor: '#FFFDF9', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: 'var(--color-primary)', borderBottom: '1px dashed var(--color-border)', paddingBottom: '8px' }}>
                    🤖 Profil & Karakter Chatbot
                  </h4>
                  
                  <form onSubmit={handleSaveBotSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nama Panggilan Chatbot</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={botNameInput} 
                        onChange={(e) => setBotNameInput(e.target.value)} 
                        required 
                        placeholder="Contoh: Tiara"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Nama ini akan ditampilkan pada header chat pelanggan.</span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pesan Sambutan Awal (Welcome Message)</label>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        value={welcomeMessageInput} 
                        onChange={(e) => setWelcomeMessageInput(e.target.value)} 
                        required
                        style={{ resize: 'vertical' }}
                        placeholder="Ketik kalimat sambutan..."
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Gunakan format markdown `**tebal**` untuk menebalkan kata.</span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Jawaban Default (Fallback Message)</label>
                      <textarea 
                        className="form-input" 
                        rows={4} 
                        value={defaultFallbackInput} 
                        onChange={(e) => setDefaultFallbackInput(e.target.value)} 
                        required
                        style={{ resize: 'vertical' }}
                        placeholder="Ketik jawaban chatbot bila tidak mengerti pertanyaan..."
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Ditampilkan bila pertanyaan user tidak cocok dengan katalog atau FAQ mana pun.</span>
                    </div>

                    {botSettingsSuccess && (
                      <div style={{ backgroundColor: '#DFF2BF', color: '#4F8A10', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} /> <span>{botSettingsSuccess}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={isSavingBotSettings}
                      style={{ alignSelf: 'flex-start', minWidth: '150px', justifyContent: 'center' }}
                    >
                      {isSavingBotSettings ? 'Menyimpan...' : 'Simpan Profil Bot'}
                    </button>
                  </form>
                </div>

                {/* Bagian 2: Daftar FAQ / Knowledge */}
                <div style={{ backgroundColor: '#FFFDF9', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px dashed var(--color-border)', paddingBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                      📚 Basis Pengetahuan FAQ (Data & Kata Kunci)
                    </h4>
                    <button 
                      onClick={handleOpenAddFaqModal} 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <Plus size={14} /> Tambah FAQ Baru
                    </button>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    Sistem akan mencocokkan kata kunci (keyword) dari pesan pelanggan. Jika cocok, chatbot akan langsung menjawab dengan teks jawaban di bawah.
                  </p>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                          <th style={{ padding: '10px', width: '150px' }}>Kata Kunci</th>
                          <th style={{ padding: '10px' }}>Pertanyaan Acuan</th>
                          <th style={{ padding: '10px' }}>Jawaban Chatbot</th>
                          <th style={{ padding: '10px', textAlign: 'center', width: '100px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chatbotKnowledge.length > 0 ? (
                          chatbotKnowledge.map((faq) => (
                            <tr key={faq.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                              <td style={{ padding: '10px' }}>
                                <code style={{ backgroundColor: '#FFF5F5', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                  {faq.keyword}
                                </code>
                              </td>
                              <td style={{ padding: '10px', color: 'var(--color-text-muted)' }}>{faq.question}</td>
                              <td style={{ padding: '10px', whiteSpace: 'pre-line' }}>{faq.answer}</td>
                              <td style={{ padding: '10px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleOpenEditFaqModal(faq)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                                    title="Edit FAQ"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFaq(faq.id)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#D9534F' }}
                                    title="Hapus FAQ"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                              Belum ada data FAQ khusus. Klik tombol "Tambah FAQ Baru" untuk menginstruksikan bot.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* CRUD PRODUK MODAL DIALOG */}
      {showProductModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1010
          }}
        >
          <div className="premium-card" style={{ width: '450px', padding: '24px', textAlign: 'left', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{editProduct ? 'Edit Kue/Roti' : 'Tambah Kue Baru'}</h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Nama Produk</label>
                <input type="text" className="form-input" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="grid">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Harga (Rp)</label>
                  <input type="number" className="form-input" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} required min={0} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Stok</label>
                  <input type="number" className="form-input" value={prodStock} onChange={(e) => setProdStock(Number(e.target.value))} required min={0} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Kategori</label>
                <select className="form-input" value={prodCategory} onChange={(e) => setProdCategory(e.target.value as any)}>
                  <option value="Roti">Roti</option>
                  <option value="Kue Basah">Kue Basah</option>
                  <option value="Kue Kering">Kue Kering</option>
                  <option value="Jajanan Pasar">Jajanan Pasar</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Deskripsi</label>
                <textarea className="form-input" rows={3} value={prodDescription} onChange={(e) => setProdDescription(e.target.value)} style={{ resize: 'none' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Foto URL</label>
                <input type="text" className="form-input" value={prodImage} onChange={(e) => setProdImage(e.target.value)} />
              </div>

              {crudError && (
                <div style={{ color: '#D9534F', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {crudError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                <CheckCircle size={16} /> Simpan Data Produk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CRUD FAQ MODAL DIALOG */}
      {showFaqModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1010
          }}
        >
          <div className="premium-card" style={{ width: '450px', padding: '24px', textAlign: 'left', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{editFaq ? 'Edit FAQ Chatbot' : 'Tambah FAQ Baru'}</h3>
              <button onClick={() => setShowFaqModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Kata Kunci (Keyword)</label>
                <input type="text" className="form-input" placeholder="contoh: alamat, jam buka, ongkir" value={faqKeyword} onChange={(e) => setFaqKeyword(e.target.value)} required />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Memicu respon jika pelanggan mengetik kata ini.</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Pertanyaan Contoh</label>
                <input type="text" className="form-input" placeholder="contoh: Di mana lokasi tokonya?" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Jawaban Chatbot</label>
                <textarea className="form-input" rows={4} placeholder="Tulis respon otomatis chatbot..." value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} required style={{ resize: 'none' }} />
              </div>

              {faqError && (
                <div style={{ color: '#D9534F', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {faqError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                <CheckCircle size={16} /> Simpan Data FAQ
              </button>
            </form>
          </div>
        </div>
      )}


      {/* CRUD FAQ MODAL DIALOG */}
      {showFaqModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1010
          }}
        >
          <div className="premium-card" style={{ width: '450px', padding: '24px', textAlign: 'left', backgroundColor: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{editFaq ? 'Edit Data FAQ' : 'Tambah FAQ Baru'}</h3>
              <button onClick={() => setShowFaqModal(false)} style={{ background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Kata Kunci (Keyword)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={faqKeyword} 
                  onChange={(e) => setFaqKeyword(e.target.value)} 
                  required 
                  placeholder="Contoh: halal"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Kata kunci huruf kecil yang akan dicocokkan dengan chat pelanggan.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Pertanyaan Acuan</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={faqQuestion} 
                  onChange={(e) => setFaqQuestion(e.target.value)} 
                  required 
                  placeholder="Contoh: Apakah produknya bersertifikat halal?"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Jawaban Chatbot</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  value={faqAnswer} 
                  onChange={(e) => setFaqAnswer(e.target.value)} 
                  required 
                  placeholder="Ketik jawaban otomatis bot..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {faqError && (
                <div style={{ color: '#D9534F', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> {faqError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                <CheckCircle size={16} /> Simpan Data FAQ
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
