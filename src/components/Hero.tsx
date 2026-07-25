import React from 'react';
import { ArrowRight, ShieldCheck, Flame, Sparkles } from 'lucide-react';

interface HeroProps {
  onViewMenu: () => void;
  openChatbot: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewMenu, openChatbot }) => {
  return (
    <section
      style={{
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, var(--color-bg-cream) 0%, #FFF5DF 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      {/* Decorative Blur Orbs for visual interest (glassmorphism feel) */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(252, 228, 166, 0.4)',
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          backgroundColor: 'rgba(78, 12, 13, 0.05)',
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }} className="grid">
          
          {/* Left Column: Text */}
          <div style={{ textAlign: 'left' }} className="animate-fade-in">
            {/* Promo Tag */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: 'rgba(78, 12, 13, 0.08)',
                color: 'var(--color-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: '20px',
                marginBottom: '20px'
              }}
            >
              <Sparkles size={14} /> Freshly Baked Everyday in Palembang
            </span>

            <h2
              style={{
                fontSize: '3.5rem',
                lineHeight: 1.15,
                marginBottom: '20px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700
              }}
            >
              Rasa Klasik Kue & <span style={{ color: 'var(--color-accent-gold)', fontStyle: 'italic' }}>Jajanan Pasar</span> Istimewa
            </h2>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--color-text-muted)',
                marginBottom: '32px',
                maxWidth: '540px'
              }}
            >
              Tiara Bakery Sako menghadirkan kehangatan cita rasa tradisional dengan resep warisan keluarga yang diolah secara higienis, 100% Halal, dan tanpa bahan pengawet. Kami menjamin kelezatan di setiap gigitan.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={onViewMenu}
                className="btn-primary"
                style={{ fontSize: '1rem', padding: '14px 28px' }}
              >
                Lihat Menu Kami <ArrowRight size={18} />
              </button>
              <button
                onClick={openChatbot}
                className="btn-secondary"
                style={{ fontSize: '1rem', padding: '14px 28px', border: '1px solid var(--color-primary)' }}
              >
                💬 Pesan Lewat Chatbot
              </button>
            </div>

            {/* Quality Badges */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '40px', borderTop: '1px solid var(--color-border)', paddingTop: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary)', display: 'flex' }}><ShieldCheck size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Keamanan Terjamin</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Enkripsi SSL & Checkout Valid</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: 'var(--color-primary)', display: 'flex' }}><Flame size={24} /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Selalu Hangat</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Dipanggang langsung setiap pagi</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Mockup / Logo Graphic */}
          <div
            className="flex-center animate-fade-in"
            style={{
              position: 'relative'
            }}
          >
            {/* Visual Bakery Background Frame */}
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                height: '420px',
                borderRadius: '24px',
                border: '2px solid var(--color-border)',
                backgroundColor: 'var(--color-card-cream)',
                backgroundImage: 'url("https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Overlay Logo */}
              <div
                className="flex-center"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(78, 12, 13, 0.45)', // dark maroon filter
                  backdropFilter: 'blur(2px)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                {/* SVG Logo Tiara Bakery Sako (Besar) */}
                <div style={{ transform: 'scale(1.8)', marginBottom: '40px' }}>
                  <svg width="60" height="60" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="#FCE4A6" stroke="#FFFFFF" strokeWidth="2.5" />
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
                </div>
                
                <h3 style={{ color: 'var(--color-logo-cream)', fontSize: '1.8rem', marginBottom: '8px' }}>
                  TIARA BAKERY SAKO
                </h3>
                <p style={{ color: '#FFFDF9', fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                  "Kelezatan Tradisional dalam Sentuhan Modern"
                </p>
                <div 
                  style={{ 
                    marginTop: '24px', 
                    fontSize: '0.8rem', 
                    padding: '8px 16px', 
                    background: 'rgba(255,255,255,0.15)', 
                    borderRadius: '30px', 
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#FFFDF9'
                  }}
                >
                  📍 Jl. Sako Raya No. 4, Palembang
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};
