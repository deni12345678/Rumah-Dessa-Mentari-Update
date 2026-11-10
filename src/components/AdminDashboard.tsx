import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Shield,
  PhoneCall,
  CheckCircle,
  FileCheck,
  Eye,
  EyeOff,
  Sliders,
  UserCheck,
  UserPlus,
  Mail,
  ExternalLink,
  Clock,
  AlertTriangle,
  XCircle,
  Send,
  Sparkles,
  BookOpen,
  KeyRound,
  Lock,
  UserCog,
  Camera,
  Check
} from 'lucide-react';
import { ConsultationRequest, EmailNotificationLog, SiteSettings, User, UserRole } from '../types';
import { DmlStore } from '../lib/store';
import { CATEGORIES_LIST } from './Header';

interface AdminDashboardProps {
  currentUser: User;
  initialTab?: 'pending_writers' | 'users' | 'consultations' | 'settings' | 'email_logs' | 'backup' | 'admin_profile';
}

const ADMIN_PRESET_AVATARS = [
  {
    name: 'Pimpinan Redaksi Formal',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Pengelola Profesional',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Eksekutif & Pendidik',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Akademisi & Penulis',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Kurator Sastra',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Pengabdi Literasi',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, initialTab = 'pending_writers' }) => {
  const [activeTab, setActiveTab] = useState<'pending_writers' | 'users' | 'consultations' | 'settings' | 'email_logs' | 'backup' | 'admin_profile'>(initialTab);
  const [settings, setSettings] = useState<SiteSettings>(DmlStore.getSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [, setForceUpdate] = useState(0);

  // Sync initialTab when changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    DmlStore.refreshUsersFromCloud().then(() => {
      setForceUpdate(n => n + 1);
    });
    const unsub = DmlStore.subscribe(() => {
      setForceUpdate(n => n + 1);
    });
    return unsub;
  }, []);

  // Admin Profile Form States
  const [adminName, setAdminName] = useState(currentUser.name || '');
  const [adminBio, setAdminBio] = useState(currentUser.bio || '');
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(currentUser.avatarUrl || ADMIN_PRESET_AVATARS[0].url);
  const [adminPhone, setAdminPhone] = useState(currentUser.phone || '');
  const [adminPortfolioUrl, setAdminPortfolioUrl] = useState(currentUser.portfolioUrl || '');
  const [isSavingAdminProfile, setIsSavingAdminProfile] = useState(false);
  const [adminProfileMessage, setAdminProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Admin Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync profile fields if currentUser changes
  useEffect(() => {
    setAdminName(currentUser.name || '');
    setAdminBio(currentUser.bio || '');
    setAdminAvatarUrl(currentUser.avatarUrl || ADMIN_PRESET_AVATARS[0].url);
    setAdminPhone(currentUser.phone || '');
    setAdminPortfolioUrl(currentUser.portfolioUrl || '');
  }, [currentUser]);

  // New Writer Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWriterName, setNewWriterName] = useState('');
  const [newWriterEmail, setNewWriterEmail] = useState('');
  const [newWriterPassword, setNewWriterPassword] = useState('penulis123');
  const [newWriterPhone, setNewWriterPhone] = useState('');
  const [newWriterBio, setNewWriterBio] = useState('');
  const [newWriterRole, setNewWriterRole] = useState<'contributor' | 'editor' | 'admin'>('contributor');
  const [newWriterCategories, setNewWriterCategories] = useState<string[]>(['Kisah Inspiratif']);
  const [createModalMessage, setCreateModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allUsers = DmlStore.getAllUsers();
  const pendingWriters = DmlStore.getPendingWriters();
  const consultations = DmlStore.getConsultations();
  const allArticles = DmlStore.getArticles();
  const emailLogs = DmlStore.getEmailNotificationLogs();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const res = await DmlStore.updateUserRole(userId, newRole);
    if (!res.success) {
      setBackupNotice('Gagal mengubah peran: ' + res.error);
    } else {
      setBackupNotice('Peran pengguna berhasil diperbarui di database pusat.');
    }
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleApproveWriter = async (userId: string, decision: 'approved' | 'rejected', name: string) => {
    const res = await DmlStore.approveWriterAccount(userId, decision);
    if (res.success) {
      setBackupNotice(
        decision === 'approved'
          ? `Alhamdulillah! Akun penulis ${name} telah berhasil di-ACC (disetujui) di database pusat. Salinan dicatat ke email santosodeni3@gmail.com.`
          : `Pengajuan akun ${name} telah ditolak.`
      );
    } else {
      setBackupNotice('Gagal memperbarui status: ' + res.error);
    }
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleCreateWriterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalMessage(null);

    const res = await DmlStore.createWriterByAdmin({
      name: newWriterName,
      email: newWriterEmail,
      passwordPlain: newWriterPassword,
      phone: newWriterPhone,
      bio: newWriterBio,
      role: newWriterRole,
      preferredCategories: newWriterCategories,
    });

    if (res.success) {
      setCreateModalMessage({
        type: 'success',
        text: `Akun ${newWriterName} berhasil dibuat dan langsung AKTIF (di-ACC). Salinan data tersimpan & diteruskan ke santosodeni3@gmail.com.`,
      });
      setTimeout(() => {
        setCreateModalOpen(false);
        setNewWriterName('');
        setNewWriterEmail('');
        setNewWriterPassword('penulis123');
        setNewWriterPhone('');
        setNewWriterBio('');
        setCreateModalMessage(null);
      }, 2000);
    } else {
      setCreateModalMessage({
        type: 'error',
        text: res.error || 'Gagal membuat akun.',
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    DmlStore.updateSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = DmlStore.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_dml_data_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Cadangan data berhasil diunduh ke komputer Anda.');
    setTimeout(() => setBackupNotice(null), 3000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = DmlStore.importAllData(content);
      if (res.success) {
        setBackupNotice('Data berhasil dipulihkan dari berkas cadangan!');
        setSettings(DmlStore.getSettings());
      } else {
        setBackupNotice('Gagal memulihkan: ' + res.error);
      }
      setTimeout(() => setBackupNotice(null), 3500);
    };
    reader.readAsText(file);
  };

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAdminProfileMessage({ type: 'error', text: 'Berkas yang dipilih bukan berkas gambar yang valid.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 320, 320);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAdminAvatarUrl(compressed);
          setAdminProfileMessage({
            type: 'success',
            text: 'Foto profil pengelola berhasil dipilih. Klik "Simpan Perubahan Profil Pengelola" untuk menyimpan.',
          });
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingAdminProfile) return;
    setAdminProfileMessage(null);

    if (!adminName.trim() || adminName.trim().length < 2) {
      setAdminProfileMessage({ type: 'error', text: 'Nama administrator minimal 2 karakter.' });
      return;
    }

    setIsSavingAdminProfile(true);
    try {
      const res = await DmlStore.updateUserProfile(currentUser.id, {
        name: adminName.trim(),
        bio: adminBio.trim(),
        avatarUrl: adminAvatarUrl.trim(),
        phone: adminPhone.trim(),
        portfolioUrl: adminPortfolioUrl.trim(),
      });

      if (res.success) {
        setAdminProfileMessage({
          type: 'success',
          text: 'Alhamdulillah! Profil dan data kontak resmi administrator berhasil diperbarui.',
        });
        setTimeout(() => setAdminProfileMessage(null), 4000);
      } else {
        setAdminProfileMessage({ type: 'error', text: res.error || 'Gagal menyimpan profil.' });
      }
    } catch (err: any) {
      setAdminProfileMessage({ type: 'error', text: err?.message || 'Terjadi kesalahan sistem saat menyimpan profil.' });
    } finally {
      setIsSavingAdminProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingPassword) return;
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Silakan masukkan kata sandi saat ini (lama).' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok. Periksa kembali pengetikan Anda.' });
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage({ type: 'error', text: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await DmlStore.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMessage({
          type: 'success',
          text: 'Alhamdulillah! Kata sandi akun administrator berhasil diperbarui dengan aman di sistem Firebase.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 5000);
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Gagal mengubah kata sandi.' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'Terjadi kesalahan sistem saat memperbarui kata sandi.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [resetNotice, setResetNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState<string | null>(null);

  const handleAdminResetPassword = async (email: string, name: string) => {
    setIsSendingResetEmail(email);
    setResetNotice(null);
    try {
      const res = await DmlStore.resetPassword(email);
      if (res.success) {
        setResetNotice({
          type: 'success',
          text: `Tautan pemulihan kata sandi berhasil dikirim ke ${email} (${name}). Pengguna dapat membuka email untuk mengatur kata sandi baru.`,
        });
        setTimeout(() => setResetNotice(null), 8000);
      } else {
        setResetNotice({
          type: 'error',
          text: res.error || `Gagal mengirim tautan reset sandi untuk ${email}.`,
        });
      }
    } catch (err: any) {
      setResetNotice({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan sistem saat memproses pemulihan kata sandi.',
      });
    } finally {
      setIsSendingResetEmail(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                Pusat Kontrol Administrator
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">Administrator: {currentUser.name}</span>
            </div>
            <h1 className="text-2xl font-serif-editorial font-bold text-slate-900 mt-1">
              Pengelolaan & Persetujuan Penulis RDM
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>Data & notifikasi otomatis tersimpan ke: <strong>santosodeni3@gmail.com</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('admin_profile')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border shadow-xs ${
                activeTab === 'admin_profile'
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              title="Edit Profil & Kata Sandi Administrator"
            >
              <UserCog className="w-4 h-4 text-amber-600" />
              <span>Profil & Sandi Admin</span>
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Buat Akun Penulis</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
          </div>
        </div>

        {/* Quick Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-4 rounded-xl border transition-all ${pendingWriters.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-medium text-amber-800">Menunggu ACC Penulis</span>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-amber-900">{pendingWriters.length}</p>
              {pendingWriters.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 animate-pulse">
                  Perlu ACC
                </span>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Pengguna Terdaftar</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{allUsers.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Konsultasi Buku Masuk</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">{consultations.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Notifikasi Email Otomatis</span>
            <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> {emailLogs.length} Terkirim
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-slate-200 flex space-x-4 sm:space-x-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('admin_profile')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'admin_profile'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCog className="w-4 h-4 text-amber-600" />
            <span>Profil & Sandi Pengelola</span>
          </button>

          <button
            onClick={() => setActiveTab('pending_writers')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'pending_writers'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Persetujuan Penulis (ACC)</span>
            {pendingWriters.length > 0 && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {pendingWriters.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua Akun ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Permohonan Konsultasi ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('email_logs')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'email_logs'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Arsip Email santosodeni3@gmail.com ({emailLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Pengaturan Situs</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'backup'
                ? 'border-red-600 text-red-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Cadangan & Reset</span>
          </button>
        </div>

        {backupNotice && (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium flex items-center justify-between">
            <span>{backupNotice}</span>
            <button onClick={() => setBackupNotice(null)} className="text-amber-800 font-bold ml-2">×</button>
          </div>
        )}

        {/* TAB 0: ADMIN PROFILE & PASSWORD MANAGEMENT */}
        {activeTab === 'admin_profile' && (
          <div className="space-y-6">
            {/* Header Description Box */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-5 border border-amber-200 shadow-xs flex flex-col sm:flex-row items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 shrink-0">
                <UserCog className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-amber-950 text-sm font-serif-editorial">
                    Profil & Kredensial Keamanan Administrator Portal
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900">
                    Otoritas Penuh
                  </span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Perbarui identitas publik, biodata, dan kontak WhatsApp pimpinan redaksi Rumah Dessa Mentari, serta ubah kata sandi akun administrator secara berkala untuk menjaga integritas keamanan sistem.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Profil Administrator */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-editorial text-lg font-bold text-slate-900 flex items-center gap-2">
                      <UserCog className="w-5 h-5 text-amber-600" />
                      <span>Identitas & Kontak Pengelola</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Data ini tampil pada publikasi naskah resmi dan informasi pengelola portal.
                    </p>
                  </div>
                </div>

                {adminProfileMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold ${
                      adminProfileMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {adminProfileMessage.text}
                  </div>
                )}

                <form onSubmit={handleSaveAdminProfile} className="space-y-5">
                  {/* Avatar Upload & Presets */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Foto Profil / Pasfoto Resmi Pengelola
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative group shrink-0">
                        <img
                          src={adminAvatarUrl}
                          alt={adminName}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => adminFileInputRef.current?.click()}
                          className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold gap-1"
                          title="Ganti Foto"
                        >
                          <Camera className="w-5 h-5 text-amber-300" />
                        </button>
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <input
                          ref={adminFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAdminPhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => adminFileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>Pilih Foto dari Perangkat</span>
                        </button>
                        <p className="text-[11px] text-slate-500">
                          Format JPG, PNG, atau WebP. Otomatis dikompresi agar ringan dan tajam.
                        </p>
                      </div>
                    </div>

                    {/* Preset Avatars Gallery */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="block text-[11px] font-bold text-slate-600 mb-2">
                        Atau pilih avatar presisi standar redaksi:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {ADMIN_PRESET_AVATARS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAdminAvatarUrl(preset.url)}
                            className={`p-1 rounded-xl border transition-all text-center group ${
                              adminAvatarUrl === preset.url
                                ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50/50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                            title={preset.name}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <span className="block text-[9px] font-medium text-slate-600 truncate mt-1">
                              {preset.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nama Lengkap & Gelar *
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={e => setAdminName(e.target.value)}
                        placeholder="Contoh: Deni Santoso, M.M."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs font-semibold text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Alamat Email Akun
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email || 'santosodeni3@gmail.com'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed"
                      />
                      <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                        ✓ Email Administrator Terverifikasi
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Nomor WhatsApp Resmi Pengelola
                      </label>
                      <input
                        type="text"
                        value={adminPhone}
                        onChange={e => setAdminPhone(e.target.value)}
                        placeholder="Contoh: 6287879069404"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Format internasional (awali dengan 62 tanpa spasi atau tanda +).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Tautan Portofolio / Profil Akademis (Opsional)
                      </label>
                      <input
                        type="url"
                        value={adminPortfolioUrl}
                        onChange={e => setAdminPortfolioUrl(e.target.value)}
                        placeholder="https://scholar.google.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Biografi Singkat / Amanat Pimpinan Redaksi
                    </label>
                    <textarea
                      rows={3}
                      value={adminBio}
                      onChange={e => setAdminBio(e.target.value)}
                      placeholder="Uraikan dedikasi kepenulisan, rekam jejak, atau peran Anda sebagai pimpinan redaksi Rumah Dessa Mentari..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 text-xs leading-relaxed text-slate-900 bg-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSavingAdminProfile}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSavingAdminProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil Pengelola'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Form Ubah Kata Sandi & Ringkasan Otoritas */}
              <div className="lg:col-span-5 space-y-6">
                {/* Card Ubah Sandi */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-serif-editorial text-lg font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-600" />
                      <span>Ubah Kata Sandi Akun</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pembaruan kredensial terenkripsi langsung ke Firebase Auth.
                    </p>
                  </div>

                  {passwordMessage && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold ${
                        passwordMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passwordMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Kata Sandi Saat Ini (Lama) *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="Masukkan kata sandi lama Anda"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Kata Sandi Baru * (Min. 6 Karakter)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Masukkan kata sandi baru yang kuat"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ulangi Kata Sandi Baru *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Ketik ulang kata sandi baru"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Lock className="w-4 h-4" />
                        <span>{isChangingPassword ? 'Memproses Sandi...' : 'Perbarui Kata Sandi Administrator'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Card Ringkasan Hak Akses & Keamanan */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm font-serif-editorial">Hak Otoritas & Keamanan Akun</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>Persetujuan pendaftaran penulis baru (Fitur ACC).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>Kurasi naskah dan penetapan status artikel terbit.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>Arsip otomatis seluruh peristiwa ke santosodeni3@gmail.com.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>Enkripsi kata sandi berbasis Firebase Authentication.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: PENDING WRITER APPLICATIONS (ACC FEATURE) */}
        {activeTab === 'pending_writers' && (
          <div className="space-y-4">
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Sistem Kurasi Akun Penulis RDM:</strong> Calon kontributor yang mendaftar secara mandiri memerlukan persetujuan (ACC) dari Admin <strong>Deni Santoso, M.M.</strong> sebelum naskah mereka dapat ditayangkan resmi.
                </span>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold whitespace-nowrap shrink-0 shadow-2xs"
              >
                + Tambah Penulis Langsung Aktif
              </button>
            </div>

            {pendingWriters.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">
                  Semua Pengajuan Penulis Sudah Di-ACC
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tidak ada permohonan pendaftaran penulis yang tertunda saat ini. Anda juga dapat membuat akun penulis baru kapan saja menggunakan tombol di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingWriters.map(writer => (
                  <div
                    key={writer.id}
                    className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={writer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={writer.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif-editorial text-base font-bold text-slate-900">{writer.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Menunggu ACC
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{writer.email} {writer.phone && `• WA: ${writer.phone}`}</p>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400">
                        Mendaftar: {new Date(writer.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="md:col-span-2 space-y-1">
                        <span className="font-bold text-slate-700">Biodata & Latar Belakang:</span>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                          {writer.bio || 'Tidak mencantumkan biodata rinci.'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {writer.preferredCategories && writer.preferredCategories.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-700">Minat Rubrik:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {writer.preferredCategories.map(cat => (
                                <span key={cat} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-medium">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {writer.portfolioUrl && (
                          <div>
                            <span className="font-bold text-slate-700">Portofolio / Contoh Tulisan:</span>
                            <a
                              href={writer.portfolioUrl.startsWith('http') ? writer.portfolioUrl : `https://${writer.portfolioUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-800 underline flex items-center gap-1 mt-0.5 truncate"
                            >
                              <span>{writer.portfolioUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500">
                        Notifikasi pendaftaran ini telah diarsip ke: <strong>santosodeni3@gmail.com</strong>
                      </span>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => handleApproveWriter(writer.id, 'rejected', writer.name)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                        >
                          Tolak Pengajuan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveWriter(writer.id, 'approved', writer.name)}
                          className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ACC & Aktifkan Penulis</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif-editorial text-sm font-bold text-slate-800">
                  Daftar Seluruh Pengguna & Hak Akses
                </h3>
                <p className="text-xs text-slate-500">
                  Admin dapat mengelola hak akses dan membantu mengirimkan tautan reset kata sandi resmi kepada pengguna.
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs self-start sm:self-auto"
              >
                + Tambah Akun
              </button>
            </div>

            {resetNotice && (
              <div
                className={`p-3 mx-4 my-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  resetNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {resetNotice.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{resetNotice.text}</span>
                </div>
                <button
                  onClick={() => setResetNotice(null)}
                  className="text-xs font-bold px-2 py-0.5 rounded hover:bg-black/5"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {allUsers.map(u => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{u.name}</h4>
                        {u.approvalStatus === 'pending' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            Menunggu ACC
                          </span>
                        )}
                        {u.approvalStatus === 'approved' && u.role === 'contributor' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Ter-ACC
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <p className="text-[11px] text-slate-400 max-w-sm line-clamp-1">{u.bio}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    {u.approvalStatus === 'pending' && (
                      <button
                        onClick={() => handleApproveWriter(u.id, 'approved', u.name)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        ACC Akun
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAdminResetPassword(u.email, u.name)}
                      disabled={isSendingResetEmail === u.email}
                      title={`Kirimkan tautan reset kata sandi resmi Firebase ke ${u.email}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isSendingResetEmail === u.email ? 'Mengirim...' : 'Reset Sandi'}</span>
                    </button>

                    <span className="text-xs text-slate-400 font-medium">Peran:</span>
                    <select
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-red-500"
                    >
                      <option value="reader">Pembaca (Tamu)</option>
                      <option value="contributor">Kontributor Penulis</option>
                      <option value="editor">Editor Meja Redaksi</option>
                      <option value="admin">Administrator Penuh</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONSULTATIONS INBOX */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <PhoneCall className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">
                  Belum Ada Permohonan Konsultasi
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Permohonan yang diajukan pengunjung melalui formulir halaman "Layanan Kami" akan dicatat di sini dan salinannya diteruskan ke santosodeni3@gmail.com.
                </p>
              </div>
            ) : (
              consultations.map(cons => (
                <div
                  key={cons.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      Layanan: {cons.serviceType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(cons.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <strong className="text-slate-900">Klien:</strong> {cons.clientName}
                    </div>
                    <div>
                      <strong className="text-slate-900">Email:</strong> {cons.email}
                    </div>
                    <div>
                      <strong className="text-slate-900">WhatsApp:</strong>{' '}
                      <a
                        href={`https://wa.me/${cons.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 underline font-semibold"
                      >
                        +{cons.whatsapp} (Hubungi via WA)
                      </a>
                    </div>
                    {cons.manuscriptTitle && (
                      <div>
                        <strong className="text-slate-900">Judul Naskah:</strong> {cons.manuscriptTitle}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong>Gambaran Kebutuhan:</strong> {cons.notes}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => DmlStore.updateConsultationStatus(cons.id, 'completed')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                        cons.status === 'completed'
                          ? 'bg-slate-100 text-slate-500 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {cons.status === 'completed' ? 'Telah Ditindaklanjuti' : 'Tandai Selesai Dihubungi'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: AUTOMATED EMAIL ARSENAL / LOGS (santosodeni3@gmail.com) */}
        {activeTab === 'email_logs' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                    Rekam Salinan Otomatis: santosodeni3@gmail.com
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh pengajuan penulis baru, persetujuan ACC, naskah masuk, dan formulir konsultasi secara otomatis dicatat dan dialamatkan ke email utama Bapak Deni Santoso, M.M.
                </p>
              </div>

              <a
                href={`mailto:santosodeni3@gmail.com?subject=Arsip Laporan Rumah Dessa Mentari`}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Klien Email</span>
              </a>
            </div>

            {emailLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada rekaman notifikasi email baru. Notifikasi akan otomatis tercatat saat ada pengajuan penulis atau naskah masuk.
              </div>
            ) : (
              <div className="space-y-3">
                {emailLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Terkirim ke: {log.recipient}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{log.subject}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.sentAt).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {log.body}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SITE SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                Pengaturan Umum Website & Kontak Resmi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data kontak ini digunakan pada formulir konsultasi, tombol WhatsApp, dan footer portal.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                Pengaturan berhasil disimpan!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Brand / Portal Website
                </label>
                <input
                  type="text"
                  value={settings.brandName}
                  onChange={e => setSettings({ ...settings, brandName: e.target.value })}
                  placeholder="Rumah Dessa Mentari"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 text-xs font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nama ini akan langsung tampil di logo header, footer, dan tab browser.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Slogan Resmi Portal
                </label>
                <input
                  type="text"
                  value={settings.slogan}
                  onChange={e => setSettings({ ...settings, slogan: e.target.value })}
                  placeholder="Inspirasi untuk Semua, Karya untuk Dunia"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Motto yang mendampingi nama brand di logo dan footer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Arsip / Penyimpanan Admin Utama
                </label>
                <input
                  type="email"
                  value={settings.adminEmailBackup || 'santosodeni3@gmail.com'}
                  onChange={e => setSettings({ ...settings, adminEmailBackup: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 text-xs font-bold text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Seluruh notifikasi pengajuan akun penulis & naskah akan diarsipkan ke alamat ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor WhatsApp Konsultasi (Format Internasional)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="6281234567890"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Deskripsi Singkat Portal
              </label>
              <textarea
                rows={3}
                value={settings.shortDescription}
                onChange={e => setSettings({ ...settings, shortDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.allowSubmissions}
                  onChange={e => setSettings({ ...settings, allowSubmissions: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Buka penerimaan naskah artikel dari kontributor umum</span>
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Simpan Perubahan Pengaturan
              </button>
            </div>
          </form>
        )}

        {/* TAB 6: BACKUP & DATA RESTORE */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                Cadangan Data & Rencana Keberlanjutan Mandiri
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sesuai prinsip kehati-hatian, lakukan pencadangan data secara rutin tanpa ketergantungan pada satu penyedia awan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Unduh Berkas Cadangan JSON</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mengunduh seluruh artikel, draf, riwayat telaah editor, akun pengguna, konsultasi, dan pengaturan situs ke dalam satu berkas terstruktur.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Unduh Salinan Sekarang (.json)
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Pulihkan dari Berkas Cadangan</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mengembalikan data sistem jika Anda berganti perangkat atau ingin memulihkan arsip sebelumnya.
                </p>
                <label className="block w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center cursor-pointer shadow-xs transition-colors">
                  <span>Pilih Berkas JSON untuk Dipulihkan</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-rose-900">Bersihkan & Reset Sistem</h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  MENGHAPUS seluruh cache lokal dan mengembalikan sistem ke data awal pabrikan (rebranding baru). Gunakan jika terjadi error sinkronisasi.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('PERINGATAN: Tindakan ini akan menghapus seluruh data lokal di browser Anda dan memuat ulang data resmi terbaru. Lanjutkan?')) {
                      DmlStore.resetToDefault();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Reset ke Data Awal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE NEW WRITER ACCOUNT DIRECTLY BY ADMIN */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="text-left space-y-1 mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                  <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                  <span>Otoritas Administrator Deni Santoso, M.M.</span>
                </div>
                <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
                  Pembuatan Akun Penulis Baru (Langsung Aktif / ACC)
                </h2>
                <p className="text-xs text-slate-500">
                  Akun yang dibuat di sini langsung disetujui tanpa perlu antrean ACC. Salinan konfirmasi otomatis dicatat ke santosodeni3@gmail.com.
                </p>
              </div>

              {createModalMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium mb-4 ${
                    createModalMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {createModalMessage.text}
                </div>
              )}

              <form onSubmit={handleCreateWriterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nama Lengkap & Gelar *
                    </label>
                    <input
                      type="text"
                      required
                      value={newWriterName}
                      onChange={e => setNewWriterName(e.target.value)}
                      placeholder="Contoh: Hendra Kusuma, S.Pd."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Email Penulis *
                    </label>
                    <input
                      type="email"
                      required
                      value={newWriterEmail}
                      onChange={e => setNewWriterEmail(e.target.value)}
                      placeholder="penulis@contoh.id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Kata Sandi Awal *
                    </label>
                    <input
                      type="text"
                      required
                      value={newWriterPassword}
                      onChange={e => setNewWriterPassword(e.target.value)}
                      placeholder="penulis123"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nomor WhatsApp (Opsional)
                    </label>
                    <input
                      type="tel"
                      value={newWriterPhone}
                      onChange={e => setNewWriterPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Peran Hak Akses
                    </label>
                    <select
                      value={newWriterRole}
                      onChange={e => setNewWriterRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 bg-white"
                    >
                      <option value="contributor">Kontributor Penulis</option>
                      <option value="editor">Editor Meja Redaksi</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Fokus Rubrik Utama
                    </label>
                    <select
                      onChange={e => {
                        const val = e.target.value;
                        if (!newWriterCategories.includes(val)) {
                          setNewWriterCategories([...newWriterCategories, val]);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 bg-white"
                    >
                      {CATEGORIES_LIST.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Biodata Singkat / Latar Belakang Penulis
                  </label>
                  <textarea
                    rows={3}
                    value={newWriterBio}
                    onChange={e => setNewWriterBio(e.target.value)}
                    placeholder="Profesi, rekam jejak kepenulisan, atau domisili penulis..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Buat & Aktifkan Akun Penulis Sekarang</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
