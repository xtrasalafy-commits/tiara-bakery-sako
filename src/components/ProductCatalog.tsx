import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Info, AlertTriangle } from 'lucide-react';
import type { Product } from '../db/supabaseClient';

interface ProductCatalogProps {
  products: Product[];
  addToCart: (productId: string, quantity: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, addToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});

  const categories = ['Semua', 'Roti', 'Kue Basah', 'Kue Kering', 'Jajanan Pasar'];

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleQtyChange = (productId: string, val: number, maxStock: number) => {
    const qty = Math.max(1, Math.min(maxStock, val));
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const handleAddToCartClick = (p: Product) => {
    const qty = quantities[p.id] || 1;
    addToCart(p.id, qty);
    
    // Reset quantity selector
    setQuantities((prev) => ({ ...prev, [p.id]: 1 }));
  };

  return (
    <section style={{ padding: '60px 0' }} id="menu-section">
      <div className="container">
        
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '12px' }}>Katalog Kue & Jajanan Pasar Kami</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Pilih dari berbagai menu pilihan terlaris kami. Semua produk diproduksi secara higienis, segar setiap hari, dan aman dikonsumsi.
          </p>
        </div>

        {/* Search & Category Filter bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}
        >
          {/* Categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-card-cream)',
                  color: selectedCategory === cat ? '#FFFDF9' : 'var(--color-primary)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '280px', flex: '1', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Cari kue kesukaanmu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: '44px',
                borderRadius: '30px',
                width: '100%'
              }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-4">
            {filteredProducts.map((p) => {
              const qty = quantities[p.id] || 1;
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock > 0 && p.stock <= 5;

              return (
                <div
                  key={p.id}
                  className="premium-card animate-fade-in"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  {/* Category Tag */}
                  <span
                    className="badge badge-gold"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 2,
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {p.category}
                  </span>

                  {/* Image */}
                  <div style={{ height: '180px', overflow: 'hidden', backgroundColor: '#EADBC8', position: 'relative' }}>
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.00)')}
                    />
                    
                    {isOutOfStock && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFDF9',
                          fontWeight: 'bold',
                          fontSize: '1.1rem'
                        }}
                      >
                        Stok Habis
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1, textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '6px', fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {p.name}
                    </h3>
                    
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', flexGrow: 1, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.description}
                    </p>

                    {/* Price and Stock Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderTop: '1px dashed var(--color-border)', paddingTop: '12px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        Rp {p.price.toLocaleString()}
                      </span>
                      
                      {/* Stock indicator */}
                      {isOutOfStock ? (
                        <span style={{ fontSize: '0.75rem', color: '#D9534F', fontWeight: 'bold' }}>Stok Habis</span>
                      ) : isLowStock ? (
                        <span style={{ fontSize: '0.75rem', color: '#D9534F', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <AlertTriangle size={12} /> Sisa {p.stock} pcs
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Stok: {p.stock}</span>
                      )}
                    </div>

                    {/* Quantity & Buy Control */}
                    {!isOutOfStock && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Selector Qty */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            backgroundColor: 'white'
                          }}
                        >
                          <button
                            onClick={() => handleQtyChange(p.id, qty - 1, p.stock)}
                            style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#FFFDF9', fontSize: '1.1rem', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0 8px', fontSize: '0.9rem', minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQtyChange(p.id, qty + 1, p.stock)}
                            style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#FFFDF9', fontSize: '1.1rem', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>

                        {/* Add to Cart button */}
                        <button
                          onClick={() => handleAddToCartClick(p)}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            justifyContent: 'center',
                            boxShadow: 'none'
                          }}
                        >
                          <ShoppingCart size={16} /> Beli
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-card-cream)' }}>
            <Info size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '6px' }}>Kue tidak ditemukan</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
          </div>
        )}

      </div>
    </section>
  );
};
