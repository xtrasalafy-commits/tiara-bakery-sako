import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, MessageCircle } from 'lucide-react';
import { handleStatefulChat } from '../utils/chatbotParser';
import type { ChatState } from '../utils/chatbotParser';
import { db } from '../db/supabaseClient';
import type { Product, ChatbotSettings, ChatbotKnowledge } from '../db/supabaseClient';

interface CartItem {
  product: Product;
  quantity: number;
}

interface ChatbotWidgetProps {
  products: Product[];
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number) => void;
  triggerCheckoutFromChat: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'Ambil Sendiri' | 'Kirim ke Rumah';
    address?: string;
  }) => void;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  actionButton?: {
    label: string;
    type: 'ADD_TO_CART' | 'CONFIRM_CHECKOUT';
    payload: any;
  };
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  products,
  cartItems,
  addToCart,
  triggerCheckoutFromChat
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({ step: 'IDLE' });
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [knowledge, setKnowledge] = useState<ChatbotKnowledge[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Halo Kak! Selamat datang di **TIARA BAKERY SAKO** 🥐✨\n\nSaya Tiara, pelayan virtual toko di sini. Ada yang bisa Tiara bantu? Kakak bisa ketik apa saja yang ingin dibeli (misal: *"pesan 2 lemper dan 1 nastar"*), menanyakan harga produk, atau ketik *"checkout"* untuk langsung memesan belanjaan Kakak! 😊',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Efek untuk memuat konfigurasi terbaru ketika widget chatbot dibuka
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const botSettings = await db.getChatbotSettings();
        const botKnowledge = await db.getChatbotKnowledge();
        setSettings(botSettings);
        setKnowledge(botKnowledge);
        
        // Update welcome message jika chat baru dibuka/dimulai
        setMessages(prev => {
          if (prev.length === 1 && prev[0].id === 'welcome') {
            return [{
              id: 'welcome',
              sender: 'bot',
              text: botSettings.welcomeMessage,
              timestamp: prev[0].timestamp
            }];
          }
          return prev;
        });
      } catch (err) {
        console.error('Gagal memuat konfigurasi chatbot:', err);
      }
    };
    
    loadConfig();
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');

    // 1. Tambahkan pesan user ke thread
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Kirim ke stateful chat logic (Simulasi asisten toko manusia)
    setTimeout(() => {
      const res = handleStatefulChat(userText, chatState, products, cartItems, settings || undefined, knowledge);
      
      // Update state chatbot
      setChatState(res.updatedState);

      // Cek apakah ada aksi khusus
      let actionButton = undefined;
      
      if (res.action) {
        if (res.action.type === 'ADD_TO_CART') {
          actionButton = {
            label: 'Masukkan ke Keranjang 🛒',
            type: 'ADD_TO_CART' as const,
            payload: res.action.payload
          };
        } else if (res.action.type === 'SUBMIT_ORDER') {
          // Kirim order payload ke parent untuk diproses checkout
          setTimeout(() => {
            triggerCheckoutFromChat(res.action?.payload);
          }, 1500);
        }
      }

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.message,
        timestamp: new Date(),
        actionButton
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleActionButtonClick = (msg: Message) => {
    if (!msg.actionButton) return;

    const { type, payload } = msg.actionButton;

    if (type === 'ADD_TO_CART') {
      if (Array.isArray(payload)) {
        payload.forEach(item => {
          addToCart(item.productId, item.quantity);
        });
      } else {
        addToCart(payload.productId, payload.quantity);
      }

      const confirmationMsg: Message = {
        id: 'bot-confirm-' + Date.now(),
        sender: 'bot',
        text: '✅ Sukses! Semua item di atas telah terdaftar di keranjang belanja Kakak. Ketik *"checkout"* untuk langsung melengkapi data pemesanan lewat chat ini ya! 😊',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMsg]);
    }

    // Hilangkan tombol setelah diklik
    setMessages(prev =>
      prev.map(m => m.id === msg.id ? { ...m, actionButton: undefined } : m)
    );
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div style={{ zIndex: 1000, position: 'fixed', bottom: '24px', right: '24px' }}>
      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className="flex-center pulse-gold"
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-logo-cream)',
          border: '2px solid var(--color-logo-cream)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        aria-label="Tanya Chatbot"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        
        {!isOpen && hasUnread && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: 'red',
              color: 'white',
              fontSize: '11px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white'
            }}
          >
            1
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="premium-card animate-slide-in"
          style={{
            position: 'absolute',
            bottom: '75px',
            right: '0',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFDF9',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid var(--color-accent-gold)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                className="flex-center"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-logo-cream)',
                  color: 'var(--color-primary)'
                }}
              >
                <Bot size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-logo-cream)', fontFamily: 'var(--font-sans)', fontWeight: 'bold' }}>
                  {settings?.botName || 'Tiara'} (Asisten Toko)
                </h3>
                <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-green)', display: 'inline-block' }}></span>
                  Aktif Melayani
                </span>
              </div>
            </div>
            <button
              onClick={toggleChat}
              style={{ background: 'transparent', color: '#FFFDF9', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              backgroundColor: '#FEFBF3',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : '#FFFDF9',
                    color: msg.sender === 'user' ? '#FFFDF9' : 'var(--color-text-dark)',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' 
                      ? '16px 16px 4px 16px' 
                      : '16px 16px 16px 4px',
                    fontSize: '0.92rem',
                    lineHeight: '1.45',
                    boxShadow: 'var(--shadow-sm)',
                    border: msg.sender === 'bot' ? '1px solid var(--color-border)' : 'none',
                    whiteSpace: 'pre-line',
                    textAlign: 'left'
                  }}
                >
                  {msg.text.split('**').map((chunk, idx) => 
                    idx % 2 === 1 ? <strong key={idx} style={{ color: msg.sender === 'bot' ? 'var(--color-primary)' : 'inherit' }}>{chunk}</strong> : chunk
                  )}
                </div>

                {msg.sender === 'bot' && msg.actionButton && (
                  <div style={{ marginTop: '8px', display: 'flex' }}>
                    <button
                      onClick={() => handleActionButtonClick(msg)}
                      className="btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        borderRadius: '8px',
                        width: '100%',
                        justifyContent: 'center',
                        boxShadow: 'none'
                      }}
                    >
                      {msg.actionButton.label}
                    </button>
                  </div>
                )}
                
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)',
                    display: 'block',
                    marginTop: '4px',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div
                  style={{
                    backgroundColor: '#FFFDF9',
                    padding: '12px 20px',
                    borderRadius: '16px 16px 16px 4px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                >
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              backgroundColor: '#FFFDF9',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={chatState.step === 'IDLE' ? "Ketik pesan/kue..." : "Ketik balasan Anda..."}
              className="form-input"
              style={{
                padding: '10px 14px',
                fontSize: '0.92rem',
                borderRadius: '20px'
              }}
            />
            <button
              type="submit"
              className="flex-center"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFDF9',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
      
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};
