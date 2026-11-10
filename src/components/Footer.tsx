import React from 'react';
import { BrandLogo } from './BrandLogo';
import { BookOpen, Mail, MapPin, Phone, ShieldCheck, Heart, Sparkles, Share2 } from 'lucide-react';
import { DmlStore } from '../lib/store';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
  whatsappNumber?: string;
  contactEmail?: string;
  onOpenShare?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenShare,
}) => {
  const settings = DmlStore.getSettings();
  const contactEmail = settings.contactEmail || 'dessamentarilangit@gmail.com';
  const whatsappNumber = settings.whatsappNumber || '6287879069404';
  const officeLocation = settings.officeLocation || 'Karawang & Bekasi, Indonesia';

  return (
    <footer className="bg-gradient-to-br from-slate-100 via-amber-50/60 to-orange-50/40 text-slate-800 border-t border-amber-200/60">
      {/* Top Editorial Promise Stripe */}
      <div className="border-b border-amber-200/40 py-12 px-6 lg:px-8 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-slate-900 font-serif-editorial text-xl font-bold">Inspirasi untuk Semua, Karya untuk Dunia</h4>
              <p className="text-sm text-slate-600 max-w-2xl mt-1">
                Rumah Dessa Mentari menyatukan suara penulis, akademisi, dan pegiat literasi dalam wadah yang berintegritas.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="px-5 py-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all whitespace-nowrap flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Link & QR</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('pedoman-penulisan')}
              className="px-6 py-3 text-xs font-bold rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 transition-all whitespace-nowrap shadow-xs cursor-pointer"
            >
              Kode Etik Redaksi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <BrandLogo size="md" lightMode={false} showSlogan={true} />
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Platform digital yang menjadi ruang berbagi inspirasi, pengetahuan, dan karya tulis masyarakat. Menggabungkan media artikel dengan layanan profesional penerbitan buku.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-4 h-4 text-amber-600" />
                <a href={`mailto:${contactEmail}`} className="hover:text-amber-800 transition-colors font-medium">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-slate-700">WA: +{whatsappNumber}</span>
              </div>
            </div>
          </div>

          {/* Kolom Kategori Media */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs tracking-[0.1em] uppercase mb-6">
              Publikasi
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><button onClick={() => onNavigate('artikel', 'Kisah Inspiratif')} className="hover:text-amber-800 transition-colors cursor-pointer">Inspirasi</button></li>
              <li><button onClick={() => onNavigate('artikel', 'Pendidikan')} className="hover:text-amber-800 transition-colors cursor-pointer">Pendidikan</button></li>
              <li><button onClick={() => onNavigate('artikel', 'Opini dan Gagasan')} className="hover:text-amber-800 transition-colors cursor-pointer">Opini</button></li>
              <li><button onClick={() => onNavigate('artikel', 'Literasi dan Buku')} className="hover:text-amber-800 transition-colors cursor-pointer">Literasi</button></li>
            </ul>
          </div>

          {/* Kolom Layanan & Buku */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs tracking-[0.1em] uppercase mb-6">
              Layanan
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><button onClick={() => onNavigate('layanan')} className="hover:text-amber-800 transition-colors cursor-pointer">Penulisan Buku</button></li>
              <li><button onClick={() => onNavigate('layanan')} className="hover:text-amber-800 transition-colors cursor-pointer">Penyuntingan</button></li>
              <li><button onClick={() => onNavigate('penerbitan')} className="hover:text-amber-800 transition-colors cursor-pointer">Penerbitan</button></li>
              <li><button onClick={() => onNavigate('penerbitan')} className="hover:text-amber-800 transition-colors cursor-pointer">Katalog Naskah</button></li>
            </ul>
          </div>

          {/* Kolom Kebijakan & Pedoman Etika */}
          <div>
            <h4 className="text-slate-900 font-bold text-xs tracking-[0.1em] uppercase mb-6">
              Hukum
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><button onClick={() => onNavigate('kebijakan-privasi')} className="hover:text-amber-800 transition-colors cursor-pointer">Privasi</button></li>
              <li><button onClick={() => onNavigate('ketentuan-penggunaan')} className="hover:text-amber-800 transition-colors cursor-pointer">Ketentuan</button></li>
              <li><button onClick={() => onNavigate('hak-cipta-dan-koreksi')} className="hover:text-amber-800 transition-colors cursor-pointer">Hak Cipta</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-amber-200/60 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-slate-900 font-bold text-sm tracking-widest uppercase">DML Digital Solution</span>
              <span className="text-amber-700 text-[10px] font-bold uppercase tracking-[0.3em]">Digital Innovation & Technology</span>
            </div>
            
            <div className="flex items-center gap-6 text-[11px] font-medium text-slate-600 tracking-wider uppercase">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Integritas Literasi
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span>Karawang & Bekasi, ID</span>
            </div>
          </div>

          <div className="pt-6 border-t border-amber-200/30 flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-slate-500 gap-4 tracking-widest uppercase">
            <p>© 2026 DML Digital Solution. All Rights Reserved. Developed for Rumah Dessa Mentari.</p>
            <p>v2.5.0 Production Ready</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
