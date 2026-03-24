const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'SUPER_GIZLI_ANAHATAR_KESINLIKLE_MAINE_PUSHLANMAMALI';

// --- oluşturulan ark kodları
const activeGoalCodes = new Map();

// Yeni kullanıcılar veya boş finans verisi olan admin için başlangıç verileri
const INITIAL_FINANCES = {
  goals: [
    {
      id: 1,
      title: "MacBook Pro M3",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
      targetAmount: 75000,
      currentAmount: 30000,
      targetDate: "2026-12-31",
      contributors: [
        { name: "Yönetici", amount: 20000, avatarColor: "bg-blue-100 text-blue-600" },
        { name: "Ali", amount: 10000, avatarColor: "bg-green-100 text-green-600" }
      ],
      history: [
        { id: 101, user: "Yönetici", action: "Para Eklendi", amount: 1500, date: "10 Mart 2026", time: "14:30", likes: 0, isLiked: false },
        { id: 102, user: "Ali", action: "Para Eklendi", amount: 5000, date: "05 Mart 2026", time: "09:15", likes: 0, isLiked: false },
        { id: 103, user: "Yönetici", action: "Hedef Oluşturuldu", amount: 18500, date: "01 Mart 2026", time: "20:00", likes: 0, isLiked: false }
      ]
    },
    {
      id: 2,
      title: "Karadağ Yaz Tatili",
      image: "https://images.unsplash.com/photo-1555885234-a169fa138e6e?auto=format&fit=crop&q=80&w=1000",
      targetAmount: 25000,
      currentAmount: 5000,
      targetDate: "2026-08-15",
      contributors: [
        { name: "Yönetici", amount: 5000, avatarColor: "bg-blue-100 text-blue-600" }
      ],
      history: [
        { id: 201, user: "Yönetici", action: "Para Eklendi", amount: 5000, date: "08 Mart 2026", time: "11:20", likes: 0, isLiked: false }
      ]
    }
  ],
  payments: [
    { id: 1, title: "Ev Kirası", amount: 15000, date: "2026-03-15", iconName: "Home", color: "text-blue-500", isRecurring: true, transactionType: "expense", isCompleted: false, note: "" },
    { id: 2, title: "Maaş Ödemesi", amount: 45000, date: "2026-04-01", iconName: "Banknote", color: "text-green-500", isRecurring: true, transactionType: "income", isCompleted: false, note: "" }
  ]
};

// --- MIDDLEWARE ---
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- DATABASE (SQLite) ---
let db;
(async () => {
  db = await open({ filename: './finance.db', driver: sqlite3.Database });

  await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            finances TEXT DEFAULT '{}'
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL, 
            file_path TEXT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS shared_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,      -- Kodu giren (Veriyi görecek olan)
          friend_id INTEGER NOT NULL,    -- Kodu paylaşan (Hedefin asıl sahibi)
          goal_id TEXT NOT NULL,         -- Paylaşılan hedefin ID'si (1, 2 veya timestamp olabilir)
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
      )
  `);

  const adminExists = await db.get("SELECT * FROM users WHERE email = 'admin'");
  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    await db.run(
      "INSERT INTO users (username, email, password_hash, finances) VALUES ('Yönetici', 'admin', ?, ?)",
      [hashedPassword, JSON.stringify(INITIAL_FINANCES)]
    );
    console.log("👑 Varsayılan admin kullanıcısı oluşturuldu ve örnek veriler yüklendi!");
  } else {
    // Mevcut admin kullanıcısının finans verisi boşsa örnek verileri yükle
    const adminUser = await db.get("SELECT id, finances FROM users WHERE email = 'admin'");
    const currentFinances = JSON.parse(adminUser.finances || '{}');
    if (!currentFinances.goals) {
      await db.run('UPDATE users SET finances = ? WHERE id = ?', [JSON.stringify(INITIAL_FINANCES), adminUser.id]);
      console.log("✅ Admin kullanıcısına başlangıç finans verileri yüklendi!");
    }
  }

  console.log('SQLite veritabanı hazır!');
})();

// --- Multer ile foto yükleme fonksiyonları ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb dosya yükleme sınırı varr
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Sadece fotoğraflara izin verilir.'), false);
  }
});

// --- PASSPORT.JS güvenlik stratejileri ---

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return done(null, false, { message: 'Yanlış Email' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return done(null, false, { message: 'Yanlış Şifre' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', [jwt_payload.id]);
    if (user) return done(null, user);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));


// --- Herkese Açık Route'ler (Auth) ---

// KULLANICI KAYIT OL
// istenilen:  username, email, password
// döndürülen: userId, başarı yazısı
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "Kullanıcı başarıyla kayıt yaptı", userId: result.lastID });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: "Bu Email zaten varki git giriş yap" });
    }
    res.status(500).json({ error: "Kayıt işlemi başarısız, kim bilir niye" });
  }
});

// KULLANICI GİRİŞ YAP
app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, JWT_SECRET, { expiresIn: '1h' }); // Uzattım biraz :)
  res.json({ message: "Başarıyla giriş yapıldı", token: `Bearer ${token}` });
});


// --- KORUMALI ROUTE'LAR (JWT gerektirir) ---
const requireAuth = passport.authenticate('jwt', { session: false });

// Profil Verisi Getir
app.get('/api/user/profile', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
});

// Finans Verisini Getir
app.get('/api/user/finances', requireAuth, async (req, res) => {
  try {
    const user = await db.get('SELECT finances FROM users WHERE id = ?', [req.user.id]);
    res.json(JSON.parse(user.finances || '{}'));
  } catch (error) {
    res.status(500).json({ error: "Finans verisi getirilemedi." });
  }
});

// Finans Verisini Düzenle
app.patch('/api/user/finances', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const newFinanceData = req.body;
    const user = await db.get('SELECT finances FROM users WHERE id = ?', [userId]);

    let currentFinances = JSON.parse(user.finances || '{}');
    const updatedFinances = { ...currentFinances, ...newFinanceData };

    await db.run('UPDATE users SET finances = ? WHERE id = ?', [JSON.stringify(updatedFinances), userId]);
    res.json({ message: "Finans verisi güncellendi!", finances: updatedFinances });
  } catch (error) {
    res.status(500).json({ error: "Finans verisi güncellenemedi." });
  }
});


// Resim Yükle - Frontend formData ile 'image' ve 'name' yollamalı
app.post('/api/user/images', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Lütfen bir resim dosyası seçin." });

    const userId = req.user.id;
    const imageName = req.body.name || 'İsimsiz Resim'; // mesela "kullanici_profili" veya "kullanici_istek_1"
    const filePath = `/uploads/${req.file.filename}`;

    const result = await db.run(
      'INSERT INTO images (user_id, name, file_path) VALUES (?, ?, ?)',
      [userId, imageName, filePath]
    );

    res.status(201).json({ message: "Resim başarıyla yüklendi!", imageId: result.lastID, filePath });
  } catch (error) {
    res.status(500).json({ error: "Resim yüklenirken bir hata oluştu." });
  }
});

// Kullanıcının Tüm Resimlerinin Listesini Getir (sadece isimlerini falan)
app.get('/api/user/images', requireAuth, async (req, res) => {
  try {
    const images = await db.all('SELECT id, name, uploaded_at FROM images WHERE user_id = ?', [req.user.id]);
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: "Resimler getirilemedi." });
  }
});

// Belirli Bir Resmi Görüntüle / İndir (fotonun kendisi yani)
app.get('/api/user/images/:imageId', requireAuth, async (req, res) => {
  try {
    const image = await db.get('SELECT file_path FROM images WHERE id = ? AND user_id = ?', [req.params.imageId, req.user.id]);

    if (!image) return res.status(404).json({ error: "Resim bulunamadı veya size ait değil." });

    const absolutePath = path.resolve(__dirname, image.file_path.substring(1));
    res.sendFile(absolutePath);
  } catch (error) {
    res.status(500).json({ error: "Resim dosyası gönderilirken hata oluştu." });
  }
});

// Resmi Sil (Hem veritabanından hem de 'uploads' klasöründen)
app.delete('/api/user/images/:imageId', requireAuth, async (req, res) => {
  try {
    // 1. Resmi bul
    const image = await db.get('SELECT file_path FROM images WHERE id = ? AND user_id = ?', [req.params.imageId, req.user.id]);
    if (!image) return res.status(404).json({ error: "Resim bulunamadı." });

    // 2. Veritabanından sil
    await db.run('DELETE FROM images WHERE id = ?', [req.params.imageId]);

    // 3. Dosyayı sunucudan fiziksel olarak sil
    const absolutePath = path.resolve(__dirname, image.file_path.substring(1));
    fs.unlink(absolutePath, (err) => {
      if (err) console.error("Dosya silinirken hata:", err);
    });

    res.json({ message: "Resim başarıyla silindi!" });
  } catch (error) {
    res.status(500).json({ error: "Resim silinemedi." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Finans sunucusu http://localhost:${PORT}'da çalışıyor`);
});

//------------------------------------------------------- */
// --- CANLI BORSA API ROUTE'U dövizzzz---
app.get('/api/rates', async (req, res) => {
  try {
    // Backend'imiz Frankfurter'e gidip ham veriyi çeker
    const response = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY,USD,GBP,CHF,JPY,AUD,CAD");
    const data = await response.json();

    if (data && data.rates) {
      // matematiği Frontend yerine burada, sunucuda yapıyoruz
      const rates = {
        EUR: data.rates.TRY.toFixed(2),
        USD: (data.rates.TRY / data.rates.USD).toFixed(2),
        GBP: (data.rates.TRY / data.rates.GBP).toFixed(2),
        CHF: (data.rates.TRY / data.rates.CHF).toFixed(2),
        JPY: (data.rates.TRY / data.rates.JPY).toFixed(2),
        AUD: (data.rates.TRY / data.rates.AUD).toFixed(2),
        CAD: (data.rates.TRY / data.rates.CAD).toFixed(2)
      };

      //  hesaplanmış veriyi yolluyoruz
      res.json(rates);
    } else {
      res.status(400).json({ error: "API'den beklenen veri gelmedi." });
    }
  } catch (error) {
    console.error("Kurlar çekilirken hata:", error);
    res.status(500).json({ error: "Sunucu hatası, kurlar alınamadı." });
  }
});


// --- GEÇMİŞ VERİLER (GRAFİK İÇİN) ---
app.get('/api/historical-rates', async (req, res) => {
  try {
    // Frontend'den gelen istekleri alıyoruz (Örn: base=EUR, symbol=TRY, days=30)
    const base = req.query.base || 'EUR';
    const symbol = req.query.symbol || 'TRY';
    const days = parseInt(req.query.days) || 30; // Varsayılan 30 gün (1 Ay)

    // Tarihleri hesaplıyoruz (Bugün ve X gün öncesi)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startStr = startDate.toISOString().split('T')[0]; // Örn: 2024-02-10
    const endStr = endDate.toISOString().split('T')[0];     // Örn: 2024-03-10

    // Frankfurter'in geçmiş veri URL'si
    const url = `https://api.frankfurter.dev/v1/${startStr}..${endStr}?base=${base}&symbols=${symbol}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.rates) {
      // Recharts kütüphanesinin anlayacağı formata çeviriyoruz [{ date: '...', rate: ... }]
      const chartData = Object.entries(data.rates).map(([date, ratesObj]) => ({
        date: date,
        rate: ratesObj[symbol]
      }));

      res.json(chartData);
    } else {
      res.status(400).json({ error: "Geçmiş veri bulunamadı." });
    }
  } catch (error) {
    console.error("Geçmiş veri çekilirken hata:", error);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// =======================================================
// DÜNYANIN EN BÜYÜK 10 BORSASI İÇİN HİBRİT MOTOR
// =======================================================

const TWELVE_DATA_API_KEY = 'cc04ac6874cb4301963a1977687aa9b9';
const stockCache = {};

// Yahoo'nun kullandığı borsa uzantıları sözlüğü
const GLOBAL_MARKETS = {
  '.IS': { name: 'Borsa İstanbul', exchange: 'BIST' },
  '.L': { name: 'Londra Borsası', exchange: 'LSE' },
  '.DE': { name: 'Almanya (XETRA)', exchange: 'XETRA' },
  '.PA': { name: 'Paris Borsası', exchange: 'EPA' },
  '.T': { name: 'Tokyo Borsası', exchange: 'TSE' },
  '.HK': { name: 'Hong Kong Borsası', exchange: 'HKG' },
  '.TO': { name: 'Toronto Borsası', exchange: 'TSX' },
  '.AX': { name: 'Avustralya Borsası', exchange: 'ASX' },
  '.NS': { name: 'Hindistan Borsası', exchange: 'NSE' }
};

app.get('/api/stock/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol.toUpperCase();

  // 1. (CACHE KONTROLÜ)
  if (stockCache[rawSymbol] && (Date.now() - stockCache[rawSymbol].timestamp < 60000)) {
    console.log(`[⚡ CACHE HIZI] Hafızadan getirildi: ${rawSymbol}`);
    return res.json(stockCache[rawSymbol].data);
  }

  try {
    let quoteData;
    let historyData;

    //  DİNAMİK KONTROL: Gelen hisse GLOBAL_MARKETS sözlüğündeki bir uzantıya sahip mi?
    const marketSuffix = Object.keys(GLOBAL_MARKETS).find(suffix => rawSymbol.endsWith(suffix));

    if (marketSuffix) {
      const marketInfo = GLOBAL_MARKETS[marketSuffix];
      console.log(`[🌍 YEDEK MOTOR] Global Hisse algılandı (${marketInfo.name}), Yahoo'ya gidiliyor: ${rawSymbol}`);

      const yahooUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${rawSymbol}?interval=1d&range=2mo`;
      const response = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await response.json();

      if (!data.chart.result) return res.status(404).json({ error: `${rawSymbol} adında bir hisse bulunamadı.` });

      const resultObj = data.chart.result[0];
      const meta = resultObj.meta;
      const timestamps = resultObj.timestamp || [];
      const quotes = resultObj.indicators.quote[0];

      quoteData = {
        symbol: rawSymbol,
        name: rawSymbol.replace(marketSuffix, '') + ` (${marketInfo.name})`,
        exchange: marketInfo.exchange,
        close: meta.regularMarketPrice,
        change: (meta.regularMarketPrice - meta.chartPreviousClose),
        percent_change: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
      };

      const values = [];
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (quotes.close[i] !== null && quotes.close[i] !== undefined) {
          values.push({
            datetime: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: quotes.open[i] || quotes.close[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
          });
        }
        if (values.length === 30) break;
      }
      historyData = { values: values };

    }
    // Uzantı yoksa demek ki Amerikan Hissesi (Wall Street)!
    else {
      console.log(`[🌍 API İSTEĞİ] Twelve Data'ya gidiliyor: ${rawSymbol}`);
      const quoteUrl = `https://api.twelvedata.com/quote?symbol=${rawSymbol}&apikey=${TWELVE_DATA_API_KEY}`;
      const quoteRes = await fetch(quoteUrl);
      quoteData = await quoteRes.json();

      const historyUrl = `https://api.twelvedata.com/time_series?symbol=${rawSymbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_API_KEY}`;
      const historyRes = await fetch(historyUrl);
      historyData = await historyRes.json();

      if (quoteData.status === 'error' || quoteData.code === 400) return res.status(404).json({ error: `${rawSymbol} adında hisse bulunamadı.` });
      if (quoteData.code === 429 || historyData.code === 429) return res.status(429).json({ error: "API Limiti! 1 dakika bekle." });
    }

    // ORTAK VERİ İŞLEME MERKEZİ
    const rawHistory = historyData.values ? historyData.values.reverse() : [];
    let greenDays = 0, redDays = 0;

    const formattedChartData = rawHistory.map(item => {
      const closePrice = parseFloat(item.close);
      const openPrice = parseFloat(item.open);
      const isPositive = closePrice >= openPrice;
      if (isPositive) greenDays++; else redDays++;
      return {
        date: item.datetime.split('-').slice(1).join('/'),
        price: closePrice, open: openPrice, volume: parseInt(item.volume) / 1000000, isPositive
      };
    });

    const result = {
      info: quoteData,
      chartData: formattedChartData,
      momentumData: [{ name: 'Alıcılı (Yeşil)', value: greenDays, color: '#10B981' }, { name: 'Satıcılı (Kırmızı)', value: redDays, color: '#EF4444' }]
    };

    stockCache[rawSymbol] = { timestamp: Date.now(), data: result };
    res.json(result);

  } catch (error) {
    console.error(`[❌ HATA] ${rawSymbol} çekilirken backend patladı:`, error);
    res.status(500).json({ error: "Sunucu hatası, hisse verisi alınamadı." });
  }
});

// =======================================================
//  HİSSE ARAMA MOTORU (LİMİTSİZ YAHOO FINANCE ALTYAPISI)
// =======================================================
app.get('/api/search/:query', async (req, res) => {
  try {
    const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${req.params.query}&quotesCount=6&newsCount=0`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (data && data.quotes) {
      res.json(data.quotes.filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF').map(q => ({ symbol: q.symbol, name: q.shortname || q.longname, exchange: q.exchDisp || q.exchange })));
    } else {
      res.json([]);
    }
  } catch (error) { res.status(500).json({ error: "Arama motoru yanıt vermiyor." }); }
});

// =======================================================
//  KRİPTO ARAMA MOTORU (COINGECKO & CACHE ZIRHI)
// =======================================================
const cryptoSearchCache = {};

app.get('/api/crypto/search/:query', async (req, res) => {
  const query = req.params.query.toLowerCase();

  // 1. HAFIZA KONTROLÜ: Eğer son 2 dakika içinde aynı kelime arandıysa CoinGecko'yu yorma!
  if (cryptoSearchCache[query] && (Date.now() - cryptoSearchCache[query].timestamp < 120000)) {
    console.log(`[⚡ CACHE HIZI] Kripto hafızadan getirildi: ${query}`);
    return res.json(cryptoSearchCache[query].data);
  }

  try {
    console.log(`[🌍 API İSTEĞİ] CoinGecko'da aranıyor: ${query}`);
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
    const data = await response.json();

    if (data && data.coins) {
      const results = data.coins.slice(0, 6); // Sadece ilk 6 sonucu al

      // Sonucu hafızaya (Cache) kaydet
      cryptoSearchCache[query] = { timestamp: Date.now(), data: results };
      res.json(results);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Kripto arama hatası:", error);
    res.status(500).json({ error: "Kripto arama motoru yanıt vermiyor." });
  }
});

// =======================================================
// COINGECKO ZIRHLI PROXY (CACHE SİSTEMİ)
// =======================================================

// 1. Ana Sayfa Widget Hafızası (60 saniye tutar)
let widgetCache = { data: null, timestamp: 0 };
app.get('/api/crypto/widget', async (req, res) => {
  if (widgetCache.data && (Date.now() - widgetCache.timestamp < 60000)) {
    console.log("⚡ Widget hafızadan (cache) yüklendi!");
    return res.json(widgetCache.data);
  }
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=4&page=1&sparkline=true&price_change_percentage=24h');
    const data = await response.json();
    widgetCache = { data, timestamp: Date.now() };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Widget verisi çekilemedi" });
  }
});

// 2. Terminal Detay Hafızası (2 Dakika tutar)
const detailsCache = {};
app.get('/api/crypto/details/:id', async (req, res) => {
  const id = req.params.id;
  if (detailsCache[id] && (Date.now() - detailsCache[id].timestamp < 120000)) {
    return res.json(detailsCache[id].data);
  }
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`);
    const data = await response.json();
    detailsCache[id] = { data, timestamp: Date.now() };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Detay çekilemedi" });
  }
});

// 3. Terminal Grafik Hafızası (2 Dakika tutar)
const chartCache = {};
app.get('/api/crypto/chart/:id', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || '1';
  const cacheKey = `${id}-${days}`;

  if (chartCache[cacheKey] && (Date.now() - chartCache[cacheKey].timestamp < 120000)) {
    return res.json(chartCache[cacheKey].data);
  }
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
    const data = await response.json();
    chartCache[cacheKey] = { data, timestamp: Date.now() };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Grafik çekilemedi" });
  }
});



// =======================================================
// --- ORTAK HEDEF (SADECE BELİRLİ GOAL) SİSTEMİ ---
// =======================================================

// 1. Hedef İçin Kod Üret (Hedef sahibi tetikler)
app.post('/api/friends/generate-code', requireAuth, (req, res) => {
  try {
    const { goalId } = req.body; // Frontend'den paylaşılan hedefin ID'si gelmeli
    if (!goalId) return res.status(400).json({ error: "Lütfen paylaşılacak hedefin ID'sini gönderin." });

    // 6 haneli rastgele kod üret
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // 1 saat (60 * 60 * 1000 ms) geçerlilik süresi
    const expiresAt = Date.now() + 3600000;

    // Kodu RAM'e kaydet
    activeGoalCodes.set(code, {
      userId: req.user.id,
      goalId: goalId.toString(), // Garanti olsun diye string yapıyoruz
      expiresAt: expiresAt
    });

    // 1 Saat sonra RAM'den otomatik silinmesi için zamanlayıcı kur
    setTimeout(() => {
      activeGoalCodes.delete(code);
    }, 3600000);

    res.status(201).json({ 
      message: "Hedef paylaşım kodu oluşturuldu!", 
      code, 
      expiresIn: "1 Saat" 
    });
  } catch (error) {
    res.status(500).json({ error: "Kod oluşturulamadı." });
  }
});

// 2. Kodu Girerek Hedefe Katıl (Davetli tetikler)
app.post('/api/friends/join', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Lütfen bir kod girin." });

    // Kodu RAM'de ara
    const codeData = activeGoalCodes.get(code.toUpperCase());

    if (!codeData || codeData.expiresAt < Date.now()) {
      return res.status(404).json({ error: "Geçersiz veya süresi dolmuş kod." });
    }

    if (codeData.userId === req.user.id) {
      return res.status(400).json({ error: "Kendi hedefinize kendiniz katılamazsınız." });
    }

    // Zaten bu hedefe katılmış mı kontrol et
    const existingShare = await db.get(
      'SELECT * FROM shared_goals WHERE user_id = ? AND friend_id = ? AND goal_id = ?',
      [req.user.id, codeData.userId, codeData.goalId]
    );

    if (existingShare) {
      return res.status(400).json({ error: "Bu hedefe zaten katılmışsınız." });
    }

    // Davetlinin erişimini veritabanına kaydet
    await db.run(
      'INSERT INTO shared_goals (user_id, friend_id, goal_id) VALUES (?, ?, ?)', 
      [req.user.id, codeData.userId, codeData.goalId]
    );

    // Kod tek kullanımlıksa hemen RAM'den sil. (Eğer bir kodu birden fazla kişi kullansın dersen bu satırı silebilirsin)
    activeGoalCodes.delete(code.toUpperCase());

    res.json({ message: "Hedefe başarıyla katıldınız!" });
  } catch (error) {
    res.status(500).json({ error: "Hedefe katılırken bir hata oluştu." });
  }
});

// 3. Katıldığım Ortak Hedefleri Getir (Tüm finans verisi yerine SADECE paylaşılan hedefler)
app.get('/api/friends/shared-goals', requireAuth, async (req, res) => {
  try {
    // 1. Kullanıcının katıldığı tüm hedef bağlarını bul
    const shares = await db.all(`
      SELECT shared_goals.goal_id, users.id as friend_id, users.username as friend_name, users.finances
      FROM shared_goals
      JOIN users ON shared_goals.friend_id = users.id
      WHERE shared_goals.user_id = ?
    `, [req.user.id]);

    const sharedGoalsList = [];

    // 2. Her bir bağ için, arkadaşın verisini JSON'dan çıkarıp sadece o spesifik hedefi filtrele
    shares.forEach(share => {
      const friendFinances = JSON.parse(share.finances || '{}');
      const friendGoals = friendFinances.goals || [];
      
      // Arkadaşın hedefleri arasından sadece ID'si eşleşen(ler)i bul
      const specificGoal = friendGoals.find(g => g.id.toString() === share.goal_id.toString());
      
      if (specificGoal) {
        // Hedefin içine kimin hedefi olduğunu da ekleyelim ki frontend'de gösterebilesin
        sharedGoalsList.push({
          ...specificGoal,
          ownerId: share.friend_id,
          ownerName: share.friend_name
        });
      }
    });

    res.json({ sharedGoals: sharedGoalsList });
  } catch (error) {
    console.error("Ortak hedefler getirilirken hata:", error);
    res.status(500).json({ error: "Ortak hedefler getirilemedi." });
  }
});

// 4. Ortak Hedefe Para Ekle/Çıkar (Davetlinin İşlemi)
app.post('/api/friends/shared-goals/:goalId/transaction', requireAuth, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { amount, actionNote, type } = req.body; // type: 'add' veya 'withdraw'
    
    // 1. Yetki Kontrolü: Bu kullanıcı bu hedefe ortak mı?
    const shareRecord = await db.get(
      'SELECT friend_id FROM shared_goals WHERE user_id = ? AND goal_id = ?',
      [req.user.id, goalId]
    );

    if (!shareRecord) return res.status(403).json({ error: "Bu hedefe işlem yapma yetkiniz yok." });

    const ownerId = shareRecord.friend_id;

    // 2. Hedef sahibinin (owner) verisini çek
    const owner = await db.get('SELECT finances FROM users WHERE id = ?', [ownerId]);
    const ownerFinances = JSON.parse(owner.finances || '{}');
    
    const goalIndex = ownerFinances.goals.findIndex(g => g.id.toString() === goalId.toString());
    if (goalIndex === -1) return res.status(404).json({ error: "Hedef sahibinin hesabında bulunamadı." });

    const goal = ownerFinances.goals[goalIndex];
    
    // 3. İşlemi Uygula
    const transactionAmount = type === 'add' ? Number(amount) : -Number(amount);
    
    // Bakiye kontrolü (Eksiye düşmesini engelle)
    if (type === 'withdraw' && goal.currentAmount + transactionAmount < 0) {
        return res.status(400).json({ error: "Yetersiz bakiye." });
    }

    goal.currentAmount += transactionAmount;

    // Geçmişe Ekle
    const now = new Date();
    goal.history.unshift({
      id: Date.now(),
      user: req.user.username,
      action: actionNote,
      amount: transactionAmount,
      date: now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
      time: now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      isLiked: false
    });

    // Katkıda Bulunanları (Contributors) Güncelle
    if (!goal.contributors) goal.contributors = [];
    const contributorIndex = goal.contributors.findIndex(c => c.name === req.user.username);
    
    if (type === 'add') {
        if (contributorIndex > -1) {
            goal.contributors[contributorIndex].amount += Number(amount);
        } else {
            goal.contributors.push({
                name: req.user.username,
                amount: Number(amount),
                avatarColor: "bg-green-100 text-green-600" // Arkadaşlara özel renk
            });
        }
    } else if (type === 'withdraw' && contributorIndex > -1) {
        goal.contributors[contributorIndex].amount = Math.max(0, goal.contributors[contributorIndex].amount - Number(amount));
    }

    // 4. Hedef sahibinin JSON verisini güncelle ve kaydet
    await db.run('UPDATE users SET finances = ? WHERE id = ?', [JSON.stringify(ownerFinances), ownerId]);

    res.json({ message: "İşlem başarılı", updatedGoal: goal });

  } catch (error) {
    console.error("Ortak hedefe işlem yaparken hata:", error);
    res.status(500).json({ error: "İşlem gerçekleştirilemedi." });
  }
});