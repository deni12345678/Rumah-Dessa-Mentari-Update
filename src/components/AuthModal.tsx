import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, CheckCircle2, AlertCircle, Phone, Globe } from 'lucide-react';
import { DmlStore } from '../lib/store';
import { CATEGORIES_LIST } from './Header';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPortfolio, setRegPortfolio] = useState('');
  const [regCategory, setRegCategory] = useState('Kisah Inspiratif');
  const [regBio, setRegBio] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await DmlStore.login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await DmlStore.loginWithGoogle();
    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal masuk dengan Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await DmlStore.register(regName, regEmail, regPassword, regBio, {
      phone: regPhone,
      portfolioUrl: regPortfolio,
      preferredCategories: regCategory ? [regCategory] : undefined,
    });
    setLoading(false);
    if (res.success) {
      setSuccessMessage(
        'Alhamdulillah, pendaftaran akun penulis berhasil! Data pengajuan Anda otomatis diarsipkan & dikirimkan ke Admin Deni Santoso, M.M. (santosodeni3@gmail.com) untuk proses persetujuan (ACC). Anda dapat langsung menyusun draf tulisan.'
      );
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } else {
      setErrorMessage(res.error || 'Gagal mendaftar.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await DmlStore.resetPassword(forgotEmail);
    setLoading(false);
    if (res.success) {
      setSuccessMessage(
        `Tautan pemulihan kata sandi telah dikirim ke ${forgotEmail}. Silakan periksa Kotak Masuk (Inbox) atau folder Spam/Junk di email Anda untuk menetapkan kata sandi baru.`
      );
    } else {
      setErrorMessage(res.error || 'Gagal mengirim tautan pemulihan kata sandi. Pastikan email terdaftar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5 mb-6">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Portal Kontributor & Redaksi
          </span>
          <h2 className="font-serif-editorial text-2xl font-bold text-slate-900">
            Rumah Dessa Mentari
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' && 'Masuk untuk mengelola naskah tulisan Anda'}
            {mode === 'register' && 'Daftar sebagai kontributor penulis baru'}
            {mode === 'forgot' && 'Pemulihan kata sandi akun'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Kontributor
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Terdaftar
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="santosodeni3@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    if (loginEmail) {
                      setForgotEmail(loginEmail);
                    }
                  }}
                  className="text-[11px] text-amber-700 hover:underline font-medium"
                >
                  Lupa Sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1B365D] text-white font-bold text-xs shadow-xs transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk ke Portal'}
            </button>

            <div className="relative my-2.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold">Atau</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Masuk dengan Akun Google</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Ketentuan Akun Penulis & ACC:</span> Data pendaftaran otomatis diarsipkan ke <strong className="underline">santosodeni3@gmail.com</strong>. Setelah mendaftar, akun menunggu persetujuan (ACC) dari Admin Deni Santoso, M.M. Anda dapat mulai menyusun draf tulisan sambil menunggu proses ACC.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Lengkap & Gelar (jika ada) *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Contoh: Rahmat Santoso, S.Pd."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Aktif *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  No. WhatsApp / HP
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Rubrik Tulisan Utama *
                </label>
                <select
                  value={regCategory}
                  onChange={e => setRegCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  {CATEGORIES_LIST.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tautan Portofolio / Blog
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={regPortfolio}
                    onChange={e => setRegPortfolio(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kata Sandi (Minimal 6 karakter) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Minimal 6 karakter rahasia"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Biodata Singkat Penulis & Pengalaman
              </label>
              <textarea
                rows={2}
                value={regBio}
                onChange={e => setRegBio(e.target.value)}
                placeholder="Ceritakan latar belakang, fokus kepenulisan, atau karya Anda..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'Mengirim Data Pengajuan...' : 'Daftar & Ajukan Akun Penulis'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-500">
              Notifikasi otomatis pengajuan akun langsung dikirim ke meja Admin: santosodeni3@gmail.com
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <p className="font-bold mb-1">Panduan Pemulihan Kata Sandi:</p>
              <p className="text-[11px] text-amber-800">
                Masukkan alamat email yang Anda gunakan saat mendaftar. Sistem akan mengirimkan tautan resmi pemulihan kata sandi ke kotak masuk email Anda.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Alamat Email Terdaftar *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Pilih Cepat Akun Deni Santoso, M.M.:
              </label>
              <div className="flex flex-col sm:flex-row gap-1.5">
                <button
                  type="button"
                  onClick={() => setForgotEmail('santosodeni3@gmail.com')}
                  className={`flex-1 p-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                    forgotEmail === 'santosodeni3@gmail.com'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="block font-bold">santosodeni3@gmail.com</span>
                  <span className="text-[10px] text-slate-500 font-normal">Email Utama Redaksi RDM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForgotEmail('denisarah26@gmail.com')}
                  className={`flex-1 p-2 rounded-lg text-xs font-medium text-left transition-colors border ${
                    forgotEmail === 'denisarah26@gmail.com'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="block font-bold">denisarah26@gmail.com</span>
                  <span className="text-[10px] text-slate-500 font-normal">Email Admin Deni</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1B365D] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Mengirim Tautan...' : 'Kirim Tautan Pemulihan Kata Sandi'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors text-center"
            >
              ← Kembali ke Menu Masuk
            </button>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Mengalami kendala akun atau lupa email?</p>
              <p>
                Hubungi Pengelola / Admin: <strong>Deni Santoso, M.M.</strong>
              </p>
              <div className="flex flex-col gap-1 text-[11px] text-amber-800 font-medium mt-1">
                <a
                  href="https://wa.me/6287879069404?text=Halo%20Admin%20Rumah%20Dessa%20Mentari,%20saya%20mengalami%20kendala%20lupa%20kata%20sandi%20akun."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:underline text-emerald-700"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: +62 878-7906-9404</span>
                </a>
                <a
                  href="mailto:santosodeni3@gmail.com?subject=Bantuan%20Reset%20Sandi%20Rumah%20Dessa%20Mentari"
                  className="flex items-center gap-1.5 hover:underline text-amber-900"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email: santosodeni3@gmail.com</span>
                </a>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

