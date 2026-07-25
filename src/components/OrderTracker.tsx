import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, Package, Shield, AlertCircle } from 'lucide-react';
import { db } from '../db/supabaseClient';
import type { Order } from '../db/supabaseClient';

export const OrderTracker: React.FC = () => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setSearched(false);
    
    const id = orderIdInput.trim();
    if (!id) {
      setError('Silakan masukkan Kode Pesanan Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const foundOrder = await db.getOrderById(id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError('Kode Pesanan tidak ditemukan. Pastikan Anda memasukkan kode yang benar (contoh: ORDER-XXXXXX).');
      }
      setSearched(true);
    } catch (err: any) {
      setError('Terjadi kesalahan saat melacak pesanan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', minHeight: '65vh' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '12px' }}>Lacak Pesanan Anda</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Pantau status pembuatan kue dan jajanan pasar Anda secara langsung menggunakan Kode Pesanan unik yang tertera pada invoice WhatsApp.
        </p>
      </div>

      {/* Tracker input card */}
      <div
        className="premium-card animate-fade-in"
        style={{
          maxWidth: '560px',
          margin: '0 auto 40px',
          padding: '30px',
          backgroundColor: 'var(--color-card-cream)'
        }}
      >
        <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', display: 'block', marginBottom: '8px' }}>
              Masukkan Kode Pesanan (Order ID)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Contoh: ORDER-A1B2C3D4"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                className="form-input"
                style={{
                  borderRadius: '30px',
                  textTransform: 'uppercase'
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{
                  borderRadius: '30px',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {isLoading ? 'Melacak...' : (
                  <>
                    <Search size={16} /> Lacak
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: '#D9534F', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Tracking Results */}
      {searched && order && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', textAlign: 'left' }} className="grid animate-fade-in">
          
          {/* Column 1: Timeline Tracker */}
          <div className="premium-card" style={{ padding: '30px', backgroundColor: 'var(--color-card-cream)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-primary)' }}>
              Status Pengerjaan Kue
            </h3>
            
            {/* Vertical timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', paddingLeft: '32px' }}>
              
              {/* Vertical line connector */}
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '12px',
                  bottom: '12px',
                  width: '2px',
                  backgroundColor: 'var(--color-border)',
                  zIndex: 0
                }}
              />

              {/* Step 1: Pending */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Timeline Bullet */}
                <div
                  className="flex-center"
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success-green)',
                    color: 'white'
                  }}
                >
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>
                    Pesanan Diterima (Pending)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Pesanan telah disimpan di server. Admin sedang melakukan pengecekan bahan dan antrean produksi.
                  </p>
                </div>
              </div>

              {/* Step 2: Diproses */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Timeline Bullet */}
                <div
                  className="flex-center"
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: order.status === 'Diproses' || order.status === 'Selesai' ? 'var(--color-success-green)' : 'var(--color-border)',
                    color: order.status === 'Diproses' || order.status === 'Selesai' ? 'white' : 'var(--color-text-muted)'
                  }}
                >
                  <Clock size={14} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 'bold', color: order.status === 'Diproses' || order.status === 'Selesai' ? 'inherit' : 'var(--color-text-muted)' }}>
                    Sedang Diproduksi (Diproses)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Adonan sedang diolah dan dipanggang secara segar di dapur Tiara Bakery.
                  </p>
                </div>
              </div>

              {/* Step 3: Selesai */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Timeline Bullet */}
                <div
                  className="flex-center"
                  style={{
                    position: 'absolute',
                    left: '-32px',
                    top: '2px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: order.status === 'Selesai' ? 'var(--color-success-green)' : 'var(--color-border)',
                    color: order.status === 'Selesai' ? 'white' : 'var(--color-text-muted)'
                  }}
                >
                  <Package size={14} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 'bold', color: order.status === 'Selesai' ? 'inherit' : 'var(--color-text-muted)' }}>
                    Siap Diambil / Dikirim (Selesai)
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Kue telah matang, dikemas cantik secara rapat & higienis, serta siap diambil di toko Sako atau dikirim oleh kurir.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Column 2: Order Detail Summary */}
          <div className="premium-card" style={{ padding: '30px', backgroundColor: 'var(--color-card-cream)', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--color-primary)' }}>
              Rincian Pesanan
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <p><strong>Nama:</strong> {order.customer_name}</p>
              <p><strong>Metode:</strong> {order.delivery_method}</p>
              {order.address && <p><strong>Alamat:</strong> {order.address}</p>}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.product_name} (x{item.quantity})</span>
                  <strong>Rp {(item.price_at_purchase * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed var(--color-border)',
                  paddingTop: '10px',
                  marginTop: '6px',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  color: 'var(--color-primary)'
                }}
              >
                <span>Total Pembayaran:</span>
                <span>Rp {order.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                backgroundColor: 'rgba(78, 12, 13, 0.04)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}
            >
              <Shield size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>Data pesanan tervalidasi aman di server PostgreSQL/SQLite.</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
