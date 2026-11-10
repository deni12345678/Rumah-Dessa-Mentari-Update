import React from 'react';
import {
  HeartHandshake,
  GraduationCap,
  Store,
  Trophy,
  HeartPulse,
  Lightbulb,
  Info,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ArticleCategory } from '../types';

interface CategoryGridProps {
  onSelectCategory: (cat: ArticleCategory) => void;
  articleCounts?: Record<string, number>;
}

interface CategoryCardInfo {
  name: ArticleCategory;
  desc: string;
  icon: React.ReactNode;
  accentColor: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectCategory,
  articleCounts = {},
}) => {
  const categories: CategoryCardInfo[] = [
    {
      name: 'Kisah Inspiratif',
      desc: 'Catatan perjalanan, perjuangan hidup, keteladanan, dan ketulusan berbuat untuk sesama.',
      icon: <HeartHandshake className="w-6 h-6" />,
      accentColor: 'from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200',
    },
    {
      name: 'Pendidikan',
      desc: 'Dinamika ruang kelas, pedagogi ramah anak, wawasan guru, dan pembiasaan literasi.',
      icon: <GraduationCap className="w-6 h-6" />,
      accentColor: 'from-blue-500/20 to-indigo-500/20 text-blue-700 border-blue-200',
    },
    {
      name: 'Ekonomi dan UMKM',
      desc: 'Kisah pelaku usaha rakyat, produk lokal berdaya saing, inovasi kriya, dan kemandirian.',
      icon: <Store className="w-6 h-6" />,
      accentColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Olahraga',
      desc: 'Semangat sportivitas, disiplin latihan, filosofi ketahanan, dan gaya hidup aktif.',
      icon: <Trophy className="w-6 h-6" />,
      accentColor: 'from-red-500/20 to-rose-500/20 text-red-700 border-red-200',
    },
    {
      name: 'Kesehatan',
      desc: 'Informasi gaya hidup sehat berbasis bukti ilmiah dan pemeliharaan kesehatan mental.',
      icon: <HeartPulse className="w-6 h-6" />,
      accentColor: 'from-teal-500/20 to-cyan-500/20 text-teal-700 border-teal-200',
    },
    {
      name: 'Opini dan Gagasan',
      desc: 'Ruang dialektika kritis, pertukaran pemikiran bernas, dan analisis sosial konstruktif.',
      icon: <Lightbulb className="w-6 h-6" />,
      accentColor: 'from-purple-500/20 to-violet-500/20 text-purple-700 border-purple-200',
    },
    {
      name: 'Informasi Umum',
      desc: 'Klarifikasi fakta, ringkasan peristiwa kontekstual, dan pemisahan berita dari disinformasi.',
      icon: <Info className="w-6 h-6" />,
      accentColor: 'from-sky-500/20 to-blue-500/20 text-sky-700 border-sky-200',
    },
    {
      name: 'Literasi dan Buku',
      desc: 'Dunia kepengarangan, bedah buku, teknik penyuntingan, dan peradaban teks bertutur.',
      icon: <BookOpen className="w-6 h-6" />,
      accentColor: 'from-amber-600/20 to-amber-700/20 text-amber-900 border-amber-300',
    },
  ];

  return (
    <section className="py-16 bg-[#FAF8F5] border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-widest">
            Kanal & Rubrik Redaksi
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
            Jelajahi Berdasarkan Kluster Pemikiran
          </h2>
          <p className="text-sm text-slate-600">
            Temukan tulisan bermakna dari berbagai sudut pandang kehidupan bermasyarakat dan wawasan literasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map(cat => {
            const count = articleCounts[cat.name] || 0;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className="group text-left bg-white rounded-2xl p-5 border border-stone-200/90 hover:border-amber-500/70 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.accentColor} mb-4 transition-transform group-hover:scale-105`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="font-serif-editorial font-bold text-slate-900 text-lg group-hover:text-amber-900 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-amber-800">
                  <span>{count > 0 ? `${count} Naskah` : 'Terkurasi'}</span>
                  <span className="flex items-center gap-1 font-bold">
                    Buka Rubrik <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
