import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't-1',
    name: 'Andi Wijaya',
    role: 'Pelanggan Setia Sako',
    comment: 'Roti cokelatnya empuk banget dan isiannya melimpah. Tiara Bakery selalu jadi andalan kalau ada acara keluarga di rumah. Pelayanan cepat dan sangat terpercaya.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 't-2',
    name: 'Siti Rahma',
    role: 'Ibu Rumah Tangga',
    comment: 'Suka sekali dengan Kue Lumpur Surga dan Lemper Ayamnya! Benar-benar gurih, ketannya pulen, dan 100% Halal terjamin. Pemesanan lewat WhatsApp juga gampang sekali.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
  },
  {
    id: 't-3',
    name: 'Budi Santoso',
    role: 'Penikmat Jajanan Pasar',
    comment: 'Nastar Klasik Wisman-nya juara! Lembut langsung lumer di mulut, selai nanasnya pas manisnya tidak bikin enek. Sangat recommended untuk bingkisan lebaran/hari raya.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section style={{ padding: '60px 0', backgroundColor: 'var(--color-card-cream)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '12px' }}>Apa Kata Pelanggan Kami?</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Ulasan jujur dari pelanggan setia kami di Palembang yang telah merasakan langsung kelezatan kue dan jajanan pasar dari Tiara Bakery Sako.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-3">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="premium-card animate-fade-in"
              style={{
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              {/* Comment */}
              <div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '4px', color: 'var(--color-accent-gold)', marginBottom: '16px' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--color-text-dark)', marginBottom: '24px', lineHeight: '1.6' }}>
                  "{t.comment}"
                </p>
              </div>

              {/* Profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                    {t.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
