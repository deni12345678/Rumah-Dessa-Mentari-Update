import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Heart,
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Info,
  HeartPulse,
  Tag,
  BookOpen,
  Sun,
  Moon,
  Coffee,
  Type,
  Plus,
  Minus,
  SlidersHorizontal,
  X,
  Eye,
  Maximize2,
  MessageSquare,
  Send
} from 'lucide-react';
import { Article } from '../types';
import { calculateReadingTime } from '../lib/readingTime';
import { DmlStore } from '../lib/store';

interface ArticleDetailPageProps {
  article: Article;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  relatedArticles: Article[];
  onOpenCorrection: (article: Article) => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark';
type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';
type ReaderFontFamily = 'serif' | 'sans';

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  article,
  onBack,
  onSelectArticle,
  relatedArticles,
  onOpenCorrection,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [likeCount, setLikeCount] = useState(article.views > 0 ? Math.floor(article.views / 12) + 7 : 12);
  const estReadingTime = calculateReadingTime(article.content, article.summary, 200);

  // Reading Mode States
  const [showReadingControls, setShowReadingControls] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<ReaderFontSize>('md');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('serif');

  // Reading progress tracking (0 to 100%)
  const [readingProgress, setReadingProgress] = useState(0);

  // Lightbox full-size photo preview
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    url: string;
    caption?: string;
    attribution?: string;
  } | null>(null);

  useEffect(() => {
    DmlStore.incrementArticleViews(article.id);
  }, [article.id]);

  // Comments state
  const [comments, setComments] = useState(() => DmlStore.getCommentsForArticle(article.id));
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    setComments(DmlStore.getCommentsForArticle(article.id));
    DmlStore.refreshCommentsFromCloud(article.id).catch(() => {});
    const unsubscribe = DmlStore.subscribe(() => {
      setComments(DmlStore.getCommentsForArticle(article.id));
    });
    return unsubscribe;
  }, [article.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentSubmitting) return;
    setCommentSubmitting(true);
    setCommentFeedback(null);

    const res = await DmlStore.addComment(article.id, {
      authorName: commentName,
      authorEmail: commentEmail,
      content: commentContent,
    });

    if (res.success) {
      setCommentFeedback({ success: true, text: 'Komentar berhasil dikirim dan ditayangkan!' });
      setCommentContent('');
      setCommentName('');
      setCommentEmail('');
    } else {
      setCommentFeedback({ success: false, text: res.error || 'Gagal mengirim komentar.' });
    }
    setCommentSubmitting(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const articleEl = document.getElementById('dml-article-content');
      if (!articleEl) {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (totalHeight > 0) {
          const pct = Math.min(100, Math.max(0, (winScroll / totalHeight) * 100));
          setReadingProgress(pct);
        }
        return;
      }

      const rect = articleEl.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const articleHeight = rect.height;
      const currentScroll = window.scrollY;

      // When above the article start
      if (currentScroll < articleTop - 100) {
        setReadingProgress(0);
        return;
      }

      const scrolledDistance = currentScroll - (articleTop - 100);
      const totalDistance = Math.max(200, articleHeight - (window.innerHeight * 0.4));
      const pct = Math.min(100, Math.max(0, (scrolledDistance / totalDistance) * 100));
      setReadingProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [article.id]);

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Dalam Kurasi Redaksi';

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = `${article.title} — Baca di Rumah Dessa Mentari`;

    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to copy
      }
    }

    if (platform === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n\n' + url)}`;
      window.open(waUrl, '_blank');
    } else if (platform === 'instagram') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setShowInstagramModal(true);
    } else if (platform === 'twitter') {
      const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twUrl, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLike = async () => {
    const res = await DmlStore.likeArticle(article.id);
    if (res.success) {
      setLiked(prev => !prev);
      setLikeCount(res.likes);
    }
  };

  const increaseFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xl') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('md');
    else if (fontSize === 'md') setFontSize('sm');
  };

  // Theme styling presets
  const themeClasses = {
    light: {
      wrapper: 'bg-white text-slate-800',
      headerBar: 'border-slate-200 bg-slate-50/90 text-slate-800',
      heading: 'text-slate-900',
      subheading: 'text-slate-800',
      lead: 'text-slate-600 border-amber-500 bg-amber-50/50',
      bodyText: 'text-slate-700',
      border: 'border-slate-200',
      cardBg: 'bg-slate-50',
      authorCardBorder: 'border-slate-100',
      authorName: 'text-slate-900',
      authorBio: 'text-slate-500',
      sourceBox: 'bg-slate-50 border-slate-200 text-slate-600',
      tag: 'bg-slate-100 text-slate-600 hover:bg-amber-50',
      shareBox: 'bg-gradient-to-r from-slate-50 to-amber-50/30 border-slate-200 text-slate-800',
      controlPanel: 'bg-white text-slate-800 border-slate-200 shadow-xl',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    sepia: {
      wrapper: 'bg-[#FBF0D9] text-[#3D2E1E]',
      headerBar: 'border-[#E6D4B8] bg-[#F4E6C9]/95 text-[#3D2E1E]',
      heading: 'text-[#2D1E0E]',
      subheading: 'text-[#3D2E1E]',
      lead: 'text-[#54412F] border-amber-600 bg-[#F4E3BF]',
      bodyText: 'text-[#423223]',
      border: 'border-[#E6D4B8]',
      cardBg: 'bg-[#F4E7CB]',
      authorCardBorder: 'border-[#EAD7BA]',
      authorName: 'text-[#2D1E0E]',
      authorBio: 'text-[#68533F]',
      sourceBox: 'bg-[#F5E9CF] border-[#E5D2B4] text-[#54412F]',
      tag: 'bg-[#EFE0C3] text-[#54412F] hover:bg-amber-200',
      shareBox: 'bg-[#F4E6C7] border-[#E5D2B4] text-[#3D2E1E]',
      controlPanel: 'bg-[#FAF2E2] text-[#3D2E1E] border-[#DECAB0] shadow-xl',
      badge: 'bg-amber-200 text-amber-950 border-amber-300',
    },
    dark: {
      wrapper: 'bg-[#0B1320] text-slate-200',
      headerBar: 'border-slate-800 bg-[#0F1B2E]/95 text-slate-200',
      heading: 'text-white',
      subheading: 'text-slate-100',
      lead: 'text-slate-300 border-amber-500 bg-slate-800/60',
      bodyText: 'text-slate-300',
      border: 'border-slate-800',
      cardBg: 'bg-slate-900',
      authorCardBorder: 'border-slate-800',
      authorName: 'text-white',
      authorBio: 'text-slate-400',
      sourceBox: 'bg-slate-900/80 border-slate-800 text-slate-300',
      tag: 'bg-slate-800 text-slate-300 hover:bg-slate-700',
      shareBox: 'bg-slate-900/90 border-slate-800 text-slate-200',
      controlPanel: 'bg-[#132035] text-slate-100 border-slate-700 shadow-2xl',
      badge: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    },
  }[theme];

  // Font size classes
  const fontSizes = {
    sm: 'text-sm sm:text-base leading-relaxed',
    md: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-relaxed',
  }[fontSize];

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-200 ${themeClasses.wrapper}`}>
      {/* Thin, Fixed Reading Progress Bar at the top of the viewport */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-[3.5px] bg-slate-200/50 backdrop-blur-xs pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(readingProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`Kemajuan membaca: ${Math.round(readingProgress)}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 transition-all duration-100 ease-out shadow-xs"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Reading Bar & Controls */}
      <div className={`border-b sticky top-20 z-30 backdrop-blur-md transition-colors relative ${themeClasses.headerBar}`}>
        {/* Progress bar line along the bottom of the sticky bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/5 dark:bg-white/5 pointer-events-none overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </button>

          {/* Action buttons including Mode Baca */}
          <div className="flex items-center gap-2">
            {/* Mode Baca Trigger Button */}
            <div className="relative">
              <button
                onClick={() => setShowReadingControls(!showReadingControls)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs border ${
                  showReadingControls
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Sesuaikan Mode Baca (Tema & Ukuran Teks)"
              >
                <Type className="w-3.5 h-3.5 text-amber-600" />
                <span>Mode Baca</span>
                {theme === 'dark' && <Moon className="w-3 h-3 text-amber-300" />}
                {theme === 'sepia' && <Coffee className="w-3 h-3 text-amber-700" />}
                {theme === 'light' && <Sun className="w-3 h-3 text-amber-500" />}
              </button>

              {/* Expandable Mode Baca Popover Panel */}
              {showReadingControls && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 border ${themeClasses.controlPanel}`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/40">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Kenyamanan Baca</h4>
                    </div>
                    <button
                      onClick={() => setShowReadingControls(false)}
                      className="p-1 rounded-full hover:opacity-70 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 pt-3">
                    {/* Theme Selector */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                        Warna Latar & Tema:
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setTheme('light')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                            theme === 'light'
                              ? 'bg-white text-slate-900 border-amber-500 shadow-xs ring-1 ring-amber-500'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Terang</span>
                        </button>

                        <button
                          onClick={() => setTheme('sepia')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                            theme === 'sepia'
                              ? 'bg-[#FBF0D9] text-[#3D2E1E] border-amber-600 shadow-xs ring-1 ring-amber-600'
                              : 'bg-[#F5E9CE] text-[#3D2E1E] border-[#DECAB0] hover:bg-[#EEDBB8]'
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sepia</span>
                        </button>

                        <button
                          onClick={() => setTheme('dark')}
                          className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                            theme === 'dark'
                              ? 'bg-slate-900 text-white border-amber-400 shadow-xs ring-1 ring-amber-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-amber-300" />
                          <span>Gelap</span>
                        </button>
                      </div>
                    </div>

                    {/* Font Size Adjuster */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                          Ukuran Teks:
                        </label>
                        <span className="text-[11px] font-bold uppercase text-amber-600">
                          {fontSize === 'sm' && 'Kecil (15px)'}
                          {fontSize === 'md' && 'Standar (17px)'}
                          {fontSize === 'lg' && 'Besar (20px)'}
                          {fontSize === 'xl' && 'Ekstra Besar (23px)'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 p-1 bg-slate-500/10 rounded-xl">
                        <button
                          onClick={decreaseFontSize}
                          disabled={fontSize === 'sm'}
                          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-500/20 text-xs font-bold flex items-center gap-1"
                          title="Perkecil teks"
                        >
                          <Minus className="w-3.5 h-3.5" />
                          <span className="text-xs">A-</span>
                        </button>

                        {/* Visual Step Indicator */}
                        <div className="flex items-center gap-1.5">
                          {(['sm', 'md', 'lg', 'xl'] as ReaderFontSize[]).map(s => (
                            <button
                              key={s}
                              onClick={() => setFontSize(s)}
                              className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all ${
                                fontSize === s
                                  ? 'bg-amber-500 text-slate-950 scale-105'
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              {s === 'sm' ? '1' : s === 'md' ? '2' : s === 'lg' ? '3' : '4'}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={increaseFontSize}
                          disabled={fontSize === 'xl'}
                          className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-slate-500/20 text-xs font-bold flex items-center gap-1"
                          title="Perbesar teks"
                        >
                          <span className="text-xs">A+</span>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Font Family Toggle */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 opacity-80">
                        Gaya Huruf:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFontFamily('serif')}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold font-serif-editorial border transition-all ${
                            fontFamily === 'serif'
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-slate-500/10 border-transparent hover:bg-slate-500/20'
                          }`}
                        >
                          Serif Buku
                        </button>
                        <button
                          onClick={() => setFontFamily('sans')}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold font-sans border transition-all ${
                            fontFamily === 'sans'
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-slate-500/10 border-transparent hover:bg-slate-500/20'
                          }`}
                        >
                          Sans Modern
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                liked
                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{likeCount}</span>
            </button>

            {/* Share button */}
            <button
              onClick={() => handleShare()}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      </div>

      <article id="dml-article-content" className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${themeClasses.badge}`}>
              {article.category}
            </span>
            <span className="text-xs opacity-40">•</span>
            <span className="text-xs opacity-70 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="text-xs opacity-40">•</span>
            <span className="text-xs opacity-70 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {estReadingTime} menit baca
            </span>
          </div>

          <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight ${fontFamily === 'serif' ? 'font-serif-editorial' : 'font-sans'} ${themeClasses.heading}`}>
            {article.title}
          </h1>

          <p className={`text-base sm:text-lg italic leading-relaxed border-l-4 pl-4 py-1.5 rounded-r-lg ${fontFamily === 'serif' ? 'font-serif-editorial' : 'font-sans'} ${themeClasses.lead}`}>
            {article.summary}
          </p>

          {/* Author Card */}
          <div className={`flex items-center justify-between py-4 border-y my-6 ${themeClasses.authorCardBorder}`}>
            <div className="flex items-center gap-3">
              <img
                src={article.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={article.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shadow-xs"
              />
              <div>
                <h4 className={`text-sm font-bold ${themeClasses.authorName}`}>{article.authorName}</h4>
                <p className={`text-xs max-w-sm line-clamp-1 ${themeClasses.authorBio}`}>{article.authorBio}</p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[11px] uppercase tracking-wider opacity-60 font-semibold block">Editorial RDM</span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                Lolos Kurasi Redaksi
              </span>
            </div>
          </div>
        </div>

        {/* Featured Image & Attribution */}
        <div className={`my-8 rounded-2xl overflow-hidden border shadow-sm ${themeClasses.border}`}>
          <div
            className="cursor-zoom-in group relative overflow-hidden"
            onClick={() => setActiveLightboxImage({ url: article.coverImage, caption: article.title, attribution: article.imageAttribution })}
            title="Klik untuk memperbesar foto sampul"
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full max-h-[480px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
              <span className="bg-black/75 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                <Maximize2 className="w-3.5 h-3.5" /> Klik untuk Perbesar Sampul
              </span>
            </div>
          </div>
          {article.imageAttribution && (
            <div className={`px-4 py-2 border-t text-[11px] opacity-75 italic ${themeClasses.border} ${themeClasses.cardBg}`}>
              Sumber foto: {article.imageAttribution}
            </div>
          )}
        </div>

        {/* SPECIAL ETHICAL STANDARDS: Section L */}
        {/* Health Content Notice */}
        {article.category === 'Kesehatan' && (
          <div className="my-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-teal-800">
              <HeartPulse className="w-5 h-5 text-teal-600 shrink-0" />
              <span>Standar Redaksi: Edukasi Kesehatan Berbasis Bukti</span>
            </div>
            <p className="text-xs text-teal-800 leading-relaxed">
              Artikel kesehatan di Rumah Dessa Mentari disusun semata-mata untuk tujuan edukasi dan wawasan umum. Tulisan ini tidak menggantikan konsultasi, diagnosis, maupun pengobatan langsung oleh dokter atau tenaga medis berlisensi.
            </p>
          </div>
        )}

        {/* News / General Info Verification */}
        {article.category === 'Informasi Umum' && (
          <div className="my-6 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-800">
              <Info className="w-5 h-5 text-sky-600 shrink-0" />
              <span>Verifikasi Fakta & Pemisahan Opini Redaksi</span>
            </div>
            <p className="text-xs text-sky-800 leading-relaxed">
              Redaksi Rumah Dessa Mentari menerapkan verifikasi sumber primer untuk seluruh klaim faktual. Opini atau sudut pandang penulis disajikan secara transparan tanpa mengubah esensi peristiwa.
            </p>
          </div>
        )}

        {/* Body Content - formatted with dynamic font size and family */}
        <div
          className={`space-y-6 pt-2 ${fontSizes} ${
            fontFamily === 'serif' ? 'font-serif-editorial' : 'font-sans'
          } ${themeClasses.bodyText}`}
        >
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();

            // Detect markdown images: ![Caption | Attribution](url) or ![Caption](url)
            const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
            if (imgMatch) {
              const rawAlt = imgMatch[1];
              const imgUrl = imgMatch[2];
              const parts = rawAlt.split('|').map(s => s.trim());
              const caption = parts[0] || '';
              const attribution = parts.length > 1 ? parts.slice(1).join(' | ') : '';

              return (
                <figure
                  key={idx}
                  className={`my-8 rounded-2xl overflow-hidden border shadow-xs transition-all ${themeClasses.border} ${themeClasses.cardBg}`}
                >
                  <div
                    className="cursor-zoom-in group relative overflow-hidden"
                    onClick={() => setActiveLightboxImage({ url: imgUrl, caption, attribution })}
                    title="Klik untuk memperbesar foto artikel"
                  >
                    <img
                      src={imgUrl}
                      alt={caption || 'Foto artikel'}
                      className="w-full max-h-[520px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="bg-black/75 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                        <Eye className="w-3.5 h-3.5" /> Klik untuk Perbesar Foto
                      </span>
                    </div>
                  </div>
                  {(caption || attribution) && (
                    <figcaption
                      className={`px-4 py-3 border-t text-xs leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${themeClasses.border}`}
                    >
                      {caption && <span className="font-medium opacity-90">{caption}</span>}
                      {attribution && (
                        <span className="text-[11px] italic opacity-60 sm:text-right shrink-0">
                          Sumber foto: {attribution}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              );
            }

            if (trimmed.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className={`text-xl sm:text-2xl font-bold pt-4 pb-1 ${
                    fontFamily === 'serif' ? 'font-serif-editorial' : 'font-sans'
                  } ${themeClasses.subheading}`}
                >
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }

            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n- ');
              return (
                <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2">
                  {items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Sources & Citations */}
        {article.sources && article.sources.length > 0 && (
          <div className={`mt-10 p-5 rounded-xl border ${themeClasses.sourceBox}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 opacity-90">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Sumber Rujukan & Referensi
            </h4>
            <ul className="space-y-1 text-xs opacity-85">
              {article.sources.map((src, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{src}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className={`mt-8 pt-6 border-t flex flex-wrap items-center gap-2 ${themeClasses.authorCardBorder}`}>
            <span className="text-xs opacity-60 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Tagar:
            </span>
            {article.tags.map(tag => (
              <span
                key={tag}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${themeClasses.tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share Section with Direct Shareable Link */}
        <div className={`mt-10 p-6 rounded-2xl border flex flex-col gap-4 ${themeClasses.shareBox}`}>
          <div className="space-y-1 text-center sm:text-left">
            <h4 className={`text-sm font-bold ${themeClasses.heading}`}>Sukai & Bagikan Tautan Tulisan Ini</h4>
            <p className="text-xs opacity-75">Salin tautan atau bagikan instan ke WhatsApp dan Instagram.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="flex-1 flex items-center gap-2 w-full">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="w-full text-xs px-3 py-2.5 rounded-xl border bg-white/90 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 select-all font-mono"
              />
              <button
                onClick={() => handleShare()}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 flex-wrap">
              <button
                onClick={() => handleShare('whatsapp')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                WhatsApp
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                Instagram
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                X (Twitter)
              </button>
            </div>
          </div>
        </div>

        {/* Instagram Share Guidance Modal */}
        {showInstagramModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setShowInstagramModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    IG
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Bagikan ke Instagram</h3>
                </div>
                <button
                  onClick={() => setShowInstagramModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800">
                  Tautan artikel telah disalin secara otomatis ke clipboard Anda!
                </p>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 space-y-1.5">
                  <p className="font-bold text-purple-900">Cara Berbagi di Instagram:</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-800">
                    <li>Tempel (Paste) tautan ini di <strong>Instagram Story</strong> Anda menggunakan sticker Tautan.</li>
                    <li>Atau bagikan ke Bio profil / pesan langsung (DM) rekan Anda.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    window.open('https://instagram.com', '_blank');
                    setShowInstagramModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold shadow-xs"
                >
                  Buka Instagram
                </button>
                <button
                  onClick={() => setShowInstagramModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Section */}
        <section className={`mt-12 p-6 sm:p-8 rounded-2xl border space-y-6 ${themeClasses.border} ${themeClasses.cardBg}`}>
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <h3 className={`font-serif-editorial text-lg font-bold ${themeClasses.heading}`}>
                Kolom Diskusi & Komentar ({comments.length})
              </h3>
            </div>
            <span className="text-xs opacity-60">Etika & Diskusi Bermartabat RDM</span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${themeClasses.heading}`}>
              Tulis Tanggapan atau Pertanyaan Anda
            </h4>

            {commentFeedback && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                commentFeedback.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {commentFeedback.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  placeholder="cth. Budi Santoso"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border bg-white border-slate-300 text-slate-800 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                  Email (Opsional, tidak dipublikasikan)
                </label>
                <input
                  type="email"
                  value={commentEmail}
                  onChange={e => setCommentEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border bg-white border-slate-300 text-slate-800 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
                Pesan / Komentar *
              </label>
              <textarea
                rows={3}
                required
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder="Bagikan pandangan konstruktif, apresiasi, atau pertanyaan mengenai isi artikel ini..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border bg-white border-slate-300 text-slate-800 focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{commentSubmitting ? 'Mengirim...' : 'Kirim Komentar'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-4 border-t">
            {comments.length === 0 ? (
              <p className="text-xs opacity-60 text-center py-6">
                Belum ada komentar pada artikel ini. Jadilah yang pertama memberikan tanggapan!
              </p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={c.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-amber-500/30"
                      />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.authorName}</h5>
                        <span className="text-[10px] opacity-60">
                          {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} pukul {new Date(c.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Report / Correction Box */}
        <div className="mt-8 text-center sm:text-right">
          <button
            onClick={() => onOpenCorrection(article)}
            className="inline-flex items-center gap-1.5 text-xs opacity-70 hover:opacity-100 hover:text-amber-600 underline underline-offset-4 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Menemukan kekeliruan data atau pelanggaran hak cipta? Ajukan Koreksi</span>
          </button>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className={`border-t py-12 transition-colors ${themeClasses.cardBg} ${themeClasses.border}`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h3 className={`font-serif-editorial text-xl font-bold mb-6 ${themeClasses.heading}`}>
              Artikel Terkait di Rubrik {article.category}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.slice(0, 2).map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectArticle(item)}
                  className={`p-4 rounded-xl border hover:border-amber-400 cursor-pointer shadow-2xs hover:shadow-sm transition-all flex gap-3 ${
                    theme === 'dark'
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : theme === 'sepia'
                      ? 'bg-[#FBF0D9] border-[#E6D4B8] text-[#3D2E1E]'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">{item.category}</span>
                    <h4 className="font-serif-editorial text-sm font-bold line-clamp-2 hover:text-amber-600">
                      {item.title}
                    </h4>
                    <p className="text-[11px] opacity-70">
                      {calculateReadingTime(item.content, item.summary, 200)} menit baca
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox / Fullscreen Image Preview Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-w-4xl w-full max-h-[92vh] flex flex-col items-center bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-white text-xs">
              <span className="font-medium truncate max-w-[80%]">
                {activeLightboxImage.caption || 'Penampil Foto Artikel'}
              </span>
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tutup (Klik latar belakang)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center p-2 bg-black/60">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.caption || 'Foto artikel diperbesar'}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            {(activeLightboxImage.caption || activeLightboxImage.attribution) && (
              <div className="w-full px-5 py-3 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                {activeLightboxImage.caption && (
                  <p className="font-medium text-slate-200">{activeLightboxImage.caption}</p>
                )}
                {activeLightboxImage.attribution && (
                  <p className="text-[11px] text-slate-400 italic">
                    Sumber / Atribusi: {activeLightboxImage.attribution}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
