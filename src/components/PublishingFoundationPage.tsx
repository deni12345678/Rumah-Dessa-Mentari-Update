import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  Layers,
  Send,
  CheckCircle,
  FileText,
  Calendar,
  Users
} from 'lucide-react';
import { BookCatalogItem } from '../types';
import { DmlStore } from '../lib/store';

export const PublishingFoundationPage: React.FC = () => {
  const [books, setBooks] = useState<BookCatalogItem[]>(() => DmlStore.getBooks());
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    setBooks(DmlStore.getBooks());
    DmlStore.refreshBooksFromCloud().catch(() => {});
    const unsub = DmlStore.subscribe(() => {
      setBooks(DmlStore.getBooks());
      setForceUpdate(n => n + 1);
    });
    return unsub;
  }, []);

  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [genre, setGenre] = useState('Nonfiksi Populer');
  const [estimatedPages, setEstimatedPages] = useState('150');
  const [synopsis, setSynopsis] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    DmlStore.addBookProposal({
      title: bookTitle.trim(),
      author: authorName.trim(),
      synopsis: synopsis.trim(),
      genre,
      estimatedPages: parseInt(estimatedPages, 10) || 120,
      targetAudience: targetAudience.trim() || 'Masyarakat umum',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    });
    setSubmitted(true);
  };

  const getStatusBadge = (status: BookCatalogItem['status']) => {
    switch (status) {
      case 'koleksi_kurasi':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            Koleksi Terbitan Perdana
          </span>
        );
      case 'segera_terbit':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
            Segera Hadir
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Tahap Pembinaan Naskah
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Foundation Hero */}
        <div className="bg-gradient-to-br from-[#0F1E36] to-[#1E3A5F] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-amber-400/30">
              Fondasi Masa Depan Penerbitan
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-editorial font-bold leading-tight">
              Membangun Rumah bagi Karya yang Memperkaya Peradaban
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Rumah Dessa Mentari mempersiapkan ekosistem penerbitan buku yang terstruktur, akuntabel, dan mengutamakan mutu kurasi sastra serta literasi ilmiah populer.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-amber-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> Kurasi Ketat Beretika
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> Perlindungan Hak Moral Pengarang
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" /> Komitmen Mutu Tipografi & Bahasa
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Showcase */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Showcase Naskah & Buku Terkurasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
              Katalog Naskah Binaan RDM
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Berikut adalah judul-judul naskah yang saat ini berada dalam pendampingan editorial dan persiapan menuju etalase literasi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {books.map(b => (
              <div
                key={b.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">{getStatusBadge(b.status)}</div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {b.genre}
                    </span>
                    <h3 className="font-serif-editorial text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Penulis: <strong className="text-slate-800">{b.author}</strong>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {b.synopsis}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Est. {b.estimatedPages} Halaman</span>
                  <span className="font-semibold text-amber-700">Tahap Pra-Produksi</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manuscript Submission Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Pengajuan Masa Depan
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
                Kirimkan Proposal Naskah Buku Anda
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Punya draf buku utuh atau outline yang siap dikurasi? Masukkan ringkasan proposal Anda untuk diarsipkan dalam bank naskah kurasi penerbitan Rumah Dessa Mentari.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif-editorial text-lg font-bold text-emerald-950">
                  Proposal Naskah Berhasil Diajukan!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Judul "{bookTitle}" telah masuk ke dalam antrean review dewan kurator naskah buku RDM.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs text-emerald-900 font-semibold underline"
                >
                  Ajukan proposal judul naskah lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nama Penulis / Tim Pengarang *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      placeholder="Nama lengkap atau nama pena"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Kontak *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@penulis.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Judul Kerja Naskah Buku *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookTitle}
                      onChange={e => setBookTitle(e.target.value)}
                      placeholder="Contoh: Merajut Asa di Ujung Negeri"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Genre / Klasifikasi Naskah *
                    </label>
                    <select
                      value={genre}
                      onChange={e => setGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs bg-white"
                    >
                      <option value="Nonfiksi Populer">Nonfiksi Populer / Esai</option>
                      <option value="Biografi & Memoar">Biografi & Memoar</option>
                      <option value="Pendidikan & Pedagogi">Pendidikan & Pedagogi</option>
                      <option value="Bisnis, UMKM & Finansial">Bisnis, UMKM & Finansial</option>
                      <option value="Kumpulan Cerpen / Sastra">Kumpulan Cerpen / Sastra</option>
                      <option value="Panduan Praktis (How-to)">Panduan Praktis (How-to)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Estimasi Jumlah Halaman
                    </label>
                    <input
                      type="number"
                      value={estimatedPages}
                      onChange={e => setEstimatedPages(e.target.value)}
                      placeholder="150"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Target Pembaca Sasaran
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={e => setTargetAudience(e.target.value)}
                      placeholder="Contoh: Mahasiswa, guru, dan penggiat sosial"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sinopsis & Keunikan Gagasan (Daftar Isi Rinci) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={synopsis}
                    onChange={e => setSynopsis(e.target.value)}
                    placeholder="Uraikan sinopsis naskah Anda, apa pesan utama yang ingin disampaikan, dan mengapa pembaca membutuhkan buku ini..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors"
                  >
                    Kirimkan Proposal Naskah ke Bank Data Kurasi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
