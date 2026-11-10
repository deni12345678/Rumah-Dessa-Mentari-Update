import React, { useState, useEffect } from 'react';
import {
  Compass,
  Edit3,
  BookOpen,
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Feather,
  Clock,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { Article, ArticleCategory, User } from './types';
import { DmlStore } from './lib/store';
import { Header, CATEGORIES_LIST } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailPage } from './components/ArticleDetailPage';
import { ContributorDashboard } from './components/ContributorDashboard';
import { EditorDashboard } from './components/EditorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ServicesPage } from './components/ServicesPage';
import { PublishingFoundationPage } from './components/PublishingFoundationPage';
import { PolicyPages } from './components/PolicyPages';
import { AuthModal } from './components/AuthModal';
import { CorrectionModal } from './components/CorrectionModal';
import { SearchModal } from './components/SearchModal';
import { ShareModal } from './components/ShareModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Leaderboard } from './components/Leaderboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('beranda');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'Semua'>('Semua');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [contributorSubTab, setContributorSubTab] = useState<'daftar' | 'tulis' | 'profil' | 'pedoman' | 'notifikasi'>('daftar');
  const [adminSubTab, setAdminSubTab] = useState<'pending_writers' | 'users' | 'consultations' | 'settings' | 'email_logs' | 'backup' | 'admin_profile'>('pending_writers');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [correctionArticle, setCorrectionArticle] = useState<Article | null>(null);

  // Articles & Settings
  const [articles, setArticles] = useState<Article[]>([]);
  const [settings, setSettings] = useState(DmlStore.getSettings());

  // Subscribe to store updates
  useEffect(() => {
    // Ensure store is initialized properly
    DmlStore.init();

    // Initialize initial seed data if not present
    DmlStore.init().then(() => {
      DmlStore.incrementSiteVisit();
      setCurrentUser(DmlStore.getCurrentUser());
      setArticles(DmlStore.getArticles('published'));
      setSettings(DmlStore.getSettings());
    });

    const unsubscribe = DmlStore.subscribe(() => {
      setCurrentUser(DmlStore.getCurrentUser());
      setArticles(DmlStore.getArticles('published'));
      setSettings(DmlStore.getSettings());
    });

    return unsubscribe;
  }, []);

  // Update browser tab title and OpenGraph meta tags dynamically
  useEffect(() => {
    const brand = settings?.brandName || 'Rumah Dessa Mentari';
    const slogan = settings?.slogan || 'Inspirasi untuk Semua, Karya untuk Dunia';
    document.title = `${brand} — ${slogan}`;

    try {
      const origin = window.location.origin;
      const logoCardUrl = `${origin}/og-card.jpg`;
      const desc = 'Platform media literasi inspiratif, opini pemikiran intelektual, wadah kontributor artikel, dan layanan profesional penulisan serta penerbitan buku.';

      const updateMeta = (attr: string, key: string, content: string) => {
        let el = document.querySelector(`meta[${attr}="${key}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, key);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      updateMeta('property', 'og:title', `${brand} — ${slogan}`);
      updateMeta('property', 'og:site_name', brand);
      updateMeta('property', 'og:description', desc);
      updateMeta('property', 'og:image', logoCardUrl);
      updateMeta('property', 'og:image:secure_url', logoCardUrl);
      updateMeta('property', 'og:image:type', 'image/jpeg');
      updateMeta('property', 'og:image:width', '1200');
      updateMeta('property', 'og:image:height', '630');
      updateMeta('property', 'og:url', origin);
      updateMeta('name', 'description', desc);
      updateMeta('name', 'twitter:title', `${brand} — ${slogan}`);
      updateMeta('name', 'twitter:description', desc);
      updateMeta('name', 'twitter:image', logoCardUrl);
    } catch {}
  }, [settings?.brandName, settings?.slogan]);

  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'artikel') {
      if (param && CATEGORIES_LIST.includes(param as any)) {
        setSelectedCategory(param as ArticleCategory);
      } else {
        setSelectedCategory('Semua');
      }
      setCurrentView('artikel');
    } else if (view === 'dashboard-kontributor') {
      if (param === 'tulis') {
        setContributorSubTab('tulis');
      } else if (param === 'profil') {
        setContributorSubTab('profil');
      } else if (param === 'pedoman') {
        setContributorSubTab('pedoman');
      } else if (param === 'notifikasi') {
        setContributorSubTab('notifikasi');
      } else {
        setContributorSubTab('daftar');
      }
      setCurrentView('dashboard-kontributor');
    } else if (view === 'dashboard-admin') {
      if (param === 'admin_profile' || param === 'profil') {
        setAdminSubTab('admin_profile');
      } else if (param === 'users') {
        setAdminSubTab('users');
      } else if (param === 'settings') {
        setAdminSubTab('settings');
      } else if (param === 'consultations') {
        setAdminSubTab('consultations');
      } else if (param === 'email_logs') {
        setAdminSubTab('email_logs');
      } else if (param === 'backup') {
        setAdminSubTab('backup');
      } else {
        setAdminSubTab('pending_writers');
      }
      setCurrentView('dashboard-admin');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectArticle = (art: Article) => {
    setActiveArticle(art);
    setCurrentView('artikel-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredArticle = articles.find(a => a.featured) || articles[0];
  const recentArticles = articles.filter(a => a.id !== featuredArticle?.id);

  // Category counts
  const articleCounts = articles.reduce<Record<string, number>>((acc, art) => {
    acc[art.category] = (acc[art.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Universal Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          DmlStore.logout();
          setCurrentView('beranda');
        }}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenShare={() => setShareModalOpen(true)}
      />

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1">
        <div
          key={currentView + (currentView === 'artikel-detail' && activeArticle ? `-${activeArticle.id}` : '')}
          className="view-transition-fade"
        >
          {/* VIEW: BERANDA (HOMEPAGE) */}
          {currentView === 'beranda' && (
          <div>
            {/* 1. Hero Section */}
            <Hero
              onNavigate={handleNavigate}
              onOpenAuth={() => setAuthModalOpen(true)}
              isLoggedIn={!!currentUser}
              onOpenShare={() => setShareModalOpen(true)}
            />

            {/* 2. Artikel Pilihan (Featured Article) */}
            {featuredArticle && (
              <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8 border-b border-stone-200/80 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                      Fokus Redaksi Utama
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
                      Artikel Pilihan Pekan Ini
                    </h2>
                  </div>
                  <button
                    onClick={() => handleNavigate('artikel', 'Semua')}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
                  >
                    <span>Indeks Berita & Opini</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <ArticleCard
                  article={featuredArticle}
                  onClick={handleSelectArticle}
                  variant="featured"
                />
              </section>
            )}

            {/* 3. Artikel Terbaru (Latest Articles) */}
            <section className="py-14 bg-white border-y border-stone-200/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                      Terbitan Mutakhir
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
                      Kabar, Refleksi & Wawasan Terbaru
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigate('artikel', 'Semua')}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      Buka Semua Naskah ({articles.length})
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentArticles.slice(0, 6).map(art => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Jelajahi Kategori */}
            <CategoryGrid
              onSelectCategory={cat => handleNavigate('artikel', cat)}
              articleCounts={articleCounts}
            />

            {/* 5. Ruang Kontributor */}
            <section className="py-16 bg-gradient-to-br from-[#0F1E36] via-[#1B2E4A] to-[#0A1424] text-white">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Feather className="w-6 h-6" />
                </div>

                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
                  Ruang Karya & Komunitas Kontributor RDM
                </span>

                <h2 className="text-2xl sm:text-4xl font-serif-editorial font-bold leading-tight">
                  Punya cerita, pengalaman, pengetahuan, atau gagasan yang bermanfaat?
                </h2>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Bagikan bersama Rumah Dessa Mentari. Kami percaya bahwa setiap orang memiliki mutiara hikmah yang layak diabadikan dalam bentuk tulisan yang bernas dan beretika.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthModalOpen(true);
                      } else {
                        handleNavigate('dashboard-kontributor', 'tulis');
                      }
                    }}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Mulai Menulis</span>
                  </button>

                  <button
                    onClick={() => handleNavigate('pedoman-penulisan')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all"
                  >
                    Pelajari Pedoman Redaksi
                  </button>
                </div>
              </div>
            </section>

            {/* 6. Layanan Penulisan dan Buku */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                    RDM Literary Services
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-slate-900 leading-tight">
                    Layanan Penulisan, Penyuntingan & Tata Letak Buku
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Wujudkan impian melahirkan buku berkualitas. Dari pendampingan biografi, penyuntingan substantif naskah ilmiah, proofreading EYD/PUEBI, hingga tata letak interior siap cetak.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleNavigate('layanan')}
                      className="px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1B365D] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Konsultasikan Naskah Anda</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('penerbitan')}
                      className="px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-semibold text-xs transition-colors"
                    >
                      Lihat Fondasi Penerbitan
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Ghostwriting</span>
                    <p className="text-slate-500 leading-relaxed">Penulisan biografi & rekam jejak perjuangan.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Penyuntingan</span>
                    <p className="text-slate-500 leading-relaxed">Penyelarasan alur logika & struktur bab.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Proofreading</span>
                    <p className="text-slate-500 leading-relaxed">Pembersihan salah ketik & kepatuhan EYD/PUEBI.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                    <span className="font-bold text-slate-900 text-sm block">Tata Letak</span>
                    <p className="text-slate-500 leading-relaxed">Desain interior naskah standar percetakan.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: ARTIKEL INDEX & FILTER */}
        {currentView === 'artikel' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Indeks Rubrik Redaksi
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900">
                {selectedCategory === 'Semua' ? 'Seluruh Tulisan Terkurasi' : `Rubrik: ${selectedCategory}`}
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Jelajahi kumpulan esai, reportase inspiratif, studi kasus UMKM, dan ulasan buku dari para kontributor.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === 'Semua'
                    ? 'bg-[#0F1E36] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Semua ({articles.length})
              </button>
              {CATEGORIES_LIST.map(cat => {
                const count = articleCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* Articles Grid */}
            {(() => {
              const filtered = DmlStore.getPublishedArticles(selectedCategory);
              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                    <p className="text-sm text-slate-600 font-medium">
                      Belum ada artikel yang diterbitkan untuk rubrik "{selectedCategory}".
                    </p>
                    <button
                      onClick={() => setSelectedCategory('Semua')}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
                    >
                      Kembali ke Semua Rubrik
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(art => (
                    <ArticleCard
                      key={art.id}
                      article={art}
                      onClick={handleSelectArticle}
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW: RANKING PENULIS (LEADERBOARD) */}
        {currentView === 'ranking' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-serif-editorial font-bold text-slate-900 tracking-tight">
                  Apresiasi & Ranking Penulis
                </h1>
                <p className="text-slate-600 max-w-xl mx-auto text-sm leading-relaxed">
                  Platform Rumah Dessa Mentari memberikan penghargaan bagi para kontributor yang paling aktif berbagi inspirasi dan karya bagi dunia.
                </p>
              </div>
              <Leaderboard />
            </div>
          </div>
        )}

        {/* VIEW: ARTIKEL DETAIL */}
        {currentView === 'artikel-detail' && activeArticle && (
          <ArticleDetailPage
            article={activeArticle}
            onBack={() => handleNavigate('artikel', activeArticle.category)}
            onSelectArticle={handleSelectArticle}
            relatedArticles={articles.filter(
              a => a.category === activeArticle.category && a.id !== activeArticle.id
            )}
            onOpenCorrection={art => setCorrectionArticle(art)}
          />
        )}

        {/* VIEW: LAYANAN KAMI */}
        {currentView === 'layanan' && <ServicesPage />}

        {/* VIEW: PENERBITAN & BUKU */}
        {currentView === 'penerbitan' && <PublishingFoundationPage />}

        {/* VIEW: DASHBOARD KONTRIBUTOR */}
        {currentView === 'dashboard-kontributor' && (
          currentUser ? (
            <ContributorDashboard
              currentUser={currentUser}
              onSelectArticle={handleSelectArticle}
              initialTab={contributorSubTab}
            />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
              <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
                Ruang Khusus Kontributor
              </h2>
              <p className="text-xs text-slate-600">
                Silakan masuk atau mendaftar untuk mengakses dashboard penulis, menyimpan draf, dan mengirimkan naskah.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                Masuk / Buat Akun Penulis
              </button>
            </div>
          )
        )}

        {/* VIEW: DASHBOARD EDITOR */}
        {currentView === 'dashboard-editor' && (
          currentUser && (currentUser.role === 'editor' || currentUser.role === 'admin') ? (
            <EditorDashboard
              currentUser={currentUser}
              onSelectArticle={handleSelectArticle}
            />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
              <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
                Akses Terbatas Meja Redaksi
              </h2>
              <p className="text-xs text-slate-600">
                Halaman ini khusus diperuntukkan bagi Editor atau Administrator Rumah Dessa Mentari.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2 rounded-xl bg-[#0F1E36] text-white font-bold text-xs"
              >
                Ganti Akun Masuk
              </button>
            </div>
          )
        )}

        {/* VIEW: DASHBOARD ADMIN */}
        {currentView === 'dashboard-admin' && (
          currentUser && currentUser.role === 'admin' ? (
            <AdminDashboard currentUser={currentUser} initialTab={adminSubTab} />
          ) : (
            <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
              <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
                Akses Terbatas Administrator
              </h2>
              <p className="text-xs text-slate-600">
                Halaman ini membutuhkan hak otorisasi Administrator utama.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Masuk Sebagai Admin
              </button>
            </div>
          )
        )}

        {/* VIEW: STATIC POLICY PAGES */}
        {[
          'tentang',
          'pedoman-penulisan',
          'ketentuan-publikasi',
          'kebijakan-privasi',
          'ketentuan-penggunaan',
          'hak-cipta-dan-koreksi',
        ].includes(currentView) && (
          <PolicyPages
            pageType={currentView as any}
            onNavigate={handleNavigate}
          />
        )}
        </div>
      </main>

      {/* Universal Footer */}
      <Footer
        onNavigate={handleNavigate}
        whatsappNumber={settings.whatsappNumber}
        contactEmail={settings.contactEmail}
        onOpenShare={() => setShareModalOpen(true)}
      />

      {/* POPUP MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentUser(DmlStore.getCurrentUser());
        }}
      />

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectArticle={handleSelectArticle}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      <CorrectionModal
        article={correctionArticle}
        isOpen={!!correctionArticle}
        onClose={() => setCorrectionArticle(null)}
      />

      <OfflineIndicator />
    </div>
  );
}
