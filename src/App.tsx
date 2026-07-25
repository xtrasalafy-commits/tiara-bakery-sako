import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ShoppingCart } from './components/ShoppingCart';
import { ChatbotWidget } from './components/ChatbotWidget';
import { AdminPanel } from './components/AdminPanel';
import { OrderTracker } from './components/OrderTracker';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { db } from './db/supabaseClient';
import type { Product } from './db/supabaseClient';
import { ChevronRight, Check } from 'lucide-react';
import './App.css';

interface CartItem {
  product: Product;
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'home' | 'menu' | 'track' | 'admin'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Fetch Products on Mount
  const loadProducts = async () => {
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Cart operations
  const addToCart = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      
      // Keamanan Sisi Client: Validasi Stok
      if (currentQtyInCart + quantity > product.stock) {
        showNotification(`Gagal menambahkan: Batas stok untuk "${product.name}" tersisa ${product.stock} pcs.`);
        return prevCart;
      }

      showNotification(`Sukses: ${quantity}x ${product.name} dimasukkan ke keranjang belanja.`);

      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (qty > product.stock) {
      showNotification(`Batas maksimal pembelian: "${product.name}" hanya memiliki ${product.stock} pcs stok.`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter(item => item.product.id !== productId));
    showNotification('Item dihapus dari keranjang belanja.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const triggerCheckoutFromChat = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'Ambil Sendiri' | 'Kirim ke Rumah';
    address?: string;
  }) => {
    if (cart.length === 0) {
      showNotification('Gagal: Keranjang belanja kosong.');
      return;
    }
    try {
      const orderPayload = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        delivery_method: orderData.deliveryMethod,
        address: orderData.address,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const createdOrder = await db.createOrder(orderPayload);
      
      // Format pesan WhatsApp
      let waMessage = `Halo Tiara Bakery Sako, saya ingin memesan:\n\n`;
      waMessage += `📋 *DETAIL PESANAN* (ID: #${createdOrder.id})\n`;
      waMessage += `-------------------------------------------\n`;
      cart.forEach(item => {
        waMessage += `• *${item.product.name}* (x${item.quantity}) - Rp ${(item.product.price * item.quantity).toLocaleString()}\n`;
      });
      waMessage += `-------------------------------------------\n`;
      waMessage += `💰 *Total Pembayaran:* Rp ${createdOrder.total_price.toLocaleString()}\n\n`;
      waMessage += `👤 *DATA PENERIMA*\n`;
      waMessage += `- *Nama:* ${orderData.customerName}\n`;
      waMessage += `- *WhatsApp:* ${orderData.customerPhone}\n`;
      waMessage += `- *Metode:* ${orderData.deliveryMethod}\n`;
      if (orderData.deliveryMethod === 'Kirim ke Rumah') {
        waMessage += `- *Alamat:* ${orderData.address}\n`;
      }
      waMessage += `\nMohon pesanan saya segera diproses dan dikonfirmasi. Terima kasih! 😊🥐`;

      const encodedMsg = encodeURIComponent(waMessage);
      const waNumber = '6283175764494';
      const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;
      
      window.open(waLink, '_blank');

      // Clear cart
      setCart([]);
      loadProducts();
      
      showNotification(`Sukses! Pesanan dibuat dengan Kode: ${createdOrder.id}`);
      
      // Alihkan ke Lacak Pesanan
      setTimeout(() => {
        setCurrentTab('track');
      }, 1000);
      
    } catch (err: any) {
      alert(`Gagal membuat pesanan dari Chatbot: ${err.message}`);
    }
  };

  // Toast notification helper
  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setIsNotificationOpen(true);
    setTimeout(() => {
      setIsNotificationOpen(false);
    }, 4000);
  };

  const handleOrderSuccess = (_orderId: string) => {
    // Dipanggil saat checkout sukses
    loadProducts(); // Refresh stock
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections */}
      <main style={{ flexGrow: 1 }}>
        {currentTab === 'home' && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <Hero
              onViewMenu={() => setCurrentTab('menu')}
              openChatbot={() => {
                // Trigger floating chatbot opening
                const chatBtn = document.querySelector('button[aria-label="Tanya Chatbot"]') as HTMLButtonElement;
                if (chatBtn) chatBtn.click();
              }}
            />

            {/* Popular Products Carousel / Grid */}
            <section style={{ padding: '60px 0 40px' }}>
              <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Terfavorit</span>
                    <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Rekomendasi Best Seller</h2>
                  </div>
                  <button
                    onClick={() => setCurrentTab('menu')}
                    style={{
                      background: 'transparent',
                      color: 'var(--color-primary)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Lihat Semua Menu <ChevronRight size={18} />
                  </button>
                </div>

                <div className="grid grid-4">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="premium-card"
                      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', textAlign: 'left' }}
                    >
                      <img src={p.image_url} alt={p.name} style={{ height: '160px', width: '100%', objectFit: 'cover' }} />
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{p.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px', flexGrow: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Rp {p.price.toLocaleString()}</span>
                          <button
                            onClick={() => addToCart(p.id, 1)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', boxShadow: 'none' }}
                          >
                            + Beli
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <Testimonials />
          </div>
        )}

        {currentTab === 'menu' && (
          <div className="animate-fade-in">
            <ProductCatalog
              products={products}
              addToCart={addToCart}
            />
          </div>
        )}

        {currentTab === 'track' && (
          <div className="animate-fade-in">
            <OrderTracker />
          </div>
        )}

        {currentTab === 'admin' && (
          <div className="animate-fade-in">
            <AdminPanel
              products={products}
              refreshProducts={loadProducts}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating Chatbot Assistant */}
      <ChatbotWidget
        products={products}
        cartItems={cart}
        addToCart={addToCart}
        triggerCheckoutFromChat={triggerCheckoutFromChat}
      />

      {/* Shopping Cart Drawer Modal */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Toast Notification Alert (Security & UX feedback) */}
      {isNotificationOpen && (
        <div
          className="animate-slide-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFDF9',
            padding: '12px 24px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 1100,
            borderLeft: '4px solid var(--color-accent-gold)'
          }}
        >
          <div
            className="flex-center"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-logo-cream)',
              color: 'var(--color-primary)'
            }}
          >
            <Check size={12} />
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{notificationMsg}</span>
        </div>
      )}
    </>
  );
}

export default App;
