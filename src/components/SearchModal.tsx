import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Article, ArticleCategory } from '../types';
import { CATEGORIES_LIST } from './Header';
import { DmlStore } from '../lib/store';
import { calculateReadingTime } from '../lib/readingTime';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'Semua'>('Semua');

  if (!isOpen) return null;

  const results = DmlStore.getPublishedArticles(selectedCategory, query);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 pb-8 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in slide-in-from-top-4">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-amber-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari artikel, topik wawasan, atau nama penulis..."
            className="w-full text-base font-medium focus:outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="py-3 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'Semua'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Rubrik
          </button>
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="mt-2 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Tidak ditemukan tulisan dengan kata kunci "{query}". Coba gunakan kata kunci lain.
            </div>
          ) : (
            results.map(article => (
              <div
                key={article.id}
                onClick={() => {
                  onSelectArticle(article);
                  onClose();
                }}
                className="py-3 px-2 rounded-xl hover:bg-amber-50/50 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-bold text-amber-700 uppercase">{article.category}</span>
                    <span>•</span>
                    <span>{calculateReadingTime(article.content, article.summary, 200)} menit baca</span>
                    <span>•</span>
                    <span>{article.authorName}</span>
                  </div>
                  <h4 className="font-serif-editorial text-sm font-bold text-slate-900 group-hover:text-amber-800 line-clamp-1">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{article.summary}</p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
