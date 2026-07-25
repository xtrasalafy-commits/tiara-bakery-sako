import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

const Instagram = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface FooterProps {
  setCurrentTab: (tab: 'home' | 'menu' | 'track' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-primary)',
        color: '#FFFDF9',
        padding: '50px 0 20px',
        borderTop: '3px solid var(--color-accent-gold)',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: '40px', textAlign: 'left', marginBottom: '40px' }} className="grid">
          
          {/* Column 1: Brand & Logo info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              {/* SVG Logo Tiara Bakery Sako */}
              <svg width="40" height="40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="#FCE4A6" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#4E0C0D" strokeWidth="1" />
                
                {/* Halal Badge */}
                <g transform="translate(68, 15) scale(0.6)">
                  <circle cx="15" cy="15" r="12" fill="none" stroke="#4E0C0D" strokeWidth="1.5"/>
                  <text x="15" y="15" fontSize="6" fontWeight="bold" fill="#4E0C0D" textAnchor="middle" dominantBaseline="middle">حلال</text>
                  <text x="15" y="22" fontSize="4.5" fill="#4E0C0D" textAnchor="middle" dominantBaseline="middle">HALAL</text>
                </g>
                
                {/* Crown */}
                <path d="M 32 38 L 36 34 L 40 38 L 44 32 L 48 38 L 52 34 L 56 38" fill="none" stroke="#4E0C0D" strokeWidth="1.5" />
                
                {/* Badge */}
                <path d="M 12 42 Q 50 35 88 42 Q 88 58 88 58 Q 50 63 12 58 Z" fill="#4E0C0D" />
                
                {/* Cursive Brand Text */}
                <text x="50" y="50" fontFamily="'Playfair Display', Georgia, serif" fontSize="9" fontWeight="bold" fill="#FFFDF9" textAnchor="middle" dominantBaseline="middle">
                  Tiara Bakery
                </text>
                <text x="50" y="55" fontFamily="'Outfit', sans-serif" fontSize="4.5" fill="#FCE4A6" textAnchor="middle" dominantBaseline="middle">
                  Fresh Bake & Cake
                </text>
              </svg>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-logo-cream)' }}>TIARA BAKERY SAKO</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#EADBC8', marginBottom: '20px', lineHeight: '1.6', maxWidth: '320px' }}>
              Menghadirkan kelezatan sejati dengan bahan-bahan alami pilihan kualitas terbaik. Enak, higienis, dan 100% Halal terjamin.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-logo-cream)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> Secure Checkout & Data Protection Enabled
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 style={{ color: 'var(--color-logo-cream)', fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Tautan Cepat
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); setCurrentTab('home'); }} style={{ color: '#EADBC8', fontSize: '0.9rem' }}>
                  Beranda
                </a>
              </li>
              <li>
                <a href="#menu" onClick={(e) => { e.preventDefault(); setCurrentTab('menu'); }} style={{ color: '#EADBC8', fontSize: '0.9rem' }}>
                  Katalog Menu
                </a>
              </li>
              <li>
                <a href="#track" onClick={(e) => { e.preventDefault(); setCurrentTab('track'); }} style={{ color: '#EADBC8', fontSize: '0.9rem' }}>
                  Lacak Pesanan
                </a>
              </li>
              <li>
                <a href="#admin" onClick={(e) => { e.preventDefault(); setCurrentTab('admin'); }} style={{ color: '#EADBC8', fontSize: '0.9rem' }}>
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 style={{ color: 'var(--color-logo-cream)', fontSize: '1.1rem', marginBottom: '20px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Hubungi Kami (Sesuai Logo)
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#EADBC8' }}>
                <MapPin size={18} style={{ color: 'var(--color-logo-cream)', flexShrink: 0, marginTop: '2px' }} />
                <span>Jl. Sako Raya No. 4, Kec. Sako, Kota Palembang, Sumatra Selatan 30163</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#EADBC8' }}>
                <Phone size={18} style={{ color: 'var(--color-logo-cream)' }} />
                <span>0831-7576-4494 (Pemesanan WhatsApp)</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#EADBC8' }}>
                <Instagram size={18} style={{ color: 'var(--color-logo-cream)' }} />
                <a href="https://instagram.com/tbakerypalembang" target="_blank" rel="noopener noreferrer" style={{ color: '#EADBC8' }}>
                  @tbakerypalembang
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#EADBC8' }}>
                <Clock size={18} style={{ color: 'var(--color-logo-cream)' }} />
                <span>Setiap Hari: 07.00 - 21.00 WIB</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(234, 219, 200, 0.2)',
            paddingTop: '20px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#EADBC8'
          }}
        >
          <p>© {new Date().getFullYear()} TIARA BAKERY SAKO. All Rights Reserved. Dibuat dengan Fokus Keamanan & Kualitas.</p>
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.8rem', opacity: 0.85 }}>
            <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(252, 228, 166, 0.1)', color: 'var(--color-accent-gold)', border: '1px solid rgba(252, 228, 166, 0.2)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              © MZF - 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
