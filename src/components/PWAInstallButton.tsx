import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse hover:animate-none"
        title="Pasang Aplikasi Rumah Dessa Mentari di Perangkat Anda"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instal Aplikasi RDM</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>Instal di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold">
                  RDM
                </div>
                <div>
                  <h3 className="font-serif-editorial text-base font-bold text-slate-900">
                    Pasang di iPhone / iPad
                  </h3>
                  <p className="text-xs text-slate-500">Aplikasi Rumah Dessa Mentari</p>
                </div>
              </div>

              <ol className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span>Tekan tombol <strong>Bagikan (Share)</strong> di bilah bawah browser Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span>Gulir ke bawah lalu pilih menu <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span>Klik <strong>Tambah</strong> di sudut kanan atas.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
