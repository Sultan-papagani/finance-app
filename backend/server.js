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

const app = express();
const PORT = 3000;
const JWT_SECRET = 'SUPER_GIZLI_ANAHATAR_KESINLIKLE_MAINE_PUSHLANMAMALI'; 

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

    const adminExists = await db.get("SELECT * FROM users WHERE email = 'admin'");
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt); // Şifre: admin
        
        await db.run(
            "INSERT INTO users (username, email, password_hash) VALUES ('Yönetici', 'admin', ?)",
            [hashedPassword]
        );
        console.log("👑 Varsayılan admin kullanıcısı oluşturuldu! (Kullanıcı adı/Email: admin, Şifre: admin)");
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

// Finans Verisini Düzenle
app.patch('/api/user/finances', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; 
        const newFinanceData = req.body; 
        const user = await db.get('SELECT finances FROM users WHERE id = ?', [userId]);
        
        let currentFinances = JSON.parse(user.finances || '{}');
        const updatedFinances = { ...currentFinances, ...newFinanceData };

        await db.run('UPDATE users SET finances = ? WHERE id = ?', [JSON.stringify(updatedFinances), userId]);
        res.json({ message: "Kullanıcı json verisi düzenlendi!", finances: updatedFinances });
    } catch (error) {
        res.status(500).json({ error: "Kulanıcı json verisi düzenlenemedi" });
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
//  TWELVE DATA - HİSSE SENEDİ API MOTORU (REAL-TIME VERİ + GRAFİK VERİSİ + MOMENTUM VERİSİ)
// =======================================================

const TWELVE_DATA_API_KEY = 'cc04ac6874cb4301963a1977687aa9b9'; 
const stockCache = {}; 

app.get('/api/stock/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  // 1. ZEKİ YAKLAŞIM (CACHE KONTROLÜ)
  if (stockCache[symbol] && (Date.now() - stockCache[symbol].timestamp < 60000)) {
    console.log(`[ CACHE HIZI] Hafızadan getirildi: ${symbol}`);
    return res.json(stockCache[symbol].data);
  }

  try {
    console.log(`[ API İSTEĞİ] Twelve Data'ya gidiliyor: ${symbol}`);
    
    // 2. Ham Verileri Çek
    const quoteUrl = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`;
    const quoteRes = await fetch(quoteUrl);
    const quoteData = await quoteRes.json();

    const historyUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_API_KEY}`;
    const historyRes = await fetch(historyUrl);
    const historyData = await historyRes.json();

    if (quoteData.status === 'error' || quoteData.code === 400) {
      return res.status(404).json({ error: `${symbol} adında bir hisse bulunamadı.` });
    }
    if (quoteData.code === 429 || historyData.code === 429) {
      return res.status(429).json({ error: "Dakikada 8 istek limitine takıldık! 1 dakika bekle kingo." });
    }


    const rawHistory = historyData.values ? historyData.values.reverse() : [];
    let greenDays = 0;
    let redDays = 0;

    // Frontend yorulmasın diye grafiğin datası Backend'de hazırlanıyor
    const formattedChartData = rawHistory.map(item => {
      const closePrice = parseFloat(item.close);
      const openPrice = parseFloat(item.open);
      const isPositive = closePrice >= openPrice;
      
      if (isPositive) greenDays++; else redDays++;

      return {
        date: item.datetime.split('-').slice(1).join('/'), // 2026-03-10 -> 03/10 yapar
        price: closePrice,
        open: openPrice,
        volume: parseInt(item.volume) / 1000000, // Direkt Milyon'a çevirip yollar
        isPositive: isPositive
      };
    });

    // Momentum pastasının verisi de Backend'den hazır gidiyor
    const momentumData = [
      { name: 'Alıcılı (Yeşil)', value: greenDays, color: '#10B981' },
      { name: 'Satıcılı (Kırmızı)', value: redDays, color: '#EF4444' }
    ];

    // Sonuç
    const result = {
      info: quoteData,
      chartData: formattedChartData,
      momentumData: momentumData
    };

    // 5. Cache'e kaydet ve yolla
    stockCache[symbol] = { timestamp: Date.now(), data: result };
    res.json(result);

  } catch (error) {
    console.error(`[❌ HATA] ${symbol} çekilirken backend patladı:`, error);
    res.status(500).json({ error: "Sunucu hatası, hisse verisi alınamadı." });
  }
});

// =======================================================
//  HİSSE ARAMA MOTORU (LİMİTSİZ YAHOO FINANCE ALTYAPISI)
// =======================================================
app.get('/api/search/:query', async (req, res) => {
  const query = req.params.query;
  try {
    //  Yahoo bizi bot sanmasın diye kendimizi gerçek bir tarayıcı (Chrome) gibi gösteriyoruz!
    const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=6&newsCount=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();

    if (data && data.quotes) {
      // Sadece hisse senetlerini (EQUITY) ve ETF'leri filtrele
      const results = data.quotes
        .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
        .map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || 'Bilinmeyen Şirket',
          exchange: q.exchDisp || q.exchange || 'Borsa'
        }));
      
      res.json(results);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(`[Arama Hatası] ${query} aranırken patladı:`, error);
    res.status(500).json({ error: "Arama motoru yanıt vermiyor." });
  }
});