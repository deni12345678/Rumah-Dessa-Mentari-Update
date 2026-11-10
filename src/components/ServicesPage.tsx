import React, { useState } from 'react';
import {
  BookOpen,
  FileCheck,
  Feather,
  Layout,
  Compass,
  Send,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DmlStore } from '../lib/store';

interface ServicesPageProps {
  onOpenConsultation?: () => void;
}

interface ServiceDetail {
  id: string;
  title: string;
  shortTag: string;
  icon: React.ReactNode;
  description: string;
  targetAudience: string;
  scopeOfWork: string[];
  workflow: string[];
}

export const ServicesPage: React.FC<ServicesPageProps> = () => {
  const settings = DmlStore.getSettings();

  // Consultation form states
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [serviceType, setServiceType] = useState('Jasa Penulisan Buku (Biografi/Memoar)');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [whatsappUrlGenerated, setWhatsappUrlGenerated] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services: ServiceDetail[] = [
    {
      id: 'penulisan',
      title: 'Jasa Penulisan Buku (Biografi & Gagasan)',
      shortTag: 'Ghostwriting & Biografi',
      icon: <Feather className="w-6 h-6 text-amber-600" />,
      description:
        'Pendampingan menuliskan kisah hidup, rekam jejak perjuangan tokoh, biografi keluarga, atau buku pemikiran profesional dari wawancara mendalam hingga menjadi naskah utuh.',
      targetAudience:
        'Tokoh masyarakat, pendidik, profesional, pengusaha daerah, keluarga yang ingin mengabadikan riwayat leluhur, serta siapa saja yang memiliki gagasan namun terkendala waktu untuk merangkainya menjadi buku.',
      scopeOfWork: [
        'Sesi wawancara terstruktur dan riset dokumen latar belakang',
        'Penyusunan outline tematik dan bab buku',
        'Penulisan draf lengkap bab demi bab dengan gaya bertutur hangat dan berwibawa',
        'Sesi koreksi bersama hingga disetujui pemesan',
      ],
      workflow: [
        '1. Temu awal & penjajakan gagasan',
        '2. Perumusan outline & jadwal wawancara',
        '3. Proses penulisan draf',
        '4. Review dan penyelarasan akhir',
      ],
    },
    {
      id: 'penyuntingan',
      title: 'Jasa Penyuntingan Naskah (Substantif & Mekanis)',
      shortTag: 'Developmental & Copyediting',
      icon: <FileCheck className="w-6 h-6 text-blue-600" />,
      description:
        'Pembedahan dan perapian naskah yang sudah selesai ditulis agar memiliki alur argumen yang runut, logika narasi yang kuat, dan bebas dari kerancuan struktur kalimat.',
      targetAudience:
        'Penulis naskah fiksi maupun nonfiksi, akademisi, peneliti, dan penggiat komunitas yang telah memiliki draf awal dan ingin naskahnya mencapai standar kelayakan baca yang tinggi.',
      scopeOfWork: [
        'Evaluasi struktur bab, keterpaduan tema, dan kekuatan argumen',
        'Penyelarasan nada tulisan (tone of voice) agar relevan dengan sasaran pembaca',
        'Perbaikan kalimat tidak efektif, ambiguitas, dan kontinuitas ide',
        'Pemberian catatan konstruktif pada naskah (margin comments)',
      ],
      workflow: [
        '1. Pengiriman sampel naskah untuk evaluasi awal',
        '2. Kesepakatan ruang lingkup perbaikan',
        '3. Penyuntingan substantif & dialog editorial',
        '4. Penyerahan naskah hasil suntingan',
      ],
    },
    {
      id: 'proofreading',
      title: 'Proofreading dan Perbaikan Bahasa Baku',
      shortTag: 'Koreksi Akhir EYD/PUEBI',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      description:
        'Pemeriksaan akhir naskah sebelum masuk tahap cetak atau publikasi untuk membersihkan salah tik (typo), tanda baca, kaidah ejaan resmi (PUEBI/EYD), dan konsistensi istilah.',
      targetAudience:
        'Penulis mandiri, institusi nirlaba, mahasiswa yang menyusun buku ilmiah populer, atau lembaga yang membutuhkan jaminan kebersihan bahasa pada dokumen publikasi.',
      scopeOfWork: [
        'Pemeriksaan cermat saltik (typo) kata demi kata',
        'Standardisasi penggunaan huruf kapital, tanda petik, angka, dan singkatan',
        'Pengecekan konsistensi penamaan tokoh, istilah asing, dan glosarium',
        'Verifikasi keharmonisan format daftar pustaka dan sitasi rujukan',
      ],
      workflow: [
        '1. Penyerahan draf naskah final',
        '2. Pengecekan teliti lapis pertama & kedua',
        '3. Penyerahan dokumen perbandingan (track changes)',
      ],
    },
    {
      id: 'layout',
      title: 'Tata Letak dan Layout Buku Siap Cetak',
      shortTag: 'Desain Interior Naskah',
      icon: <Layout className="w-6 h-6 text-purple-600" />,
      description:
        'Penataan estetika tata letak halaman buku bagian dalam (interior layout) dengan pemilihan tipografi yang nyaman di mata, proporsi margin yang proporsional, serta siap dikirim ke percetakan.',
      targetAudience:
        'Penulis yang berencana mencetak buku secara mandiri (self-publishing), komunitas literasi, dan instansi yang membutuhkan berkas PDF siap cetak berstandar percetakan offset maupun print-on-demand.',
      scopeOfWork: [
        'Pemilihan jenis huruf (font pairing) yang berkarakter dan mudah dibaca',
        'Pengaturan halaman pembuka (judulan, prakata, daftar isi) dan penutup',
        'Penyesuaian batas potong (bleed & gutter margin) sesuai ketebalan jilid buku',
        'Penyerahan berkas siap cetak (High-Resolution Print-Ready PDF)',
      ],
      workflow: [
        '1. Penentuan ukuran buku (UNESCO A5, B5, atau kustom)',
        '2. Desain 2 alternatif gaya halaman sampel',
        '3. Penataan keseluruhan halaman buku',
        '4. Uji baca layout & penyerahan berkas master cetak',
      ],
    },
    {
      id: 'konsultasi-naskah',
      title: 'Konsultasi Pengembangan Naskah',
      shortTag: 'Mentoring & Ideasi',
      icon: <Compass className="w-6 h-6 text-amber-700" />,
      description:
        'Sesi diskusi satu lawan satu untuk membedah ide mentah, merumuskan premis buku, menyusun daftar isi yang terstruktur, dan mengatasi kebuntuan menulis (writer’s block).',
      targetAudience:
        'Calon penulis yang memiliki segudang pengalaman berharga namun bingung bagaimana cara memulainya, serta penulis yang sedang terhenti di pertengahan jalan penulisan.',
      scopeOfWork: [
        'Pemetaan nilai keunikan cerita (unique selling point)',
        'Perancangan struktur bab yang memikat pembaca',
        'Pemberian panduan praktis target penulisan berkala',
        'Tanya-jawab kendala teknis dan psikologis dalam kepenulisan',
      ],
      workflow: [
        '1. Pengisian formulir ringkasan ide awal',
        '2. Sesi pertemuan virtual / tatap muka terencana',
        '3. Rangkuman rekomendasi langkah penulisan',
      ],
    },
    {
      id: 'konsultasi-penerbitan',
      title: 'Konsultasi Persiapan Penerbitan Buku',
      shortTag: 'Roadmap & Strategi',
      icon: <BookOpen className="w-6 h-6 text-teal-700" />,
      description:
        'Bimbingan navigasi mengenai ekosistem penerbitan buku di Indonesia: memahami perbedaan jalur penerbit mayor, penerbit mandiri (self-publishing), dan persiapan legalitas karya.',
      targetAudience:
        'Penulis naskah yang sudah selesai menulis dan ingin memahami langkah realistis dalam menerbitkan dan mendistribusikan karya tanpa terjebak janji-janji berlebihan.',
      scopeOfWork: [
        'Pemahaman hak cipta, royalti, dan etika kepengarangan',
        'Perbandingan biaya dan kelebihan jalur mandiri vs penerbit tradisional',
        'Perencanaan strategi peluncuran buku kepada komunitas pembaca sasaran',
        'Edukasi pengelolaan naskah agar terhindar dari pembajakan',
      ],
      workflow: [
        '1. Telaah kesiapan draf naskah',
        '2. Pemetaan jalur publikasi paling sesuai dengan kebutuhan penulis',
        '3. Penyusunan peta jalan (roadmap) penerbitan',
      ],
    },
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!agreePrivacy) {
      alert('Anda wajib menyetujui persetujuan pemrosesan data untuk melanjutkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save inquiry to system store
      const res = await DmlStore.submitConsultation({
        clientName: clientName.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        serviceType,
        manuscriptTitle: manuscriptTitle.trim() || undefined,
        notes: notes.trim(),
      });

      if (!res.success) {
        alert(res.error || 'Gagal mengirim permohonan konsultasi.');
        return;
      }

      // Generate direct WhatsApp message link
      const cleanWaNum = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const message = `Halo Meja Konsultasi Rumah Dessa Mentari,\n\nNama saya: ${clientName.trim()}\nLayanan yang saya butuhkan: ${serviceType}\nJudul Naskah (jika ada): ${manuscriptTitle.trim() || '-'}\nEmail: ${email.trim()}\n\nGambaran kebutuhan:\n"${notes.trim()}"\n\nMohon info arahan konsultasi selanjutnya. Terima kasih.`;
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanWaNum}&text=${encodeURIComponent(message)}`;

      setWhatsappUrlGenerated(waUrl);
      setSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-100/80 px-3.5 py-1.5 rounded-full border border-amber-200">
            RDM Literary & Editorial Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-slate-900 leading-tight">
            Layanan Profesional Penulisan & Penyuntingan Buku
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Menemani perjalanan gagasan Anda sejak berupa bisikan ide mentah hingga terwujud menjadi karya buku yang bernyawa, berbobot, dan siap menjumpai pembaca.
          </p>
        </div>

        {/* 6 Services Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map(srv => (
            <div
              key={srv.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:border-amber-400/80 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {srv.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {srv.shortTag}
                  </span>
                </div>

                <h3 className="font-serif-editorial text-xl font-bold text-slate-900 leading-snug">
                  {srv.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {srv.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Sasaran & Kebutuhan Klien:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.targetAudience}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ruang Lingkup Pekerjaan:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {srv.scopeOfWork.map((sc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{sc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Konsultasi Terbuka</span>
                <a
                  href="#formulir-konsultasi"
                  onClick={() => setServiceType(srv.title)}
                  className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                >
                  Pilih Layanan Ini <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Consultation Form Section */}
        <div id="formulir-konsultasi" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm scroll-mt-24">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Mulai Dari Dialog Hangat
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif-editorial font-bold text-slate-900">
                Formulir Konsultasi Naskah Buku
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Sampaikan rencana penulisan Anda. Kami akan menelaah kebutuhan naskah dan menghubungkan Anda langsung dengan tim redaksi melalui WhatsApp resmi RDM.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-emerald-950">
                  Data Konsultasi Berhasil Dicatat!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  Terima kasih, Bapak/Ibu {clientName}. Tim redaksi telah menerima permohonan konsultasi untuk "{serviceType}". Anda dapat langsung melanjutkan obrolan via WhatsApp resmi berikut:
                </p>
                {whatsappUrlGenerated && (
                  <div className="pt-2">
                    <a
                      href={whatsappUrlGenerated}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Buka Obrolan WhatsApp Sekarang</span>
                    </a>
                  </div>
                )}
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setClientName('');
                      setEmail('');
                      setWhatsapp('');
                      setManuscriptTitle('');
                      setNotes('');
                    }}
                    className="text-xs text-slate-500 underline"
                  >
                    Kirim Permohonan Konsultasi Lainnya
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="Contoh: Budi Prasetyo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Alamat Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="budi@contoh.id"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Pilihan Layanan *
                    </label>
                    <select
                      value={serviceType}
                      onChange={e => setServiceType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs bg-white"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Judul atau Gagasan Utama Buku (Opsional)
                  </label>
                  <input
                    type="text"
                    value={manuscriptTitle}
                    onChange={e => setManuscriptTitle(e.target.value)}
                    placeholder="Contoh: Memoar 30 Tahun Mengabdi di Puskesmas Desa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Gambaran Kebutuhan & Ekspektasi Naskah *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ceritakan sejauh mana draf Anda saat ini, sasaran pembaca, atau kendala yang dihadapi..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs leading-relaxed"
                  />
                </div>

                {/* Privacy and processing consent */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={e => setAgreePrivacy(e.target.checked)}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      Saya menyetujui pemrosesan data kontak di atas oleh tim redaksi Rumah Dessa Mentari semata-mata untuk keperluan komunikasi konsultasi naskah, sesuai dengan{' '}
                      <span className="underline font-semibold text-slate-800">Kebijakan Privasi</span> kami.
                    </span>
                  </label>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 mx-auto ${
                      isSubmitting
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:shadow-md'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Mengirim Data...' : 'Kirim Permohonan & Buka WhatsApp Redaksi'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Ethical statement notice */}
        <div className="text-center text-xs text-slate-500 max-w-xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700">Komitmen Integritas Rumah Dessa Mentari:</p>
          <p>
            Kami tidak mencantumkan testimoni fiktif atau janji kelulusan ISBN instan. Setiap karya ditangani dengan standar editorial yang jujur, transparan, dan menghargai orisinalitas buah pikiran penulis.
          </p>
        </div>
      </div>
    </div>
  );
};
