import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { db } from '../db/supabaseClient';
import type { Product } from '../db/supabaseClient';

// Zod Validation Schema untuk Form Pemesanan
const checkoutSchema = z.object({
  customerName: z.string()
    .min(3, { message: 'Nama pelanggan minimal 3 karakter.' })
    .max(50, { message: 'Nama pelanggan maksimal 50 karakter.' }),
  customerPhone: z.string()
    .min(9, { message: 'Nomor WhatsApp minimal 9 digit.' })
    .max(16, { message: 'Nomor WhatsApp maksimal 16 digit.' })
    .regex(/^[0-9+\-\s]+$/, { message: 'Nomor WhatsApp hanya boleh angka dan simbol (+, -, spasi).' }),
  deliveryMethod: z.enum(['Ambil Sendiri', 'Kirim ke Rumah']),
  address: z.string().optional()
}).refine((data) => {
  if (data.deliveryMethod === 'Kirim ke Rumah' && (!data.address || data.address.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Alamat wajib diisi jika Anda memilih metode Kirim ke Rumah.',
  path: ['address']
});

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  cartItems,
  updateCartQty,
  removeFromCart,
  clearCart,
  onOrderSuccess
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'Ambil Sendiri' | 'Kirim ke Rumah'>('Ambil Sendiri');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ id: string } | null>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // 1. Jalankan Validasi Zod (Security Input Validation)
    const formData = {
      customerName,
      customerPhone,
      deliveryMethod,
      address: deliveryMethod === 'Kirim ke Rumah' ? address : undefined
    };

    const validation = checkoutSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // 2. Kirim order ke Database (Supabase / local DB simulator)
      const orderPayload = {
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        delivery_method: formData.deliveryMethod,
        address: formData.address,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      };

      const createdOrder = await db.createOrder(orderPayload);
      setSuccessOrder(createdOrder);

      // 3. Format pesan WhatsApp Checkout
      let waMessage = `Halo Tiara Bakery Sako, saya ingin memesan:\n\n`;
      waMessage += `📋 *DETAIL PESANAN* (ID: #${createdOrder.id})\n`;
      waMessage += `-------------------------------------------\n`;
      
      cartItems.forEach(item => {
        waMessage += `• *${item.product.name}* (x${item.quantity}) - Rp ${(item.product.price * item.quantity).toLocaleString()}\n`;
      });
      
      waMessage += `-------------------------------------------\n`;
      waMessage += `💰 *Total Pembayaran:* Rp ${createdOrder.total_price.toLocaleString()}\n\n`;
      
      waMessage += `👤 *DATA PENERIMA*\n`;
      waMessage += `- *Nama:* ${formData.customerName}\n`;
      waMessage += `- *WhatsApp:* ${formData.customerPhone}\n`;
      waMessage += `- *Metode:* ${formData.deliveryMethod}\n`;
      if (formData.deliveryMethod === 'Kirim ke Rumah') {
        waMessage += `- *Alamat:* ${formData.address}\n`;
      }
      waMessage += `\nMohon pesanan saya segera diproses dan dikonfirmasi. Terima kasih! 😊🥐`;

      const encodedMsg = encodeURIComponent(waMessage);
      
      // Ubah no telepon toko '0831 7576 4494' ke format internasional '6283175764494'
      const waNumber = '6283175764494';
      const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;

      // Buka WA di tab baru
      window.open(waLink, '_blank');

      // Bersihkan state & keranjang belanja
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setAddress('');
      
      // Beritahu parent component
      onOrderSuccess(createdOrder.id);
      
    } catch (err: any) {
      alert(`Gagal membuat pesanan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(78, 12, 13, 0.4)', // maroon dark transparent overlay
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {/* Background click to close */}
      <div style={{ flex: 1 }} onClick={onClose}></div>

      {/* Drawer */}
      <div
        className="animate-slide-in"
        style={{
          width: '460px',
          maxWidth: '100vw',
          backgroundColor: 'var(--color-bg-cream)',
          height: '100%',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '2px solid var(--color-accent-gold)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-card-cream)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Keranjang Belanja</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', cursor: 'pointer', color: 'var(--color-primary)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        {successOrder ? (
          /* TAMPILAN SUKSES ORDER */
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px' }}>
            <CheckCircle2 size={72} style={{ color: 'var(--color-success-green)' }} />
            <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Pesanan Terkirim!</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Pesanan Anda telah berhasil disimpan di sistem dan detail pesanan telah disiapkan untuk WhatsApp.
            </p>
            <div style={{ backgroundColor: 'var(--color-card-cream)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>KODE PESANAN ANDA</span>
              <h4 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>{successOrder.id}</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Simpan kode di atas untuk melacak status pengerjaan kue Anda pada menu **Lacak Pesanan**.
            </p>
            <button
              onClick={() => {
                setSuccessOrder(null);
                onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            >
              Belanja Lagi
            </button>
          </div>
        ) : (
          /* TAMPILAN ITEM KERANJANG */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            
            {/* Scrollable list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {cartItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--color-card-cream)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {/* Product Image */}
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      
                      {/* Details */}
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)', margin: '0 0 4px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                          {item.product.name}
                        </h4>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-dark)', display: 'block', marginBottom: '8px' }}>
                          Rp {item.product.price.toLocaleString()}
                        </span>

                        {/* Qty controller */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              style={{ padding: '2px 8px', cursor: 'pointer', backgroundColor: '#FFFDF9', fontWeight: 'bold' }}
                            >
                              -
                            </button>
                            <span style={{ padding: '0 8px', fontSize: '0.85rem', minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              style={{ padding: '2px 8px', cursor: 'pointer', backgroundColor: '#FFFDF9', fontWeight: 'bold' }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            style={{ background: 'transparent', color: '#D9534F', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600 }}>Keranjang Belanja Kosong</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Silakan tambahkan kue lezat dari katalog menu.</p>
                </div>
              )}
            </div>

            {/* Checkout Form & Subtotal (Hanya jika ada barang) */}
            {cartItems.length > 0 && (
              <div
                style={{
                  backgroundColor: 'var(--color-card-cream)',
                  borderTop: '1px solid var(--color-border)',
                  padding: '24px',
                  boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
                }}
              >
                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Pembayaran:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Rp {subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                  
                  {/* Name */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                      Nama Pemesan <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Masukkan nama Anda"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    {errors.customerName && (
                      <span style={{ color: '#D9534F', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12} /> {errors.customerName}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                      Nomor WhatsApp <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: 083175764494"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    {errors.customerPhone && (
                      <span style={{ color: '#D9534F', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={12} /> {errors.customerPhone}
                      </span>
                    )}
                  </div>

                  {/* Delivery Method */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                      Metode Penyerahan <span style={{ color: 'red' }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Ambil Sendiri')}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: deliveryMethod === 'Ambil Sendiri' ? 'var(--color-primary)' : 'white',
                          color: deliveryMethod === 'Ambil Sendiri' ? 'white' : 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                          transition: 'var(--transition)'
                        }}
                      >
                        Ambil Sendiri
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('Kirim ke Rumah')}
                        style={{
                          padding: '10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: deliveryMethod === 'Kirim ke Rumah' ? 'var(--color-primary)' : 'white',
                          color: deliveryMethod === 'Kirim ke Rumah' ? 'white' : 'var(--color-primary)',
                          border: '1px solid var(--color-primary)',
                          transition: 'var(--transition)'
                        }}
                      >
                        Kirim ke Rumah
                      </button>
                    </div>
                  </div>

                  {/* Address (If Delivery) */}
                  {deliveryMethod === 'Kirim ke Rumah' && (
                    <div className="animate-fade-in">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '4px' }}>
                        Alamat Pengiriman <span style={{ color: 'red' }}>*</span>
                      </label>
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="Tulis alamat pengantaran lengkap di Palembang"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ resize: 'none', fontFamily: 'inherit' }}
                      />
                      {errors.address && (
                        <span style={{ color: '#D9534F', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <AlertCircle size={12} /> {errors.address}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{
                      marginTop: '8px',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      padding: '12px',
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Memproses...' : (
                      <>
                        Kirim Pemesanan ke WhatsApp <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
