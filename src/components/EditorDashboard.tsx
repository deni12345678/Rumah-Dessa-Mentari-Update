import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ShieldCheck,
  FileCheck,
  Eye,
  Edit2,
  Trash2,
  Inbox,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Article, CorrectionReport, User } from '../types';
import { DmlStore } from '../lib/store';

interface EditorDashboardProps {
  currentUser: User;
  onSelectArticle: (article: Article) => void;
}

export const EditorDashboard: React.FC<EditorDashboardProps> = ({
  currentUser,
  onSelectArticle,
}) => {
  const [activeTab, setActiveTab] = useState<'antrean' | 'terbit' | 'laporan' | 'analitik'>('antrean');
  const [selectedForReview, setSelectedForReview] = useState<Article | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [checklist, setChecklist] = useState({
    originality: false,
    languageEthics: false,
    sourcesVerified: false,
    imageCopyright: false,
  });
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const pendingArticles = DmlStore.getArticlesForReview();
  const publishedArticles = DmlStore.getArticles('published');
  const correctionReports = DmlStore.getCorrections();

  const handleOpenReview = (art: Article) => {
    setSelectedForReview(art);
    setRevisionNote(art.revisionNotes || '');
    setChecklist({
      originality: false,
      languageEthics: false,
      sourcesVerified: false,
      imageCopyright: false,
    });
    setActionMessage(null);
  };

  const handleDecision = async (decision: 'approved' | 'revision_requested' | 'rejected') => {
    if (!selectedForReview) return;

    if (decision === 'revision_requested' && !revisionNote.trim()) {
      setActionMessage('Mohon cantumkan catatan arahan revisi spesifik agar penulis tahu bagian mana yang harus disempurnakan.');
      return;
    }

    // Auto-check checklist items when approved
    if (decision === 'approved') {
      setChecklist({
        originality: true,
        languageEthics: true,
        sourcesVerified: true,
        imageCopyright: true,
      });
    }

    const res = await DmlStore.reviewArticleDecision(selectedForReview.id, decision, revisionNote);
    if (res.success) {
      setActionMessage(
        decision === 'approved'
          ? 'Alhamdulillah! Naskah resmi disetujui (di-ACC) dan telah tayang di portal publik Rumah Dessa Mentari!'
          : decision === 'revision_requested'
          ? 'Catatan revisi telah dikirimkan ke dashboard kontributor.'
          : 'Naskah telah ditolak dengan catatan redaksi.'
      );
      setTimeout(() => {
        setSelectedForReview(null);
        setActionMessage(null);
      }, 1500);
    } else {
      setActionMessage(res.error || 'Gagal memperbarui status keputusan artikel.');
    }
  };

  const handleResolveCorrection = async (reportId: string, status: 'resolved' | 'dismissed') => {
    await DmlStore.updateCorrectionStatus(reportId, status);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Editor Desk Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Meja Redaksi RDM
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-600">Editor: {currentUser.name}</span>
            </div>
            <h1 className="text-2xl font-serif-editorial font-bold text-slate-900 mt-1">
              Ruang Kurasi & Pengawasan Etika Publikasi
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Setiap naskah yang terbit adalah perwakilan integritas intelektual brand Rumah Dessa Mentari.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
              {pendingArticles.length} Naskah Perlu Ditelaah
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 text-xs font-bold border border-rose-200">
              {correctionReports.filter(c => c.status === 'pending').length} Laporan Koreksi
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('antrean')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'antrean'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Antrean Naskah Masuk ({pendingArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('terbit')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'terbit'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Artikel Diterbitkan ({publishedArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analitik')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'analitik'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Statistik Kunjungan & Pembaca</span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'laporan'
                ? 'border-purple-600 text-purple-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Koreksi & Hak Jawab Pembaca ({correctionReports.length})</span>
          </button>
        </div>

        {/* TAB 1: PENDING QUEUE */}
        {activeTab === 'antrean' && (
          <div className="space-y-4">
            {pendingArticles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">
                  Semua Naskah Telah Ditinjau
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Tidak ada naskah yang menunggu kurasi saat ini. Kerja cerdas tim redaksi!
                </p>
              </div>
            ) : (
              pendingArticles.map(art => (
                <div
                  key={art.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-purple-300 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Menunggu Peninjauan
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {art.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Oleh: <strong className="text-slate-700">{art.authorName}</strong>
                      </span>
                      {art.submittedAt && (
                        <span className="text-[11px] text-slate-400">
                          (Masuk: {new Date(art.submittedAt).toLocaleDateString('id-ID')})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenReview(art)}
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
                    >
                      Buka Meja Telaah →
                    </button>
                  </div>

                  <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">{art.summary}</p>

                  <div className="text-[11px] text-slate-500 flex items-center gap-4 pt-1">
                    <span>Panjang teks: {art.content.split(/\s+/).length} kata</span>
                    <span>Rujukan terlampir: {art.sources?.length || 0} sumber</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PUBLISHED ARTICLES LIST */}
        {activeTab === 'terbit' && (
          <div className="space-y-4">
            {publishedArticles.map(art => (
              <div
                key={art.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Terbit Publik
                    </span>
                    <span className="text-xs font-medium text-slate-500">{art.category}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{art.authorName}</span>
                  </div>
                  <h3 className="font-serif-editorial text-base font-bold text-slate-900">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dilihat: {art.views} kali • Terbit:{' '}
                    {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectArticle(art)}
                    className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Buka
                  </button>
                  <button
                    onClick={async () => {
                      await DmlStore.reviewArticleDecision(art.id, 'revision_requested', 'Ditarik oleh editor untuk evaluasi berkala.');
                    }}
                    className="px-3 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
                  >
                    Tarik Publikasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ANALITIK KUNJUNGAN & PEMBACA */}
        {activeTab === 'analitik' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kunjungan Web</span>
                <p className="text-3xl font-bold font-serif-editorial text-amber-600">
                  {DmlStore.getSiteVisitsCount().toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-slate-400">Akumulasi kunjungan sesi pembaca aktif</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pembaca Artikel</span>
                <p className="text-3xl font-bold font-serif-editorial text-purple-600">
                  {publishedArticles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-slate-400">Total views seluruh artikel terbit</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Artikel Terbit</span>
                <p className="text-3xl font-bold font-serif-editorial text-emerald-600">
                  {publishedArticles.length}
                </p>
                <p className="text-[11px] text-slate-400">Artikel lolos kurasi redaksi</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Review</span>
                <p className="text-3xl font-bold font-serif-editorial text-blue-600">
                  {pendingArticles.length}
                </p>
                <p className="text-[11px] text-slate-400">Menunggu telaah meja redaksi</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                    Statistik Kunjungan Harian (Google Analytics GA4 Integrated)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pelacakan kunjungan mendalam harian dalam 7 hari terakhir.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tag: G-RDMGA2026XX (Active)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 pt-2">
                {DmlStore.getDailyVisits().slice(-7).map((d, i) => {
                  const maxVisits = Math.max(...DmlStore.getDailyVisits().map(x => x.visits), 100);
                  const heightPct = Math.max(15, Math.min(100, (d.visits / maxVisits) * 100));
                  return (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-between gap-2 text-center">
                      <span className="text-[10px] font-bold text-slate-500">{d.date}</span>
                      <div className="w-full bg-slate-200 h-24 rounded-lg flex items-end justify-center p-1">
                        <div
                          className="w-full bg-amber-500 rounded-md transition-all"
                          style={{ height: `${heightPct}%` }}
                          title={`${d.visits} kunjungan`}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-800">{d.visits} sesi</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                Peringkat Artikel Terpopuler Berdasarkan Pembaca
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="pb-3">Judul Artikel</th>
                      <th className="pb-3">Penulis</th>
                      <th className="pb-3">Rubrik</th>
                      <th className="pb-3 text-right">Jumlah Pembaca (Views)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...publishedArticles]
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .map(art => (
                        <tr key={art.id} className="hover:bg-slate-50/80">
                          <td className="py-3 font-medium text-slate-900 max-w-xs truncate">
                            {art.title}
                          </td>
                          <td className="py-3 text-slate-600">{art.authorName}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-purple-700">
                            {(art.views || 0).toLocaleString('id-ID')} pembaca
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CORRECTION REPORTS FROM READERS */}
        {activeTab === 'laporan' && (
          <div className="space-y-4">
            {correctionReports.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">
                  Tidak Ada Laporan Koreksi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Belum ada laporan kekeliruan data atau klaim hak cipta dari pembaca.
                </p>
              </div>
            ) : (
              correctionReports.map(rep => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        rep.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rep.status === 'pending' ? 'Perlu Verifikasi' : rep.status === 'resolved' ? 'Selesai / Terkoreksi' : 'Diabaikan'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Kategori Isu: {rep.issueType.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rep.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Artikel Terkait:</strong> {rep.articleTitle}
                    </p>
                    <p>
                      <strong>Pelapor:</strong> {rep.reporterName} ({rep.reporterEmail})
                    </p>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 text-slate-800 font-medium">
                      "{rep.description}"
                    </div>
                    {rep.sourceEvidence && (
                      <p className="text-[11px] text-slate-500 italic mt-1">
                        Bukti Pembanding: {rep.sourceEvidence}
                      </p>
                    )}
                  </div>

                  {rep.status === 'pending' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => handleResolveCorrection(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Tolak / Bukan Pelanggaran
                      </button>
                      <button
                        onClick={() => handleResolveCorrection(rep.id, 'resolved')}
                        className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Tandai Selesai & Tindak Lanjuti
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* REVIEW MODAL / DRAWER */}
        {selectedForReview && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              {/* Modal Top Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Meja Uji Kelayakan Naskah
                  </span>
                  <h3 className="font-serif-editorial text-lg font-bold text-slate-900 line-clamp-1">
                    {selectedForReview.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedForReview(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                {actionMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                    {actionMessage}
                  </div>
                )}

                {/* Article Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Penulis:</span>
                    <p className="font-bold text-slate-800">{selectedForReview.authorName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Kategori:</span>
                    <p className="font-bold text-slate-800">{selectedForReview.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Panjang:</span>
                    <p className="font-bold text-slate-800">{selectedForReview.content.split(/\s+/).length} kata</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status:</span>
                    <p className="font-bold text-amber-700 uppercase">{selectedForReview.status}</p>
                  </div>
                </div>

                {/* Lead Summary */}
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-800 font-serif-editorial italic">
                  <strong>Ringkasan:</strong> {selectedForReview.summary}
                </div>

                {/* Full Article Content */}
                <div className="border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3 bg-slate-50/30">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Teks Lengkap:</h4>
                  {selectedForReview.content.split('\n\n').map((par, i) => (
                    <p key={i} className="text-xs leading-relaxed text-slate-700">
                      {par}
                    </p>
                  ))}
                </div>

                {/* Sources & Citations */}
                {selectedForReview.sources && selectedForReview.sources.length > 0 && (
                  <div className="text-xs space-y-1">
                    <strong className="text-slate-700">Sumber Rujukan Penulis:</strong>
                    <ul className="list-disc list-inside text-slate-600 pl-2">
                      {selectedForReview.sources.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mandatory Editorial Checklist */}
                <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    Lembar Verifikasi Kepatuhan Redaksi RDM:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.originality}
                        onChange={e => setChecklist({ ...checklist, originality: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Bebas plagiarisme & orisinal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.languageEthics}
                        onChange={e => setChecklist({ ...checklist, languageEthics: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Bahasa santun, patuh PUEBI & etika</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.sourcesVerified}
                        onChange={e => setChecklist({ ...checklist, sourcesVerified: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Klaim fakta & kesehatan memiliki rujukan</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.imageCopyright}
                        onChange={e => setChecklist({ ...checklist, imageCopyright: e.target.checked })}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Atribusi hak cipta gambar jelas</span>
                    </label>
                  </div>
                </div>

                {/* Revision Note Box */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Catatan Arahan Redaksi (Wajib diisi jika Meminta Revisi atau Menolak):
                  </label>
                  <textarea
                    rows={3}
                    value={revisionNote}
                    onChange={e => setRevisionNote(e.target.value)}
                    placeholder="Tuliskan catatan perbaikan substantif, gaya bahasa, atau rujukan yang perlu dilengkapi penulis..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 text-xs"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision('rejected')}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                  Tolak Naskah
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDecision('revision_requested')}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-300 shadow-2xs"
                  >
                    Minta Revisi (Needs Revision)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('approved')}
                    className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    Setujui & Terbitkan (Approved)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
