import React from 'react';
import { BookOpen, Compass, Edit3, ArrowRight, Sparkles, Feather, Share2 } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  onOpenShare?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, onOpenAuth, isLoggedIn, onOpenShare }) => {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-slate-100 text-slate-900">
      {/* Subtle Background Decoration / Image */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img
          src="/src/assets/images/hero_inspiration_background_1793840300792.jpg"
          alt="Inspirasi Rumah Dessa Mentari"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full py-20 lg:py-32">
        <div className="max-w-3xl space-y-10">
          {/* Editorial Kicker */}
          <div className="flex items-center gap-3 text-xs font-bold text-amber-800 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-700">
            <span>RUMAH DESSA MENTARI</span>
            <span aria-hidden="true" className="w-8 h-[1px] bg-amber-600/40" />
            <span className="font-medium text-slate-700">Jurnal Literasi & Penerbitan</span>
          </div>

          {/* Official Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-editorial font-bold tracking-tight leading-[1.1] text-balance text-slate-900 animate-in fade-in slide-in-from-left-6 duration-1000 delay-100">
              “Inspirasi untuk Semua,{' '}
              <span className="text-amber-700 underline decoration-amber-400/50 decoration-wavy decoration-2">
                Karya untuk Dunia.
              </span>”
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-700 font-normal leading-relaxed max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
              Setiap pengalaman menyimpan hikmah. Setiap pemikiran memiliki daya ubah. Mari berbagi kisah inspiratif, opini bernas, dan menerbitkan karya yang abadi.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <button
              onClick={() => onNavigate('artikel', 'Semua')}
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-3 active:scale-95"
            >
              <Compass className="w-5 h-5" />
              <span>Jelajahi Artikel</span>
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) {
                  onNavigate('dashboard-kontributor', 'tulis');
                } else {
                  onOpenAuth();
                }
              }}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 shadow-md border border-slate-200 font-bold text-sm transition-all flex items-center gap-3 active:scale-95"
            >
              <Edit3 className="w-5 h-5 text-amber-600" />
              <span>Kirim Naskah</span>
            </button>

            <button
              onClick={() => onNavigate('layanan')}
              className="px-8 py-4 rounded-xl bg-amber-100/70 hover:bg-amber-200 text-amber-900 font-bold text-sm transition-all flex items-center gap-3"
            >
              <span>Layanan Penulisan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="px-6 py-4 rounded-xl bg-white/80 hover:bg-white text-amber-900 border border-amber-300 font-bold text-sm transition-all flex items-center gap-2.5 shadow-sm"
                title="Bagikan tautan resmi berlogo"
              >
                <Share2 className="w-4 h-4 text-amber-600" />
                <span>Bagikan Link Berlogo</span>
              </button>
            )}
          </div>

          {/* Statistics Strip */}
          <div className="pt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left border-t border-slate-200/80 animate-in fade-in duration-1000 delay-500">
            <div className="space-y-1">
              <span className="text-amber-700 font-serif-editorial font-bold text-3xl tabular-nums">08</span>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Rubrik Konten</p>
            </div>

            <div className="space-y-1">
              <span className="text-amber-700 font-serif-editorial font-bold text-3xl tabular-nums">100%</span>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Akurasi Literasi</p>
            </div>

            <div className="space-y-1">
              <span className="text-amber-700 font-serif-editorial font-bold text-3xl tabular-nums">06</span>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Layanan Buku</p>
            </div>

            <div className="space-y-1">
              <span className="text-amber-700 font-serif-editorial font-bold text-3xl tabular-nums">∞</span>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Inspirasi Abadi</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
