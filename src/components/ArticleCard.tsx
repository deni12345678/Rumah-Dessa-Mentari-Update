import React from 'react';
import { Clock, User, Calendar, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { Article } from '../types';
import { calculateReadingTime } from '../lib/readingTime';

interface ArticleCardProps {
  article: Article;
  onClick: (article: Article) => void;
  variant?: 'compact' | 'standard' | 'featured';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onClick,
  variant = 'standard',
}) => {
  const estReadingTime = calculateReadingTime(article.content, article.summary, 200);

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Dalam Kurasi';

  if (variant === 'featured') {
    return (
      <div
        onClick={() => onClick(article)}
        className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-amber-500/60 shadow-2xs hover:shadow-lg transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
      >
        <div className="lg:col-span-7 relative h-64 lg:h-auto overflow-hidden bg-stone-100">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-md bg-[#0F1E36]/90 backdrop-blur-xs text-amber-300 shadow-xs">
              Fokus Redaksi · {article.category}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Unboxed Metadata */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span>{formattedDate}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{estReadingTime} min baca</span>
            </div>

            <h3 className="text-xl lg:text-2xl font-serif-editorial font-bold text-slate-900 group-hover:text-amber-900 transition-colors leading-snug">
              {article.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {article.summary}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={article.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                alt={article.authorName}
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">{article.authorName}</p>
                <p className="text-[11px] text-stone-500">Penulis Kontributor</p>
              </div>
            </div>

            <span className="text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Baca Esai →
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      onClick={() => onClick(article)}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-amber-500/60 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#0F1E36]/85 backdrop-blur-xs text-amber-200">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Unboxed inline metadata */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <span>{formattedDate}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{estReadingTime} min baca</span>
          </div>

          <h3 className="font-serif-editorial font-bold text-slate-900 text-lg group-hover:text-amber-900 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={article.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
              alt={article.authorName}
              className="w-6 h-6 rounded-full object-cover border border-stone-200"
            />
            <span className="text-xs font-medium text-slate-800 truncate max-w-[120px] sm:max-w-[140px]">
              {article.authorName}
            </span>
          </div>

          <span className="text-xs font-semibold text-amber-800 group-hover:text-amber-900">
            Baca →
          </span>
        </div>
      </div>
    </article>
  );
};
