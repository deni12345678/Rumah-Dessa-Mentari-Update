import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  QrCode,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  Globe,
  Sparkles,
  Code2
} from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTitle?: string;
  customUrl?: string;
  customDescription?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  customTitle,
  customUrl,
  customDescription,
}) => {
  const [selectedDomainKey, setSelectedDomainKey] = useState<'primary' | 'secondary' | 'current'>('primary');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'share' | 'qrcode' | 'embed'>('share');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const primaryDomain = 'https://rumah-dessa-mentari.vercel.app';
  const secondaryDomain = 'https://dessa-mentari-langit.vercel.app';

  // Compute active target URL
  const targetUrl = (() => {
    if (customUrl) return customUrl;
    if (selectedDomainKey === 'primary') return primaryDomain;
    if (selectedDomainKey === 'secondary') return secondaryDomain;
    if (typeof window !== 'undefined') return window.location.href;
    return primaryDomain;
  })();

  const title = customTitle || 'Rumah Dessa Mentari — Inspirasi untuk Semua, Karya untuk Dunia';
  const description =
    customDescription ||
    'Platform media literasi inspiratif, opini intelektual, wadah kontributor artikel, dan layanan profesional penulisan serta penerbitan buku.';
  const logoUrl = '/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png';

  const promotionalText = `📚 *${title}*\n\n${description}\n\n👉 Kunjungi dan baca karya terbaru di tautan resmi:\n${targetUrl}\n\n#RumahDessaMentari #Literasi #KaryaUntukDunia`;

  const embedCode = `<!-- Lencana Rumah Dessa Mentari -->\n<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:12px;padding:10px 16px;background:#0F1E36;color:#ffffff;text-decoration:none;border-radius:12px;font-family:sans-serif;font-size:14px;font-weight:bold;">\n  <img src="https://rumah-dessa-mentari.vercel.app/logo-rumah-mentari.png" alt="Rumah Dessa Mentari" width="36" height="36" style="border-radius:8px;" />\n  <span>Kunjungi Rumah Dessa Mentari</span>\n</a>`;

  // Generate QR Code with embedded logo on canvas
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function generateCustomQR() {
      try {
        const rawQrDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 480,
          margin: 2,
          color: {
            dark: '#0F1E36',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        // Overlay the logo in the center using canvas
        const img = new Image();
        img.src = rawQrDataUrl;
        img.onload = () => {
          if (!isMounted) return;
          const canvas = document.createElement('canvas');
          canvas.width = 480;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setQrCodeDataUrl(rawQrDataUrl);
            return;
          }

          // Draw base QR
          ctx.drawImage(img, 0, 0);

          // Center logo placement
          const logoSize = 100;
          const center = 480 / 2;
          const logoX = center - logoSize / 2;
          const logoY = center - logoSize / 2;

          // White rounded background badge behind logo
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16, 20);
          ctx.fill();

          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Draw logo
          const logoImg = new Image();
          logoImg.src = logoUrl;
          logoImg.onload = () => {
            if (!isMounted) return;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(logoX, logoY, logoSize, logoSize, 14);
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();
            setQrCodeDataUrl(canvas.toDataURL('image/png'));
          };
          logoImg.onerror = () => {
            if (isMounted) setQrCodeDataUrl(rawQrDataUrl);
          };
        };
      } catch (err) {
        console.error('Failed to generate QR code', err);
      }
    }

    generateCustomQR();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUrl, logoUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(promotionalText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `QR-Rumah-Dessa-Mentari-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct social share handlers
  const shareWhatsApp = () => {
    const textEncoded = encodeURIComponent(promotionalText);
    window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Inspirasi untuk Semua, Karya untuk Dunia bersama Rumah Dessa Mentari 📚`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(targetUrl)}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`, '_blank', 'noopener,noreferrer');
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${promotionalText}\n\nKunjungi: ${targetUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 my-4">
        {/* Top Header with Brand Pattern */}
        <div className="relative bg-gradient-to-br from-[#0F1E36] via-[#1B365D] to-[#0A1424] text-white p-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md border-2 border-amber-400 shrink-0 flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Logo Rumah Dessa Mentari"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Tautan Resmi Siap Dibagikan</span>
              </div>
              <h2 className="font-serif-editorial text-xl font-bold leading-tight">
                Bagikan Rumah Dessa Mentari
              </h2>
              <p className="text-xs text-slate-300">
                Lengkap dengan logo resmi & kartu pratinjau media sosial
              </p>
            </div>
          </div>
        </div>

        {/* Modal Nav Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('share')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4 text-amber-600" />
            <span>Bagikan Tautan</span>
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qrcode' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-600" />
            <span>QR Code Berlogo</span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'embed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>Lencana HTML</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: SHARE & PREVIEW */}
          {activeTab === 'share' && (
            <>
              {/* Domain Switcher */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pilih Alamat Tautan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDomainKey('primary')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedDomainKey === 'primary'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 truncate">Domain Utama (Vercel)</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Rekomendasi
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                      rumah-dessa-mentari.vercel.app
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDomainKey('secondary')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedDomainKey === 'secondary'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 truncate">Domain Alternatif</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        Aktif
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                      dessa-mentari-langit.vercel.app
                    </span>
                  </button>
                </div>
              </div>

              {/* URL Display Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tautan Siap Dibagikan
                </label>
                <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                  <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={targetUrl}
                    className="w-full bg-transparent text-xs text-slate-800 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0F1E36] hover:bg-[#1B365D] text-white shadow-xs'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin!' : 'Salin URL'}</span>
                  </button>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kirim Sekali Klik ke Media Sosial:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {/* WhatsApp */}
                  <button
                    onClick={shareWhatsApp}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-all group"
                    title="Bagikan ke WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold mt-1">WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={shareFacebook}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-all group"
                    title="Bagikan ke Facebook"
                  >
                    <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-[11px] font-bold mt-1">Facebook</span>
                  </button>

                  {/* Twitter / X */}
                  <button
                    onClick={shareTwitter}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all group"
                    title="Bagikan ke X (Twitter)"
                  >
                    <svg className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-[11px] font-bold mt-1">X / Twitter</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={shareTelegram}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 transition-all group"
                    title="Bagikan ke Telegram"
                  >
                    <Send className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold mt-1">Telegram</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={shareLinkedIn}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 transition-all group"
                    title="Bagikan ke LinkedIn"
                  >
                    <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span className="text-[11px] font-bold mt-1">LinkedIn</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={shareEmail}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-all group"
                    title="Kirim via Email"
                  >
                    <Globe className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold mt-1">Email</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card (Pratinjau Kartu Berlogo) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Pratinjau Tampilan Saat Dibagikan (OpenGraph):
                  </label>
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Dilengkapi Logo Resmi
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-2xs hover:shadow-sm transition-all">
                  {/* Card Banner with Logo & Branding */}
                  <div className="h-36 bg-gradient-to-r from-[#0F1E36] via-[#1B365D] to-[#0A1424] relative flex items-center justify-center overflow-hidden p-4">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="flex items-center gap-4 relative z-10 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                      <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md border-2 border-amber-400 shrink-0">
                        <img
                          src={logoUrl}
                          alt="Logo Rumah Dessa Mentari"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left text-white">
                        <h4 className="font-serif-editorial font-bold text-sm sm:text-base leading-tight">
                          Rumah Dessa Mentari
                        </h4>
                        <p className="text-[11px] text-amber-300 font-medium">
                          Inspirasi untuk Semua, Karya untuk Dunia
                        </p>
                        <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
                          Media Literasi & Penerbitan Resmi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Metadata */}
                  <div className="p-3.5 bg-white border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                      rumah-dessa-mentari.vercel.app
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">
                      {title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy Full Broadcast Text Action */}
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-700" />}
                <span>{copiedText ? 'Teks Siaran Berhasil Disalin!' : 'Salin Pesan Siaran Lengkap (WhatsApp/Telegram)'}</span>
              </button>
            </>
          )}

          {/* TAB 2: QR CODE BERLOGO */}
          {activeTab === 'qrcode' && (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed text-left">
                <span className="font-bold">QR Code Siap Cetak & Pindai:</span> QR Code ini dilengkapi logo resmi di bagian tengah. Cocok dipasang di sampul buku, pembatas buku (bookmark), brosur, kartu nama, atau flyer kegiatan redaksi.
              </div>

              <div className="inline-block p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-md">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Rumah Dessa Mentari"
                    className="w-56 h-56 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                    Membuat QR Code...
                  </div>
                )}
                <div className="mt-2 text-center">
                  <p className="text-xs font-bold text-slate-800">Rumah Dessa Mentari</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{targetUrl}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Gambar QR Code (.PNG)</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
                >
                  {copiedLink ? 'Tautan Tersalin' : 'Salin Tautan'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EMBED HTML BADGE */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900">Pasang Lencana di Website Lain:</span> Salin kode HTML di bawah untuk menampilkan lencana resmi Rumah Dessa Mentari berlogo pada blog pribadi, situs sekolah, atau portal mitra Anda.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Pratinjau Lencana:
                </label>
                <div className="p-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0F1E36] text-white font-bold text-xs shadow-md hover:bg-[#1B365D] transition-colors"
                  >
                    <img
                      src={logoUrl}
                      alt="Logo Rumah Dessa Mentari"
                      className="w-7 h-7 rounded-md object-contain bg-white p-0.5"
                    />
                    <span>Kunjungi Rumah Dessa Mentari</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kode HTML Siap Tempel:
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    readOnly
                    value={embedCode}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-900 text-amber-400 font-mono text-[11px] leading-relaxed focus:outline-none"
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] transition-colors flex items-center gap-1"
                  >
                    {copiedEmbed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmbed ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Rumah Dessa Mentari — Terbuka untuk Seluruh Pembaca & Penulis</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
