import { Link } from "react-router-dom";
import {
  TrendingUp,
  Wallet,
  Target,
  RefreshCw,
  Bell,
  CreditCard,
  ChevronRight,
  BarChart3,
  Users,
  ImageIcon,
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Varlık Takibi",
    desc: "Kripto para, dolar, euro ve altın gibi tüm değerlilerinizi tek ekranda anlık olarak takip edin.",
  },
  {
    icon: BarChart3,
    title: "Harcama Analizi",
    desc: "Gelir ve giderlerinizi manuel olarak girin, harcamalarınızı kategorilere göre inceleyin.",
  },
  {
    icon: Target,
    title: "Tasarruf Hedefleri",
    desc: "Hayalinizdeki hedef için birikim yapın, fotoğraf ekleyin ve sevdiklerinizle ortak hedef oluşturun.",
  },
  {
    icon: RefreshCw,
    title: "Düzenli Gelirler",
    desc: "\"Her ay 400₺ maaş alıyorum\" gibi tekrar eden gelirlerinizi sisteme bir kez tanımlayın, gerisini biz yapalım.",
  },
  {
    icon: Bell,
    title: "Yaklaşan Ödemeler",
    desc: "Kira, fatura, abonelik — tüm yaklaşan ödemelerinizi kaçırmamak için önceden planlayın.",
  },
  {
    icon: CreditCard,
    title: "Çoklu Hesaplar",
    desc: "Nakit, banka hesabı, kumbara — paranızı düzenli tutmak için istediğiniz kadar hesap oluşturun.",
  },
];

const WHY_US = [
  {
    title: "Bankaya Gerek Yok",
    desc: "Banka entegrasyonu yok, gizlilik önce gelir. Verileriniz yalnızca sizin.",
  },
  {
    title: "Kolay Kullanım",
    desc: "Karmaşık grafikler yok. Sade, anlaşılır bir arayüz ile dakikalar içinde başlayın.",
  },
  {
    title: "Birlikte Tasarruf",
    desc: "Hedeflerinizi arkadaşlarınızla veya ailenizle paylaşın ve birlikte birikim yapın.",
  },
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-[500]">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">WhileWallet</span>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <a href="#ozellikler" className="hover:text-blue-600 transition-colors">Özellikler</a>
            <a href="#neden" className="hover:text-blue-600 transition-colors">Neden Biz?</a>
            <a href="#footer" className="hover:text-blue-600 transition-colors">Hakkında</a>
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
            >
              Kayıt Ol
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 space-y-3">
            <a href="#ozellikler" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 py-2" onClick={() => setMenuOpen(false)}>Özellikler</a>
            <a href="#neden" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 py-2" onClick={() => setMenuOpen(false)}>Neden Biz?</a>
            <a href="#footer" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 py-2" onClick={() => setMenuOpen(false)}>Hakkında</a>
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                Giriş Yap
              </Link>
              <Link to="/login" className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-700 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors">
                Kayıt Ol
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-20 pb-28 px-6">
        {/* Decorative blob */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-16 -left-24 w-[350px] h-[350px] bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Paranızın kontrolü artık sizde
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
            Finanslarınızı{" "}
            <span className="text-blue-600 dark:text-blue-400">akıllıca</span>{" "}
            yönetin
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Kripto, döviz, altın, harcama ve tasarruf hedeflerinizi tek bir uygulamada takip edin.
            Banka bağlantısı yok — sadece siz ve paranız.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all hover:-translate-y-0.5 text-base"
            >
              Hemen Başla <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#ozellikler"
              className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-base"
            >
              Özellikleri Gör <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-center">
            {[
              { value: "6+", label: "Özellik" },
              { value: "Ücretsiz", label: "Kullanım" },
              { value: "Türkçe", label: "Tam destek" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{s.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="ozellikler" className="py-24 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest">Özellikler</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Her şey tek yerde</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium max-w-xl mx-auto">
              Paranızı yönetmek için ihtiyacınız olan her araç, sade ve kullanışlı bir arayüzde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-600 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-5 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOAL HIGHLIGHT ── */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest">Öne Çıkan Özellik</p>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Hayalleriniz için <br />birlikte birikim yapın
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg leading-relaxed">
              Yeni telefon, tatil, araba — istediğiniz hedefe özel birikim hesabı oluşturun.
              Bir fotoğraf ekleyin, hedef tutarı belirleyin ve dilediğiniz kişiyi davet ederek
              birlikte tasarruf yapın.
            </p>
            <ul className="space-y-3">
              {[
                "Hedeflerinize özel görsel ekleyin",
                "Arkadaş ve aile ile ortak hedef oluşturun",
                "İlerlemenizi anlık takip edin",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-semibold">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm"
            >
              Hedef Oluştur <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Visual card mockup */}
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-blue-100 dark:to-blue-900/50 rounded-3xl p-8 w-full max-w-sm border border-blue-100 dark:border-blue-800 shadow-xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="w-full h-36 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-white/70" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">Yaz Tatili 🌊</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">3 kişi katılıyor</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
                    <span className="text-blue-600 dark:text-blue-400">6.200 / 10.000 ₺</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "62%" }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex -space-x-2">
                    {["bg-blue-400", "bg-purple-400", "bg-pink-400"].map((c, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center`}>
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium self-center">+ 2 arkadaş</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="neden" className="py-24 px-6 bg-blue-600">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">Neden WhileWallet?</h2>
            <p className="text-blue-100 font-medium text-lg max-w-xl mx-auto">
              Sade, güvenli ve tamamen sizin için tasarlandı.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY_US.map(({ title, desc }) => (
              <div key={title} className="bg-white/10 backdrop-blur rounded-2xl p-7 border border-white/20 text-white hover:bg-white/20 transition-colors">
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-blue-100 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-6 bg-white dark:bg-gray-900 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Finansal özgürlüğünüz <br />
            <span className="text-blue-600 dark:text-blue-400">bir adım uzakta</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
            Hemen ücretsiz hesap oluşturun ve paranızı kontrol altına alın.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 text-base"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-base"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer" className="bg-gray-900 text-gray-400 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">WhileWallet</span>
              </div>
              <p className="text-sm leading-relaxed font-medium">
                Paranızı akıllıca yönetmek için sade ve güvenilir bir araç.
              </p>
            </div>

            {/* Ürün */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Ürün</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a></li>
                <li><a href="#neden" className="hover:text-white transition-colors">Neden Biz?</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Giriş Yap</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Kayıt Ol</Link></li>
              </ul>
            </div>

            {/* Destek */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Destek</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sık Sorulan Sorular</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bize Ulaşın</a></li>
              </ul>
            </div>

            {/* Yasal */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Yasal</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Çerez Politikası</a></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-sm font-medium">
            <p>© 2026 WhileWallet. Tüm hakları saklıdır.</p>
            <p>Türkiye 🇹🇷 için yapıldı</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Index;
