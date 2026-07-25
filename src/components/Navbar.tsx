import React from 'react';
import { ShoppingCart, MapPin, Phone } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  openCart: () => void;
  currentTab: 'home' | 'menu' | 'track' | 'admin';
  setCurrentTab: (tab: 'home' | 'menu' | 'track' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  openCart,
  currentTab,
  setCurrentTab,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        backgroundColor: 'var(--color-card-cream)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Top Banner (Info Kontak sesuai Logo) */}
      <div
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-logo-cream)',
          fontSize: '0.8rem',
          padding: '6px 0',
          textAlign: 'center',
          fontWeight: 500,
          borderBottom: '1px solid var(--color-accent-gold)'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={12} /> WA: 0831-7576-4494
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={12} /> Sako, Palembang
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            🕌 100% Halal & Higienis
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ padding: '12px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo Brand Brand (Matching Logo Visuals) */}
          <div 
            onClick={() => setCurrentTab('home')} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            {/* SVG Logo Tiara Bakery Sako */}
            <svg width="48" height="48" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              <circle cx="50" cy="50" r="48" fill="#FCE4A6" stroke="#4E0C0D" strokeWidth="3" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#4E0C0D" strokeWidth="1" />
              
              {/* Halal Badge */}
              <g transform="translate(68, 15) scale(0.6)">
                <circle cx="15" cy="15" r="12" fill="none" stroke="#4E0C0D" strokeWidth="1.5"/>
                <text x="15" y="15" fontSize="6" fontWeight="bold" fill="#4E0C0D" textAnchor="middle" dominantBaseline="middle">حلال</text>
                <text x="15" y="22" fontSize="4.5" fill="#4E0C0D" textAnchor="middle" dominantBaseline="middle">HALAL</text>
              </g>
              
              {/* Crown above text */}
              <path d="M 32 38 L 36 34 L 40 38 L 44 32 L 48 38 L 52 34 L 56 38" fill="none" stroke="#4E0C0D" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Central Badge */}
              <path d="M 12 42 Q 50 35 88 42 Q 88 58 88 58 Q 50 63 12 58 Z" fill="#4E0C0D" />
              
              {/* Cursive Brand Text */}
              <text x="50" y="50" fontFamily="'Playfair Display', Georgia, serif" fontSize="9" fontWeight="bold" fill="#FFFDF9" textAnchor="middle" dominantBaseline="middle">
                Tiara Bakery
              </text>
              <text x="50" y="55" fontFamily="'Outfit', sans-serif" fontSize="4.5" fill="#FCE4A6" textAnchor="middle" dominantBaseline="middle">
                Fresh Bake & Cake
              </text>
            </svg>

            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Tiara Bakery <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', background: 'var(--color-logo-cream)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>SAKO</span>
              </h1>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
                Fresh Bake & Cake
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentTab('home')}
              style={{
                background: 'transparent',
                fontWeight: currentTab === 'home' ? 'bold' : 'normal',
                color: currentTab === 'home' ? 'var(--color-primary)' : 'var(--color-text-dark)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: currentTab === 'home' ? 'rgba(78, 12, 13, 0.06)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentTab('menu')}
              style={{
                background: 'transparent',
                fontWeight: currentTab === 'menu' ? 'bold' : 'normal',
                color: currentTab === 'menu' ? 'var(--color-primary)' : 'var(--color-text-dark)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: currentTab === 'menu' ? 'rgba(78, 12, 13, 0.06)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              Katalog Menu
            </button>
            <button
              onClick={() => setCurrentTab('track')}
              style={{
                background: 'transparent',
                fontWeight: currentTab === 'track' ? 'bold' : 'normal',
                color: currentTab === 'track' ? 'var(--color-primary)' : 'var(--color-text-dark)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: currentTab === 'track' ? 'rgba(78, 12, 13, 0.06)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              Lacak Pesanan
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              style={{
                background: 'transparent',
                fontWeight: currentTab === 'admin' ? 'bold' : 'normal',
                color: currentTab === 'admin' ? 'var(--color-primary)' : 'var(--color-text-dark)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                backgroundColor: currentTab === 'admin' ? 'rgba(78, 12, 13, 0.06)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              Admin
            </button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={openCart}
              className="flex-center"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-logo-cream)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'var(--transition)'
              }}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFDF9',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--color-card-cream)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
