// Parser Chatbot Stateful & Interaktif untuk TIARA BAKERY SAKO
// Mensimulasikan percakapan dengan karyawan toko manusia asli (Bahasa Indonesia).

import type { Product, ChatbotSettings, ChatbotKnowledge } from '../db/supabaseClient';

export interface ChatState {
  step: 'IDLE' | 'ASK_DELIVERY' | 'ASK_NAME' | 'ASK_PHONE' | 'ASK_ADDRESS' | 'CONFIRM_ORDER';
  lastProductId?: string; // Melacak produk terakhir yang dibicarakan (misal untuk mendeteksi "pesan 2")
  tempName?: string;
  tempPhone?: string;
  tempDelivery?: 'Ambil Sendiri' | 'Kirim ke Rumah';
  tempAddress?: string;
}

export interface StatefulResponse {
  message: string;
  updatedState: ChatState;
  action?: {
    type: 'ADD_TO_CART' | 'CLEAR_CART' | 'SUBMIT_ORDER' | 'OPEN_CART';
    payload?: any;
  };
}

const cleanText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ');
};

// Bilangan ke angka
const INDO_NUMBERS: { [key: string]: number } = {
  satu: 1, sebuah: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
  enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10
};

export const handleStatefulChat = (
  messageText: string,
  currentState: ChatState,
  products: Product[],
  cartItems: { product: Product; quantity: number }[],
  chatbotSettings?: ChatbotSettings,
  chatbotKnowledge?: ChatbotKnowledge[]
): StatefulResponse => {
  const cleaned = cleanText(messageText);
  let state = { ...currentState };

  // =========================================================================
  // ALUR CHECKOUT STATE MACHINE (Melayani Pemesanan Langkah demi Langkah)
  // =========================================================================

  // 1. STATE: Tanya Metode Pengiriman
  if (state.step === 'ASK_DELIVERY') {
    if (cleaned.includes('ambil') || cleaned.includes('sendiri') || cleaned.includes('1')) {
      state.tempDelivery = 'Ambil Sendiri';
      state.step = 'ASK_NAME';
      return {
        updatedState: state,
        message: 'Baik Kak, pesanan akan **Diambil Sendiri** di toko Sako ya.\n\nBoleh tahu **nama lengkap Kakak** siapa untuk keperluan serah terima?'
      };
    } else if (cleaned.includes('kirim') || cleaned.includes('rumah') || cleaned.includes('antar') || cleaned.includes('2')) {
      state.tempDelivery = 'Kirim ke Rumah';
      state.step = 'ASK_NAME';
      return {
        updatedState: state,
        message: 'Siap Kak, pesanan akan **Dikirim ke Rumah**.\n\nBoleh tahu **nama lengkap Kakak** siapa?'
      };
    } else {
      return {
        updatedState: state,
        message: 'Maaf Kak, mohon jawab dengan ketik **"Ambil Sendiri"** atau **"Kirim ke Rumah"** agar saya bisa melanjutkan pencatatan pesanan. 😊'
      };
    }
  }

  // 2. STATE: Tanya Nama
  if (state.step === 'ASK_NAME') {
    if (messageText.trim().length < 3) {
      return {
        updatedState: state,
        message: 'Namanya terlalu pendek Kak, boleh ketik nama lengkap Kakak sekali lagi?'
      };
    }
    state.tempName = messageText.trim();
    state.step = 'ASK_PHONE';
    return {
      updatedState: state,
      message: `Salam kenal Kak *${state.tempName}*! Selanjutnya, boleh minta **nomor WhatsApp yang aktif** untuk konfirmasi pengiriman?`
    };
  }

  // 3. STATE: Tanya Telepon
  if (state.step === 'ASK_PHONE') {
    const phoneClean = cleaned.replace(/[^0-9]/g, '');
    if (phoneClean.length < 9 || phoneClean.length > 15) {
      return {
        updatedState: state,
        message: 'Nomor WhatsApp tidak valid Kak (harus antara 9 sampai 15 digit angka). Boleh tolong diketik ulang?'
      };
    }
    state.tempPhone = phoneClean;
    
    if (state.tempDelivery === 'Kirim ke Rumah') {
      state.step = 'ASK_ADDRESS';
      return {
        updatedState: state,
        message: 'Terima kasih Kak. Terakhir, mohon ketikkan **alamat lengkap pengiriman** Kakak di Palembang?'
      };
    } else {
      state.step = 'CONFIRM_ORDER';
      const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      return {
        updatedState: state,
        message: `Baik Kak, data sudah lengkap. Berikut ringkasannya:\n\n👤 **Penerima:** ${state.tempName}\n📞 **WhatsApp:** ${state.tempPhone}\n📦 **Metode:** Ambil Sendiri di Toko Sako\n💰 **Total Belanja:** Rp ${subtotal.toLocaleString()}\n\nApakah data pesanan ini sudah benar? Balas **"YA"** untuk checkout langsung ke WhatsApp toko!`
      };
    }
  }

  // 4. STATE: Tanya Alamat (Hanya untuk Delivery)
  if (state.step === 'ASK_ADDRESS') {
    if (messageText.trim().length < 5) {
      return {
        updatedState: state,
        message: 'Alamatnya kurang lengkap Kak, mohon sertakan nama jalan atau patokan rumah Kakak?'
      };
    }
    state.tempAddress = messageText.trim();
    state.step = 'CONFIRM_ORDER';
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return {
      updatedState: state,
      message: `Baik Kak, data sudah lengkap. Berikut ringkasannya:\n\n👤 **Penerima:** ${state.tempName}\n📞 **WhatsApp:** ${state.tempPhone}\n📦 **Metode:** Kirim ke Rumah\n📍 **Alamat:** ${state.tempAddress}\n💰 **Total Belanja:** Rp ${subtotal.toLocaleString()}\n\nApakah data pesanan ini sudah benar? Balas **"YA"** untuk checkout langsung ke WhatsApp toko!`
    };
  }

  // 5. STATE: Konfirmasi Final Order
  if (state.step === 'CONFIRM_ORDER') {
    if (cleaned === 'ya' || cleaned.includes('benar') || cleaned.includes('betul') || cleaned.includes('ok')) {
      // Pemicu checkout otomatis
      const orderPayload = {
        customerName: state.tempName,
        customerPhone: state.tempPhone,
        deliveryMethod: state.tempDelivery,
        address: state.tempAddress
      };
      
      // Reset state chatbot kembali ke IDLE
      state = { step: 'IDLE' };
      
      return {
        updatedState: state,
        message: 'Pesanan Kakak sedang dikirim ke sistem! Jendela WhatsApp toko akan otomatis terbuka untuk menyelesaikan pembayaran. Terima kasih banyak ya Kak sudah berbelanja di Tiara Bakery Sako! Halaman pemesanan akan terbuka sekarang... 🥰🥖',
        action: {
          type: 'SUBMIT_ORDER',
          payload: orderPayload
        }
      };
    } else if (cleaned === 'tidak' || cleaned.includes('batal') || cleaned.includes('salah')) {
      state = { step: 'IDLE' };
      return {
        updatedState: state,
        message: 'Pencatatan data dibatalkan Kak. Chatbot kembali ke mode normal. Kakak bisa kembali menambah/mengubah kue di keranjang belanja.'
      };
    } else {
      return {
        updatedState: state,
        message: 'Mohon balas **"YA"** jika data di atas sudah benar, atau ketik **"TIDAK"** untuk membatalkan pendaftaran pesanan.'
      };
    }
  }

  // =========================================================================
  // NORMAL CHAT FLOW (Pencarian Produk, Informasi Harga, Penambahan Keranjang)
  // =========================================================================

  // 1. INTENT: Memulai Checkout via chat
  if (cleaned.match(/\b(checkout|beli|pesan|order|selesai|bayar|kasir)\b/) && cartItems.length > 0) {
    state.step = 'ASK_DELIVERY';
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return {
      updatedState: state,
      message: `Siap Kak! Keranjang Kakak berisi *${cartItems.length} macam kue* dengan total belanja **Rp ${subtotal.toLocaleString()}**.\n\nMari kita catat datanya. Pertama, apakah pesanan ini mau **Ambil Sendiri** di toko Sako, atau **Kirim ke Rumah**? (Ketik pilihan Kakak)`
    };
  }

  if (cleaned.match(/\b(checkout|beli|pesan|order|selesai|bayar|kasir)\b/) && cartItems.length === 0) {
    return {
      updatedState: state,
      message: 'Keranjang belanja Kakak masih kosong nih. Boleh ketik kue yang ingin dipesan terlebih dahulu? Contoh: *"pesan 2 lemper dan 1 roti cokelat"* 😊'
    };
  }

  // 2. Greet (Salam hangat bersahabat)
  if (cleaned.match(/\b(halo|hai|pagi|siang|sore|malam|assalamualaikum|permisi|hello)\b/)) {
    return {
      updatedState: state,
      message: 'Halo Kak! Selamat datang di **TIARA BAKERY SAKO** 🥐✨\n\nSaya Tiara, pelayan virtual toko di sini. Saya bisa bantu Kakak memilih roti kasur, kue basah, jajanan pasar tradisional, atau langsung memproses pesanan Kakak secara cepat.\n\nAda kue lezat apa yang sedang Kakak cari hari ini?'
    };
  }

  // 3. Menanyakan bantuan / cara pesan
  if (cleaned.match(/\b(bantuan|help|cara|panduan|tolong|gimana|bagaimana)\b/)) {
    return {
      updatedState: state,
      message: 'Tentu Kak! Ini beberapa hal yang bisa saya lakukan untuk membantu Kakak:\n\n1. **Pesan Kue**: Ketik kalimat biasa seperti *"pesan 3 lemper dan 2 roti cokelat"*. Item akan otomatis saya daftarkan.\n2. **Tanya Harga**: Ketik *"berapa harga nastar wisman?"*.\n3. **Lihat Menu**: Ketik *"menu"* untuk melihat seluruh jajanan pasar.\n4. **Proses Checkout**: Ketik *"checkout"* untuk membayar pesanan Kakak langsung via WhatsApp toko!\n\nAda yang ingin dipesan sekarang?'
    };
  }

  // 4. Catalog request (Melihat Menu)
  if (cleaned.match(/\b(menu|katalog|daftar|kategori|kue|roti|jajanan|produk|basah|kering)\b/) && !cleaned.match(/\b(berapa|harga|beli|pesan|order)\b/)) {
    return {
      updatedState: state,
      message: 'Berikut adalah menu andalan Tiara Bakery Sako:\n\n🍞 **Roti Lembut**: Roti Cokelat Belgia (Rp8rb), Roti Sobek Keju (Rp18rb), Roti Tawar Gandum (Rp15rb).\n🍮 **Kue Basah**: Lumpur Surga (Rp5rb), Lemper Ayam (Rp4rb), Kue Mangkok (Rp3.5rb).\n🍪 **Kue Kering**: Nastar Wisman (Rp85rb), Kastengel Edam (Rp90rb), Semprit Sagu (Rp65rb).\n🍢 **Jajanan Pasar**: Risoles Rogout (Rp4.5rb), Pastel Bihun (Rp4rb), Kroket Kentang (Rp5rb).\n\nKakak mau coba yang mana? Ketik saja barangnya!'
    };
  }

  // 5. Cek Harga Produk
  if (cleaned.includes('harga') || cleaned.includes('berapa')) {
    const matchedProducts: Product[] = [];
    for (const prod of products) {
      const prodNameCleaned = cleanText(prod.name);
      if (cleaned.includes(prodNameCleaned) || prodNameCleaned.split(' ').every(word => cleaned.includes(word))) {
        matchedProducts.push(prod);
      }
    }

    if (matchedProducts.length > 0) {
      let responseMsg = 'Tentu Kak, ini daftar harga kue yang Kakak tanyakan:\n';
      matchedProducts.forEach(p => {
        responseMsg += `\n✨ **${p.name}** - Rp ${p.price.toLocaleString()} per porsi (Stok tersedia: ${p.stock} pcs)`;
      });
      responseMsg += '\n\nMau saya masukkan berapa pcs ke keranjang belanja Kak?';
      
      // Catat produk terakhir yang dibahas
      state.lastProductId = matchedProducts[0].id;
      
      return {
        updatedState: state,
        message: responseMsg
      };
    }
  }

  // 6. Mendeteksi orderan bertipe "tambah 2" atau "pesan 3" setelah menanyakan produk
  if (cleaned.match(/\b(tambah|pesan|beli|ambil)\b/) && state.lastProductId) {
    const words = cleaned.split(' ');
    let quantity = 1;
    
    // Cari angka
    for (const word of words) {
      const num = parseInt(word, 10);
      if (!isNaN(num) && num > 0) {
        quantity = num;
        break;
      }
      if (INDO_NUMBERS[word]) {
        quantity = INDO_NUMBERS[word];
        break;
      }
    }

    const matchedProd = products.find(p => p.id === state.lastProductId);
    if (matchedProd) {
      return {
        updatedState: state,
        message: `Siap Kak! Saya mendeteksi Kakak ingin memesan **${quantity} pcs ${matchedProd.name}**.\n\nApakah ini sudah benar? Silakan klik tombol **Masukkan ke Keranjang** di bawah ini untuk mengonfirmasi!`,
        action: {
          type: 'ADD_TO_CART',
          payload: { productId: matchedProd.id, name: matchedProd.name, quantity: quantity }
        }
      };
    }
  }

  // 7. Parser Orderan Lengkap (seperti: "beli 2 risoles dan 3 lemper")
  const parsedItems: { productId: string; name: string; quantity: number }[] = [];
  for (const prod of products) {
    const prodNameCleaned = cleanText(prod.name);
    
    // Alias sebutan produk oleh manusia
    const aliases = [
      prodNameCleaned,
      prodNameCleaned.replace('manis ', ''),
      prodNameCleaned.replace('klasik wisman', 'wisman'),
      prodNameCleaned.replace('klasik ', ''),
      prodNameCleaned.replace('keju edam', 'edam'),
      prodNameCleaned.replace('rogout ', ''),
      prodNameCleaned.replace('bihun ', ''),
      prodNameCleaned.replace('kentang ', ''),
      prodNameCleaned.replace('roti manis ', 'roti '),
      'nastar', 'kastengel', 'lumpur surga', 'lemper', 'risoles', 'pastel', 'kroket'
    ];

    let matchedAlias = '';
    const hasMatch = aliases.some(alias => {
      if (cleaned.includes(alias)) {
        matchedAlias = alias;
        return true;
      }
      return false;
    });

    if (hasMatch && matchedAlias !== '') {
      let quantity = 1;
      const words = cleaned.split(' ');
      // Cari kemunculan alias di indeks kata-kata
      const prodIndexInWords = words.findIndex(w => matchedAlias.includes(w) || w.includes(matchedAlias));
      
      if (prodIndexInWords !== -1) {
        const prevWord = words[prodIndexInWords - 1];
        const nextWord = words[prodIndexInWords + 1];
        const doublePrevWord = words[prodIndexInWords - 2];

        const parseNum = (word: string): number | null => {
          if (!word) return null;
          const num = parseInt(word, 10);
          if (!isNaN(num) && num > 0) return num;
          if (INDO_NUMBERS[word]) return INDO_NUMBERS[word];
          return null;
        };

        const qtyPrev = parseNum(prevWord);
        const qtyNext = parseNum(nextWord);
        const qtyDoublePrev = parseNum(doublePrevWord);

        if (qtyPrev !== null) {
          quantity = qtyPrev;
        } else if (qtyDoublePrev !== null) {
          quantity = qtyDoublePrev;
        } else if (qtyNext !== null) {
          quantity = qtyNext;
        }
      }

      parsedItems.push({
        productId: prod.id,
        name: prod.name,
        quantity: quantity
      });
      
      // Update last product ID
      state.lastProductId = prod.id;
    }
  }

  if (parsedItems.length > 0) {
    let orderSummary = 'Baik Kak, saya catat pesanan Kakak berikut ini ya:\n';
    parsedItems.forEach(item => {
      orderSummary += `\n🛒 **${item.name}** sebanyak **${item.quantity} pcs**`;
    });
    orderSummary += '\n\nApakah benar ini yang ingin Kakak masukkan ke keranjang belanja?';

    return {
      updatedState: state,
      message: orderSummary,
      action: {
        type: 'ADD_TO_CART',
        payload: parsedItems // Bisa langsung di-add atau lewat tombol konfirmasi
      }
    };
  }

  // 7.5. Dynamic Knowledge Base FAQ Matching
  if (chatbotKnowledge && chatbotKnowledge.length > 0) {
    const matchedFAQ = chatbotKnowledge.find(k => {
      const keyword = k.keyword.toLowerCase().trim();
      return cleaned.includes(keyword) || keyword.split(' ').every(word => cleaned.includes(word));
    });

    if (matchedFAQ) {
      return {
        updatedState: state,
        message: matchedFAQ.answer
      };
    }
  }

  // 8. Default (Chatbot asisten ramah)
  const defaultFallback = chatbotSettings?.defaultFallback || 'Aduh maaf Kak, saya kurang paham maksudnya. 🥺 Maklum Tiara masih belajar melayani.\n\nBisa diulangi, Kak? Atau Kakak bisa ketik *"bantuan"* untuk melihat apa saja yang bisa Tiara kerjakan, atau Kakak bisa langsung mengeklik menu di katalog atas. Terima kasih Kak! ❤️';
  return {
    updatedState: state,
    message: defaultFallback
  };
};
