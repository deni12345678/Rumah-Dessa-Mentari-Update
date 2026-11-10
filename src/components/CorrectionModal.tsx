import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert, Send } from 'lucide-react';
import { Article, CorrectionReport } from '../types';
import { DmlStore } from '../lib/store';

interface CorrectionModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  article,
  isOpen,
  onClose,
}) => {
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [issueType, setIssueType] = useState<CorrectionReport['issueType']>('fakta_keliru');
  const [description, setDescription] = useState('');
  const [sourceEvidence, setSourceEvidence] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !article) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await DmlStore.submitCorrection({
        articleId: article.id,
        articleTitle: article.title,
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
        issueType,
        description: description.trim(),
        sourceEvidence: sourceEvidence.trim() || undefined,
      });
      if (!res.success) {
        alert(res.error || 'Gagal mengirim laporan ralat.');
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-left space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Hak Jawab & Integritas Publikasi</span>
          </div>
          <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
            Formulir Koreksi & Klarifikasi Data
          </h2>
          <p className="text-xs text-slate-500">
            Artikel: <strong className="text-slate-800 line-clamp-1">"{article.title}"</strong>
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-serif-editorial text-lg font-bold text-emerald-950">
              Laporan Koreksi Diterima
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Terima kasih telah membantu menjaga akurasi jurnalistik Rumah Dessa Mentari. Editor kami akan menelaah laporan ini.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Kontak *
                </label>
                <input
                  type="email"
                  required
                  value={reporterEmail}
                  onChange={e => setReporterEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kategori Masalah *
              </label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 bg-white"
              >
                <option value="fakta_keliru">Kekeliruan Fakta / Data / Tanggal</option>
                <option value="hak_cipta">Pelanggaran Hak Cipta Gambar / Teks</option>
                <option value="kesalahan_bahasa">Kesalahan Fatal Tata Bahasa / Makna</option>
                <option value="sumber_tidak_valid">Sumber / Rujukan Tidak Valid</option>
                <option value="lainnya">Masalah Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Uraian Bagian yang Keliru & Usulan Perbaikan *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jelaskan secara spesifik paragraf atau data yang keliru dan apa data yang seharusnya..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tautan Bukti Pembanding / Rujukan Sah (Opsional)
              </label>
              <input
                type="text"
                value={sourceEvidence}
                onChange={e => setSourceEvidence(e.target.value)}
                placeholder="https://... atau rujukan rilis resmi"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all ${
                  isSubmitting
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirimkan Koreksi ke Redaksi'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
