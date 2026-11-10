import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, BookOpen } from 'lucide-react';
import { DmlStore } from '../lib/store';

export const Leaderboard: React.FC = () => {
  const [rankings, setRankings] = useState(DmlStore.getAuthorRankings());

  useEffect(() => {
    const unsub = DmlStore.subscribe(() => {
      setRankings(DmlStore.getAuthorRankings());
    });
    return unsub;
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Ranking Penulis Aktif
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Real-time</span>
        </div>
        <p className="text-sm text-slate-500">Apresiasi bagi kontributor dengan karya terbit terbanyak.</p>
      </div>

      <div className="p-0">
        {rankings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">Belum ada data penulis aktif.</p>
            <p className="text-xs text-slate-400 mt-1">Jadilah kontributor pertama yang menerbitkan karya!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rankings.map((author, index) => (
              <div 
                key={author.authorId} 
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {/* Rank Position */}
                  <div className="w-8 text-center shrink-0">
                    {index === 0 ? (
                      <Medal className="w-6 h-6 text-amber-500 mx-auto" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-slate-400 mx-auto" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-700/60 mx-auto" />
                    ) : (
                      <span className="text-lg font-bold text-slate-300 tabular-nums">{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={author.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} 
                      alt={author.authorName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs group-hover:border-amber-200 transition-all"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-amber-900 transition-colors">{author.authorName}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Kontributor</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-slate-900 font-bold">
                    <span className="text-lg tabular-nums">{author.count}</span>
                    <BookOpen className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Artikel Terbit</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Mari Menulis & Menginspirasi Dunia</span>
        </div>
        <TrendingUp className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
};
