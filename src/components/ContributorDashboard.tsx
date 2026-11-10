import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Save,
  Trash2,
  Eye,
  Info,
  ShieldCheck,
  Sparkles,
  BookOpen,
  XCircle,
  Check,
  ChevronRight,
  Filter,
  User as UserIcon,
  Upload,
  Camera,
  Globe,
  Phone,
  ExternalLink,
  Briefcase,
  Tag,
  RefreshCw,
  Image as ImageIcon,
  Plus,
  X,
  Maximize2,
  Bell,
  BellRing,
  CheckCheck,
  Lock,
  KeyRound,
  EyeOff
} from 'lucide-react';
import { Article, ArticleCategory, ArticleStatus, User, WriterNotification } from '../types';
import { CATEGORIES_LIST } from './Header';
import { DmlStore } from '../lib/store';

interface ContributorDashboardProps {
  currentUser: User;
  onSelectArticle: (article: Article) => void;
  initialTab?: 'daftar' | 'tulis' | 'pedoman' | 'profil' | 'notifikasi';
}

const PRESET_AVATARS = [
  {
    name: 'Penulis Cendikiawan',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Peneliti & Akademisi',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Jurnalis / Kolumnis',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Pengamat Sastra',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Penulis Kontemporer',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Esais & Pengajar',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Pengabdi Masyarakat',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Penulis Muda & Kreator',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
];

const PRESET_COVERS: {
  category: ArticleCategory;
  title: string;
  url: string;
  attribution: string;
}[] = [
  {
    category: 'Kisah Inspiratif',
    title: 'Panorama Senja Pedesaan & Perjalanan',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Bailey Zindel',
  },
  {
    category: 'Pendidikan',
    title: 'Buku, Catatan & Ruang Belajar',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Kimberly Farmer',
  },
  {
    category: 'Pendidikan',
    title: 'Diskusi & Antusiasme Pelajar',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Mwesigwa Joel',
  },
  {
    category: 'Ekonomi dan UMKM',
    title: 'Aktivitas Pasar & Sentra Usaha',
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Mike Petrucci',
  },
  {
    category: 'Ekonomi dan UMKM',
    title: 'Kerajinan Tangan Kreatif Lokal',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Roman Kraft',
  },
  {
    category: 'Olahraga',
    title: 'Lari Pagi & Gelora Semangat Atletik',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Braden Collum',
  },
  {
    category: 'Kesehatan',
    title: 'Gaya Hidup Bugar & Edukasi Medis',
    url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / National Cancer Institute',
  },
  {
    category: 'Opini dan Gagasan',
    title: 'Pena, Kopi & Meja Refleksi',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Thom Holmes',
  },
  {
    category: 'Literasi dan Buku',
    title: 'Rak Perpustakaan & Membaca Nyaman',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Susan Q Yin',
  },
  {
    category: 'Informasi Umum',
    title: 'Kabar Komunitas & Warta Terkini',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    attribution: 'Unsplash / Andrew Neel',
  },
];

/**
 * Compresses an image File using HTML5 Canvas to keep Firestore payloads lightweight
 */
const compressImageFile = (file: File, maxWidth = 1000, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas yang dipilih bukan gambar yang valid.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format berkas gambar tidak didukung atau korup.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses kanvas gambar.'));
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ContributorDashboard: React.FC<ContributorDashboardProps> = ({
  currentUser,
  onSelectArticle,
  initialTab = 'daftar',
}) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'tulis' | 'pedoman' | 'profil' | 'notifikasi'>(initialTab);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'revision' | 'approved' | 'rejected' | 'draft'>('all');

  // Notifications State
  const [notifications, setNotifications] = useState<WriterNotification[]>(() =>
    DmlStore.getWriterNotifications(currentUser.id)
  );
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'revision' | 'approved'>('all');

  // Sync initialTab when prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Subscribe to real-time notifications
  useEffect(() => {
    setNotifications(DmlStore.getWriterNotifications(currentUser.id));
    DmlStore.refreshNotificationsFromCloud(currentUser.id).catch(() => {});
    const unsubscribe = DmlStore.subscribe(() => {
      setNotifications(DmlStore.getWriterNotifications(currentUser.id));
    });
    return unsubscribe;
  }, [currentUser.id]);

  // Article Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('Kisah Inspiratif');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80');
  const [imageAttribution, setImageAttribution] = useState('Arsip Dokumentasi Pribadi / Berlisensi Bebas');
  const [sourcesText, setSourcesText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cover Photo states & refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [showCoverPresetsModal, setShowCoverPresetsModal] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  // Inline Article Photo Insertion states & refs
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inlinePhotoFileInputRef = useRef<HTMLInputElement>(null);
  const [showInlinePhotoModal, setShowInlinePhotoModal] = useState(false);
  const [inlinePhotoMethod, setInlinePhotoMethod] = useState<'upload' | 'preset' | 'url'>('upload');
  const [inlinePhotoUrl, setInlinePhotoUrl] = useState('');
  const [inlinePhotoCaption, setInlinePhotoCaption] = useState('');
  const [inlinePhotoAttribution, setInlinePhotoAttribution] = useState('');
  const [isUploadingInlinePhoto, setIsUploadingInlinePhoto] = useState(false);
  const [inlinePhotoError, setInlinePhotoError] = useState<string | null>(null);
  const [inlinePhotoSuccessMsg, setInlinePhotoSuccessMsg] = useState<string | null>(null);

  // Profile Form states
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileBio, setProfileBio] = useState(currentUser.bio || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser.avatarUrl || PRESET_AVATARS[0].url);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [profilePortfolioUrl, setProfilePortfolioUrl] = useState(currentUser.portfolioUrl || '');
  const [profileCategories, setProfileCategories] = useState<string[]>(currentUser.preferredCategories || ['Opini dan Gagasan', 'Kisah Inspiratif']);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Writer Password Form States
  const [writerCurrentPassword, setWriterCurrentPassword] = useState('');
  const [writerNewPassword, setWriterNewPassword] = useState('');
  const [writerConfirmPassword, setWriterConfirmPassword] = useState('');
  const [showWriterCurrentPassword, setShowWriterCurrentPassword] = useState(false);
  const [showWriterNewPassword, setShowWriterNewPassword] = useState(false);
  const [showWriterConfirmPassword, setShowWriterConfirmPassword] = useState(false);
  const [isWriterChangingPassword, setIsWriterChangingPassword] = useState(false);
  const [writerPasswordMessage, setWriterPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleWriterChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWriterChangingPassword) return;
    setWriterPasswordMessage(null);

    if (!writerCurrentPassword) {
      setWriterPasswordMessage({ type: 'error', text: 'Silakan masukkan kata sandi saat ini (lama).' });
      return;
    }

    if (!writerNewPassword || writerNewPassword.length < 6) {
      setWriterPasswordMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }

    if (writerNewPassword !== writerConfirmPassword) {
      setWriterPasswordMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok. Periksa kembali pengetikan Anda.' });
      return;
    }

    if (writerCurrentPassword === writerNewPassword) {
      setWriterPasswordMessage({ type: 'error', text: 'Kata sandi baru tidak boleh sama dengan kata sandi saat ini.' });
      return;
    }

    setIsWriterChangingPassword(true);
    try {
      const res = await DmlStore.changePassword(writerCurrentPassword, writerNewPassword);
      if (res.success) {
        setWriterPasswordMessage({
          type: 'success',
          text: 'Alhamdulillah! Kata sandi akun Anda berhasil diperbarui dengan aman.',
        });
        setWriterCurrentPassword('');
        setWriterNewPassword('');
        setWriterConfirmPassword('');
        setTimeout(() => setWriterPasswordMessage(null), 5000);
      } else {
        setWriterPasswordMessage({ type: 'error', text: res.error || 'Gagal mengubah kata sandi.' });
      }
    } catch (err: any) {
      setWriterPasswordMessage({ type: 'error', text: err?.message || 'Terjadi kesalahan sistem saat memperbarui kata sandi.' });
    } finally {
      setIsWriterChangingPassword(false);
    }
  };

  // Sync profile form when currentUser.id changes
  const prevUserIdRef = useRef<string>(currentUser.id);
  useEffect(() => {
    if (prevUserIdRef.current !== currentUser.id) {
      prevUserIdRef.current = currentUser.id;
      setProfileName(currentUser.name || '');
      setProfileBio(currentUser.bio || '');
      setProfileAvatarUrl(currentUser.avatarUrl || PRESET_AVATARS[0].url);
      setProfilePhone(currentUser.phone || '');
      setProfilePortfolioUrl(currentUser.portfolioUrl || '');
      setProfileCategories(currentUser.preferredCategories || ['Opini dan Gagasan', 'Kisah Inspiratif']);
    }
  }, [currentUser.id, currentUser.name, currentUser.bio, currentUser.avatarUrl, currentUser.phone, currentUser.portfolioUrl, currentUser.preferredCategories]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSavingProfile) return;

    if (!profileName.trim() || profileName.trim().length < 2) {
      setProfileErrorMsg('Nama penulis minimal 2 karakter.');
      setProfileSuccessMsg(null);
      return;
    }

    if (!profileBio.trim() || profileBio.trim().length < 10) {
      setProfileErrorMsg('Biografi ringkas minimal 10 karakter agar pembaca mengenal latar belakang Anda.');
      setProfileSuccessMsg(null);
      return;
    }

    setIsSavingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    try {
      const res = await DmlStore.updateUserProfile(currentUser.id, {
        name: profileName,
        bio: profileBio,
        avatarUrl: profileAvatarUrl,
        phone: profilePhone,
        portfolioUrl: profilePortfolioUrl,
        preferredCategories: profileCategories,
      });

      if (res.success) {
        setProfileSuccessMsg('Alhamdulillah! Profil dan foto penulis Anda berhasil diperbarui di database dan seluruh artikel Anda.');
      } else {
        setProfileErrorMsg(res.error || 'Gagal memperbarui profil.');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert and compress to crisp square avatar
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        canvas.width = 300;
        canvas.height = 300;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 300, 300);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfileAvatarUrl(compressedDataUrl);
          setProfileSuccessMsg('Foto baru berhasil diunggah & diproses! Klik "Simpan Perubahan Profil" untuk menerapkan.');
          setProfileErrorMsg(null);
        } else {
          setProfileAvatarUrl(uploadEvent.target?.result as string);
          setProfileSuccessMsg('Foto baru berhasil dipilih! Klik "Simpan Perubahan Profil" untuk menerapkan.');
          setProfileErrorMsg(null);
        }
      };
      img.onerror = () => {
        setProfileAvatarUrl(uploadEvent.target?.result as string);
        setProfileSuccessMsg('Foto baru berhasil dipilih! Klik "Simpan Perubahan Profil" untuk menerapkan.');
        setProfileErrorMsg(null);
      };
      img.src = uploadEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler for uploading cover photo directly from device
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const dataUrl = await compressImageFile(file, 1200, 0.82);
      setCoverImage(dataUrl);
      if (!imageAttribution || imageAttribution.includes('Unsplash') || imageAttribution.includes('Arsip Dokumentasi')) {
        setImageAttribution(`Dokumentasi Penulis (${currentUser.name || 'Pribadi'})`);
      }
    } catch (err: any) {
      setCoverUploadError(err?.message || 'Gagal memproses unggahan foto sampul.');
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Handler for uploading inline photo from device
  const handleInlinePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingInlinePhoto(true);
    setInlinePhotoError(null);
    try {
      const dataUrl = await compressImageFile(file, 960, 0.8);
      setInlinePhotoUrl(dataUrl);
      if (!inlinePhotoAttribution) {
        setInlinePhotoAttribution(`Dokumentasi Penulis (${currentUser.name || 'Pribadi'})`);
      }
    } catch (err: any) {
      setInlinePhotoError(err?.message || 'Gagal memproses berkas foto.');
    } finally {
      setIsUploadingInlinePhoto(false);
      if (inlinePhotoFileInputRef.current) inlinePhotoFileInputRef.current.value = '';
    }
  };

  // Handler for inserting inline photo into article content textarea
  const handleInsertInlinePhoto = () => {
    if (!inlinePhotoUrl.trim()) {
      setInlinePhotoError('Silakan pilih foto dari galeri, unggah berkas, atau masukkan tautan URL terlebih dahulu.');
      return;
    }

    const captionPart = inlinePhotoCaption.trim();
    const attrPart = inlinePhotoAttribution.trim();
    const altText = [captionPart, attrPart].filter(Boolean).join(' | ') || 'Foto artikel';
    const markdownSnippet = `\n\n![${altText}](${inlinePhotoUrl.trim()})\n\n`;

    const textarea = contentTextareaRef.current;
    if (textarea) {
      const startPos = textarea.selectionStart ?? content.length;
      const endPos = textarea.selectionEnd ?? content.length;
      const before = content.substring(0, startPos);
      const after = content.substring(endPos);
      const updated = before + markdownSnippet + after;
      setContent(updated);
      setTimeout(() => {
        textarea.focus();
        const cursor = startPos + markdownSnippet.length;
        textarea.setSelectionRange(cursor, cursor);
      }, 50);
    } else {
      setContent(prev => prev + markdownSnippet);
    }

    // Reset inline modal
    setInlinePhotoUrl('');
    setInlinePhotoCaption('');
    setInlinePhotoAttribution('');
    setInlinePhotoError(null);
    setShowInlinePhotoModal(false);
    setInlinePhotoSuccessMsg('Foto berhasil disisipkan ke dalam naskah!');
    setTimeout(() => setInlinePhotoSuccessMsg(null), 4000);
  };

  // Remove photo snippet from content
  const handleRemovePhotoFromContent = (photoSnippet: string) => {
    setContent(prev => prev.replace(photoSnippet, '').replace(/\n\n\n+/g, '\n\n'));
  };

  // Extract all inline photos from markdown
  const detectedInlinePhotos: { fullMatch: string; caption: string; attribution: string; url: string }[] = [];
  const photoRegex = /!\[(.*?)\]\((.*?)\)/g;
  let photoMatch;
  while ((photoMatch = photoRegex.exec(content)) !== null) {
    const rawAlt = photoMatch[1];
    const url = photoMatch[2];
    const parts = rawAlt.split('|').map(s => s.trim());
    detectedInlinePhotos.push({
      fullMatch: photoMatch[0],
      caption: parts[0] || '',
      attribution: parts.length > 1 ? parts.slice(1).join(' | ') : '',
      url,
    });
  }

  const authorArticles = DmlStore.getArticlesByAuthor(currentUser.id);

  // Stats calculation
  const totalCount = authorArticles.length;
  const publishedCount = authorArticles.filter(a => a.status === 'published' || a.status === 'approved').length;
  const inReviewCount = authorArticles.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const revisionCount = authorArticles.filter(a => a.status === 'revision_requested').length;
  const rejectedCount = authorArticles.filter(a => a.status === 'rejected').length;
  const draftCount = authorArticles.filter(a => a.status === 'draft').length;

  const handleEdit = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setSummary(art.summary);
    setContent(art.content);
    setCoverImage(art.coverImage);
    setImageAttribution(art.imageAttribution || '');
    setSourcesText(art.sources ? art.sources.join('\n') : '');
    setTagsText(art.tags ? art.tags.join(', ') : '');
    setAgreeTerms(true);
    setActiveTab('tulis');
    setFormMessage(null);
  };

  const handleResetForm = () => {
    setEditingArticleId(null);
    setTitle('');
    setCategory('Kisah Inspiratif');
    setSummary('');
    setContent('');
    setCoverImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80');
    setImageAttribution('Arsip Dokumentasi Pribadi / Bebas Hak Cipta');
    setSourcesText('');
    setTagsText('');
    setAgreeTerms(false);
    setFormMessage(null);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (asSubmit: boolean) => {
    if (isSaving) return;
    setFormMessage(null);

    if (asSubmit && !agreeTerms) {
      setFormMessage({
        type: 'error',
        text: 'Anda wajib menyetujui Pedoman Penulisan & Etika Publikasi sebelum mengajukan tulisan.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const sources = sourcesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const tags = tagsText
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const result = await DmlStore.saveArticle(
        {
          id: editingArticleId || undefined,
          title,
          category,
          summary,
          content,
          coverImage,
          imageAttribution,
          sources,
          tags,
        },
        asSubmit
      );

      if (result.success) {
        setFormMessage({
          type: 'success',
          text: asSubmit
            ? 'Alhamdulillah! Naskah berhasil diajukan ke antrean meja redaksi. Editor akan menelaah naskah Anda.'
            : 'Draf tulisan berhasil disimpan.',
        });
        if (asSubmit) {
          handleResetForm();
          setTimeout(() => setActiveTab('daftar'), 1200);
        }
      } else {
        setFormMessage({
          type: 'error',
          text: result.error || 'Terjadi kesalahan saat menyimpan naskah.',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await DmlStore.deleteArticle(id);
  };

  const unreadNotifs = notifications.filter(n => !n.isRead);
  const unreadNotifsCount = unreadNotifs.length;
  const revisionNotifsCount = notifications.filter(n => n.type === 'revision_requested').length;
  const approvedNotifsCount = notifications.filter(n => n.type === 'approved').length;

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'unread') return !n.isRead;
    if (notifFilter === 'revision') return n.type === 'revision_requested';
    if (notifFilter === 'approved') return n.type === 'approved';
    return true;
  });

  const handleOpenArticleFromNotification = (notif: WriterNotification) => {
    DmlStore.markNotificationAsRead(notif.id);
    const allArticles = DmlStore.getArticles();
    const found = allArticles.find(a => a.id === notif.articleId);
    if (found) {
      if (notif.type === 'approved' || found.status === 'published' || found.status === 'approved') {
        onSelectArticle(found);
      } else {
        handleEdit(found);
      }
    } else {
      setActiveTab('daftar');
    }
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 ring-1 ring-amber-400/30 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Pending (Menunggu Review)</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 ring-1 ring-amber-400/30 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Pending (Sedang Ditelaah)</span>
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300 ring-1 ring-blue-400/30 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>Needs Revision (Perlu Revisi)</span>
          </span>
        );
      case 'approved':
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 ring-1 ring-emerald-400/30 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Approved (Disetujui & Terbit)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300 ring-1 ring-rose-400/30 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Rejected (Ditolak)</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Draf (Belum Diajukan)</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Author Header Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatarUrl || profileAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=140&q=80'}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-sm transition-transform group-hover:scale-105"
              />
              <button
                onClick={() => setActiveTab('profil')}
                className="absolute inset-0 rounded-2xl bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-bold gap-1"
                title="Ganti Foto Profil"
              >
                <Camera className="w-4 h-4 text-amber-300" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold font-serif-editorial text-slate-900">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Kontributor
                </span>
                {currentUser.approvalStatus === 'pending' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                    Menunggu ACC Admin
                  </span>
                )}
                {currentUser.approvalStatus === 'approved' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Penulis Aktif (ACC)
                  </span>
                )}
                {currentUser.approvalStatus === 'rejected' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Pengajuan Ditolak
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 max-w-xl">{currentUser.bio}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                <span>Email: {currentUser.email}</span>
                {currentUser.phone && <span>• Telp/WA: {currentUser.phone}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto justify-stretch md:justify-end">
            <button
              onClick={() => setActiveTab('notifikasi')}
              className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border flex-1 md:flex-initial ${
                activeTab === 'notifikasi'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
              title="Pemberitahuan & Umpan Balik Redaksi"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-amber-700" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </div>
              <span>Pemberitahuan</span>
              {unreadNotifsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                  {unreadNotifsCount} Baru
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profil')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200 flex-1 md:flex-initial"
            >
              <UserIcon className="w-4 h-4 text-amber-600" />
              <span>Edit Profil & Foto</span>
            </button>

            <button
              onClick={() => {
                handleResetForm();
                setActiveTab('tulis');
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all flex-1 md:flex-initial"
            >
              <Edit3 className="w-4 h-4" />
              <span>Tulis Artikel Baru</span>
            </button>
          </div>
        </div>

        {/* Editorial Notification Alert Banners */}
        {notifications.some(n => n.type === 'revision_requested' && !n.isRead) && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-xs">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-blue-950 text-sm">
                    Pemberitahuan Redaksi: Naskah Memerlukan Revisi
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-200 text-blue-900">
                    Perlu Ditindaklanjuti
                  </span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed">
                  Editor telah menelaah naskah Anda dan memberikan catatan perbaikan. Silakan buka tab pemberitahuan untuk menyempurnakan naskah agar dapat segera diterbitkan.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  setNotifFilter('revision');
                  setActiveTab('notifikasi');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>Lihat Catatan & Perbaiki</span>
              </button>
            </div>
          </div>
        )}

        {notifications.some(n => n.type === 'approved' && !n.isRead) && !notifications.some(n => n.type === 'revision_requested' && !n.isRead) && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-emerald-950 text-sm">
                    Kabar Baik: Naskah Anda Telah Disetujui & Diterbitkan!
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">
                    Resmi Terbit
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  Alhamdulillah! Naskah Anda telah selesai ditelaah oleh Dewan Redaksi dan resmi diterbitkan di portal Rumah Dessa Mentari.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  setNotifFilter('approved');
                  setActiveTab('notifikasi');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Lihat Pemberitahuan</span>
              </button>
            </div>
          </div>
        )}

        {/* Pending ACC Alert Banner */}
        {currentUser.approvalStatus === 'pending' && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start gap-4 animate-in fade-in">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 shrink-0">
              <Clock className="w-6 h-6 text-amber-700 animate-pulse" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-amber-950 text-sm">Status Akun Penulis: Menunggu Persetujuan (ACC)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">Menunggu Tinjauan</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Pendaftaran akun penulis Anda berhasil dicatat dan data otomatis dikirimkan ke email Administrator: <strong>santosodeni3@gmail.com</strong> (Bpk. <strong>Deni Santoso, M.M.</strong>).
              </p>
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1 mt-2">
                <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Alur & Ketentuan Selama Menunggu ACC:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  <li>Anda sudah dapat <strong>menyusun dan menyimpan draf tulisan</strong> sebanyak yang Anda inginkan.</li>
                  <li>Fitur pengajuan naskah ke antrean meja redaksi akan otomatis aktif segera setelah disetujui (ACC) oleh Administrator Deni Santoso, M.M.</li>
                  <li>Untuk menguji persetujuan akun penulis, Anda dapat masuk sebagai Admin (Deni Santoso, M.M.) dan menyetujui akun melalui menu <em>Persetujuan Penulis (ACC)</em>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Stats Strip with 4 Review Badges & Drafts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Total Tulisan</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalCount}</p>
          </div>
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-300">
            <span className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              Pending (Kuning)
            </span>
            <p className="text-2xl font-bold text-amber-900 mt-1">{inReviewCount}</p>
          </div>
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-300">
            <span className="text-xs text-blue-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              Needs Revision (Biru)
            </span>
            <p className="text-2xl font-bold text-blue-900 mt-1">{revisionCount}</p>
          </div>
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-300">
            <span className="text-xs text-emerald-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Approved (Hijau)
            </span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-300">
            <span className="text-xs text-rose-900 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              Rejected (Merah)
            </span>
            <p className="text-2xl font-bold text-rose-900 mt-1">{rejectedCount}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-300">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
              Draf Disimpan
            </span>
            <p className="text-2xl font-bold text-slate-700 mt-1">{draftCount}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex space-x-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('daftar')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'daftar'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tulisan Saya ({totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifikasi')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'notifikasi'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <span>Pemberitahuan Redaksi</span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-2xs">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tulis')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'tulis'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>{editingArticleId ? 'Edit Naskah' : 'Ruang Tulis / Draf Baru'}</span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'profil'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil & Foto Saya</span>
          </button>

          <button
            onClick={() => setActiveTab('pedoman')}
            className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 shrink-0 ${
              activeTab === 'pedoman'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pedoman Redaksi & Alur Kurasi</span>
          </button>
        </div>

        {/* TAB 1: LIST ARTICLES */}
        {activeTab === 'daftar' && (
          <div className="space-y-6">
            {/* Approval Status Legend / Guide Banner */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Panduan Indikator 'Approval Status' (Status Penelaahan Redaksi)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Semua naskah dikurasi langsung oleh Meja Redaksi (Bpk. Deni Santoso, M.M.)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-bold text-amber-950 block">Pending (Kuning)</span>
                    <span className="text-[11px] text-amber-800 leading-tight block">
                      Masuk antrean & sedang ditelaah tim editor.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-blue-950 block">Needs Revision (Biru)</span>
                    <span className="text-[11px] text-blue-800 leading-tight block">
                      Memerlukan perbaikan berdasarkan masukan editor.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block">Approved (Hijau)</span>
                    <span className="text-[11px] text-emerald-800 leading-tight block">
                      Naskah disetujui dan resmi terbit di portal.
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 flex items-start gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-950 block">Rejected (Merah)</span>
                    <span className="text-[11px] text-rose-800 leading-tight block">
                      Belum memenuhi kriteria seleksi redaksi.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold px-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Status:</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({totalCount})
                </button>

                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-2xs'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  Pending ({inReviewCount})
                </button>

                <button
                  onClick={() => setStatusFilter('revision')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'revision'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  Needs Revision ({revisionCount})
                </button>

                <button
                  onClick={() => setStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  Approved ({publishedCount})
                </button>

                <button
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
                  Rejected ({rejectedCount})
                </button>

                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    statusFilter === 'draft'
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                  Draf ({draftCount})
                </button>
              </div>
            </div>

            {/* Articles List */}
            {authorArticles.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">Belum Ada Tulisan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  Anda belum pernah menyimpan draf atau mengajukan artikel. Mari bagikan inspirasi pertama Anda!
                </p>
                <button
                  onClick={() => setActiveTab('tulis')}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Mulai Menulis Sekarang
                </button>
              </div>
            ) : authorArticles.filter(art => {
                if (statusFilter === 'pending') return art.status === 'submitted' || art.status === 'under_review';
                if (statusFilter === 'revision') return art.status === 'revision_requested';
                if (statusFilter === 'approved') return art.status === 'published' || art.status === 'approved';
                if (statusFilter === 'rejected') return art.status === 'rejected';
                if (statusFilter === 'draft') return art.status === 'draft';
                return true;
              }).length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200 space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada artikel dengan filter status yang dipilih.
                </p>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="text-xs text-amber-700 hover:text-amber-800 font-bold underline"
                >
                  Tampilkan Semua Tulisan
                </button>
              </div>
            ) : (
              authorArticles
                .filter(art => {
                  if (statusFilter === 'pending') return art.status === 'submitted' || art.status === 'under_review';
                  if (statusFilter === 'revision') return art.status === 'revision_requested';
                  if (statusFilter === 'approved') return art.status === 'published' || art.status === 'approved';
                  if (statusFilter === 'rejected') return art.status === 'rejected';
                  if (statusFilter === 'draft') return art.status === 'draft';
                  return true;
                })
                .map(article => {
                  const words = article.content.split(/\s+/).filter(Boolean).length;
                  const estReadingTime = article.readingTime || Math.max(1, Math.ceil(words / 200));

                  return (
                    <div
                      key={article.id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-300 transition-all shadow-xs space-y-4"
                    >
                      {/* Top Bar: Badges & Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(article.status)}
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            {article.category}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {estReadingTime} menit baca ({words} kata)
                          </span>
                          {article.submittedAt && (
                            <span className="text-[11px] text-slate-400">
                              Diajukan: {new Date(article.submittedAt).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {(article.status === 'published' || article.status === 'approved') && (
                            <button
                              onClick={() => onSelectArticle(article)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat di Web
                            </button>
                          )}

                          {(article.status === 'draft' || article.status === 'revision_requested') && (
                            <button
                              onClick={() => handleEdit(article)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>{article.status === 'revision_requested' ? 'Perbaiki Naskah' : 'Edit / Ajukan'}</span>
                            </button>
                          )}

                          {article.status === 'draft' && (
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Hapus draf ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <div>
                        <h3 className="font-serif-editorial text-lg sm:text-xl font-bold text-slate-900 hover:text-amber-800 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      {/* APPROVAL STATUS TRACKER COMPONENT */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5 bg-slate-50/80 -mx-6 -mb-6 p-6 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                Approval Status Tracker
                                <span className="text-[10px] font-normal lowercase tracking-normal text-slate-500 hidden sm:inline">
                                  (alur penelaahan redaksi)
                                </span>
                              </h4>
                            </div>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600">
                            {article.status === 'draft' && 'Tahap 1 dari 4: Penyusunan Draf'}
                            {article.status === 'submitted' && 'Tahap 2 dari 4: Masuk Antrean Meja Redaksi'}
                            {article.status === 'under_review' && 'Tahap 3 dari 4: Sedang Ditelaah Dewan Redaksi'}
                            {article.status === 'revision_requested' && 'Tahap 4: Needs Revision (Menunggu Perbaikan Penulis)'}
                            {(article.status === 'published' || article.status === 'approved') && 'Tahap 4: Approved (Disetujui & Diterbitkan)'}
                            {article.status === 'rejected' && 'Tahap 4: Rejected (Belum Memenuhi Standar Seleksi)'}
                          </div>
                        </div>

                        {/* Multi-step Visual Stepper */}
                        <div className="py-2 px-1">
                          <div className="grid grid-cols-4 relative gap-2 sm:gap-4">
                            {/* Connector line behind steps */}
                            <div className="absolute top-4 left-6 right-6 h-1 -translate-y-1/2 bg-slate-200 z-0">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  article.status === 'draft'
                                    ? 'w-0'
                                    : article.status === 'submitted'
                                    ? 'w-1/3 bg-amber-400'
                                    : article.status === 'under_review'
                                    ? 'w-2/3 bg-amber-400'
                                    : article.status === 'revision_requested'
                                    ? 'w-full bg-blue-500'
                                    : article.status === 'published' || article.status === 'approved'
                                    ? 'w-full bg-emerald-500'
                                    : 'w-full bg-rose-500'
                                }`}
                              />
                            </div>

                            {/* Step 1: Draft */}
                            <div className="flex flex-col items-center text-center relative z-10">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-white shadow-xs">
                                <Check className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-800 mt-1.5">1. Draf Dibuat</span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">Disusun Penulis</span>
                            </div>

                            {/* Step 2: Diajukan (Submitted / Pending) */}
                            <div className="flex flex-col items-center text-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  article.status === 'draft'
                                    ? 'bg-white border-2 border-slate-300 text-slate-400'
                                    : article.status === 'submitted'
                                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 ring-4 ring-amber-300/40 animate-pulse'
                                    : 'bg-emerald-500 text-white shadow-xs'
                                }`}
                              >
                                {article.status === 'draft' ? (
                                  '2'
                                ) : article.status === 'submitted' ? (
                                  <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-bold mt-1.5 ${
                                  article.status === 'submitted'
                                    ? 'text-amber-800 font-extrabold'
                                    : article.status === 'draft'
                                    ? 'text-slate-400'
                                    : 'text-slate-800'
                                }`}
                              >
                                2. Diajukan
                              </span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">
                                {article.status === 'submitted' ? 'Antrean Redaksi' : article.status === 'draft' ? 'Belum Dikirim' : 'Terkirim'}
                              </span>
                            </div>

                            {/* Step 3: Telaah Redaksi (Under Review / Pending) */}
                            <div className="flex flex-col items-center text-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  article.status === 'draft' || article.status === 'submitted'
                                    ? 'bg-white border-2 border-slate-300 text-slate-400'
                                    : article.status === 'under_review'
                                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-900 ring-4 ring-amber-300/40 animate-pulse'
                                    : 'bg-emerald-500 text-white shadow-xs'
                                }`}
                              >
                                {article.status === 'draft' || article.status === 'submitted' ? (
                                  '3'
                                ) : article.status === 'under_review' ? (
                                  <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-bold mt-1.5 ${
                                  article.status === 'under_review'
                                    ? 'text-amber-800 font-extrabold'
                                    : article.status === 'draft' || article.status === 'submitted'
                                    ? 'text-slate-400'
                                    : 'text-slate-800'
                                }`}
                              >
                                3. Telaah Redaksi
                              </span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">
                                {article.status === 'under_review' ? 'Sedang Dikurasi' : 'Verifikasi EYD'}
                              </span>
                            </div>

                            {/* Step 4: Keputusan Kurasi (Approved / Revision / Rejected / Waiting) */}
                            <div className="flex flex-col items-center text-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                                  article.status === 'published' || article.status === 'approved'
                                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-300/50'
                                    : article.status === 'revision_requested'
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-300/50'
                                    : article.status === 'rejected'
                                    ? 'bg-rose-600 text-white ring-4 ring-rose-300/50'
                                    : article.status === 'submitted' || article.status === 'under_review'
                                    ? 'bg-amber-50 border-2 border-dashed border-amber-400 text-amber-700'
                                    : 'bg-white border-2 border-slate-300 text-slate-400'
                                }`}
                              >
                                {article.status === 'published' || article.status === 'approved' ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : article.status === 'revision_requested' ? (
                                  <AlertCircle className="w-4 h-4" />
                                ) : article.status === 'rejected' ? (
                                  <XCircle className="w-4 h-4" />
                                ) : article.status === 'submitted' || article.status === 'under_review' ? (
                                  <Clock className="w-4 h-4" />
                                ) : (
                                  '4'
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-bold mt-1.5 ${
                                  article.status === 'published' || article.status === 'approved'
                                    ? 'text-emerald-700 font-extrabold'
                                    : article.status === 'revision_requested'
                                    ? 'text-blue-700 font-extrabold'
                                    : article.status === 'rejected'
                                    ? 'text-rose-700 font-extrabold'
                                    : article.status === 'submitted' || article.status === 'under_review'
                                    ? 'text-amber-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {article.status === 'published' || article.status === 'approved'
                                  ? '4. Approved'
                                  : article.status === 'revision_requested'
                                  ? '4. Needs Revision'
                                  : article.status === 'rejected'
                                  ? '4. Rejected'
                                  : '4. Keputusan'}
                              </span>
                              <span className="text-[10px] text-slate-500 hidden sm:inline">
                                {article.status === 'published' || article.status === 'approved'
                                  ? 'Resmi Terbit'
                                  : article.status === 'revision_requested'
                                  ? 'Perlu Revisi'
                                  : article.status === 'rejected'
                                  ? 'Belum Lolos'
                                  : 'Menunggu Hasil'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Detailed Context Notice per Status */}
                        {(article.status === 'submitted' || article.status === 'under_review') && (
                          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                                Status: Pending (Kuning) — Menunggu Penelaahan Meja Redaksi
                              </span>
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                                Antrean Kurasi Aktif
                              </span>
                            </div>
                            <p className="leading-relaxed text-amber-900/90">
                              Naskah Anda telah masuk antrean kurasi dan saat ini sedang ditelaah oleh Dewan Redaksi (Bpk. <strong>Deni Santoso, M.M.</strong>). Tim editor meneliti kepatuhan etika jurnalistik, orisinalitas ide, serta verifikasi sumber rujukan.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                              {article.submittedAt && (
                                <span>Waktu Pengajuan: {new Date(article.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</span>
                              )}
                              <span>Estimasi penelaahan: 1–2 hari kerja</span>
                            </div>
                          </div>
                        )}

                        {article.status === 'revision_requested' && (
                          <div className="p-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 text-xs space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-blue-900 text-sm">
                                <AlertCircle className="w-4 h-4 text-blue-700" />
                                Status: Needs Revision (Biru) — Masukan Perbaikan Meja Redaksi
                              </span>
                              <button
                                onClick={() => handleEdit(article)}
                                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs w-fit transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Buka Editor & Perbaiki Naskah</span>
                              </button>
                            </div>
                            <p className="leading-relaxed text-blue-900/90">
                              Dewan redaksi telah menelaah naskah Anda. Artikel ini memiliki potensi gagasan yang baik, namun memerlukan penyempurnaan sesuai catatan redaksi di bawah ini sebelum dapat diterbitkan:
                            </p>
                            {article.revisionNotes && (
                              <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                                  Catatan Masukan Editor:
                                </span>
                                <p className="text-xs text-slate-800 italic leading-relaxed pl-2 border-l-2 border-blue-500">
                                  "{article.revisionNotes}"
                                </p>
                              </div>
                            )}
                            <div className="text-[11px] text-blue-800">
                              💡 <em>Setelah selesai memperbaiki naskah, tekan tombol "Ajukan ke Meja Redaksi" di halaman editor untuk proses telaah ulang.</em>
                            </div>
                          </div>
                        )}

                        {(article.status === 'published' || article.status === 'approved') && (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                Status: Approved (Hijau) — Disetujui & Resmi Diterbitkan
                              </span>
                              <button
                                onClick={() => onSelectArticle(article)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs w-fit transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Artikel di Portal</span>
                              </button>
                            </div>
                            <p className="leading-relaxed text-emerald-900/90">
                              Alhamdulillah! Naskah artikel Anda telah memenuhi seluruh kriteria kurasi, etika jurnalistik, dan standar penerbitan Rumah Dessa Mentari. Tulisan kini aktif di portal publik dan dapat dinikmati masyarakat luas.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-800 pt-1 border-t border-emerald-200/60">
                              {article.publishedAt && (
                                <span>Tanggal Terbit: {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              )}
                              <span>Total Pembaca: {article.views || 0} kali dilihat</span>
                              <span>Rubrik: {article.category}</span>
                            </div>
                          </div>
                        )}

                        {article.status === 'rejected' && (
                          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5 text-rose-900 text-sm">
                                <XCircle className="w-4 h-4 text-rose-700" />
                                Status: Rejected (Merah) — Belum Lolos Seleksi Publikasi
                              </span>
                            </div>
                            <p className="leading-relaxed text-rose-900/90">
                              Mohon maaf, naskah ini belum memenuhi kriteria penerbitan redaksi untuk saat ini. Jangan berkecil hati, Anda tetap dapat menyusun artikel dengan topik atau perspektif baru lainnya.
                            </p>
                            {article.revisionNotes && (
                              <div className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                                  Alasan / Catatan Dewan Redaksi:
                                </span>
                                <p className="text-xs text-slate-800 italic leading-relaxed pl-2 border-l-2 border-rose-500">
                                  "{article.revisionNotes}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {article.status === 'draft' && (
                          <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-300 text-slate-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5 text-slate-800">
                                <FileText className="w-4 h-4 text-slate-600" />
                                Status: Draf Mandiri (Belum Diajukan ke Redaksi)
                              </span>
                              <button
                                onClick={() => handleEdit(article)}
                                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 underline"
                              >
                                Lanjutkan Menulis & Ajukan <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-[11px]">
                              Naskah ini tersimpan di akun Anda dan belum masuk antrean kurasi. Bila tulisan telah rampung, klik 'Edit / Ajukan' lalu pilih 'Ajukan ke Meja Redaksi' untuk memulai proses review.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* TAB 2: WRITE / EDIT FORM */}
        {activeTab === 'tulis' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
                  {editingArticleId ? 'Sunting Naskah Tulisan' : 'Buat Naskah Artikel Baru'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Naskah akan melewati proses kurasi editor sebelum diterbitkan resmi ke publik.
                </p>
              </div>

              {editingArticleId && (
                <button
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
                >
                  Batal / Tulis Naskah Lain
                </button>
              )}
            </div>

            {formMessage && (
              <div
                className={`p-4 rounded-xl text-xs font-medium leading-relaxed ${
                  formMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Judul Artikel *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Menumbuhkan Daya Kritis Melalui Kebiasaan Membaca Sejak Dini"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-medium"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori / Rubrik *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ArticleCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm bg-white"
                  >
                    {CATEGORIES_LIST.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cover Image Management */}
                <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                        Foto Sampul Naskah (Cover Image) *
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Pilih foto beresolusi tajam yang merepresentasikan isi tulisan Anda.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        disabled={isUploadingCover}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="Unggah berkas foto dari penyimpanan komputer atau HP"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingCover ? 'Mengompres...' : 'Unggah Foto'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCoverPresetsModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                        title="Pilih dari koleksi foto bebas royalti yang sesuai dengan kategori"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pilih Galeri</span>
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input for cover */}
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleCoverFileUpload}
                  />

                  {coverUploadError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{coverUploadError}</span>
                    </div>
                  )}

                  {/* Cover preview and attribution */}
                  <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                    <div className="w-full sm:w-52 h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative group">
                      <img
                        src={coverImage}
                        alt="Sampul Artikel"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded-md font-medium">
                        Foto Sampul
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Tautan URL Gambar Sampul
                        </label>
                        <input
                          type="text"
                          value={coverImage.startsWith('data:') ? 'Foto terunggah dari perangkat (Data Base64 Terkompresi)' : coverImage}
                          onChange={e => setCoverImage(e.target.value)}
                          disabled={coverImage.startsWith('data:')}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:border-amber-500 text-xs text-slate-800 font-mono disabled:opacity-80"
                        />
                        {coverImage.startsWith('data:') && (
                          <button
                            type="button"
                            onClick={() => setCoverImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80')}
                            className="text-[11px] text-rose-600 hover:text-rose-800 underline mt-0.5 font-medium cursor-pointer"
                          >
                            Kembalikan ke foto daring bawaan
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Atribusi / Hak Cipta Foto Sampul *
                        </label>
                        <input
                          type="text"
                          value={imageAttribution}
                          onChange={e => setImageAttribution(e.target.value)}
                          placeholder="Contoh: Dokumentasi Penulis / Foto: Budi Santoso / Unsplash License"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:border-amber-500 text-xs text-slate-800"
                        />
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Sertakan sumber pemotret atau lisensi hak cipta agar sesuai dengan etika publikasi redaksi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ringkasan Artikel (Lead / Abstrak) *
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Tulis 1-2 kalimat pengantar yang memikat pembaca..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* ARTICLE CONTENT WITH PHOTO INSERTION TOOLBAR */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                      Isi Artikel Lengkap *
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Gunakan '### ' untuk sub-judul, '- ' untuk poin-poin.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {detectedInlinePhotos.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs">
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{detectedInlinePhotos.length} foto disisipkan</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowInlinePhotoModal(true);
                        setInlinePhotoError(null);
                        setInlinePhotoMethod('upload');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>+ Sisipkan Foto ke Naskah</span>
                    </button>
                  </div>
                </div>

                {inlinePhotoSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{inlinePhotoSuccessMsg}</span>
                  </div>
                )}

                <textarea
                  ref={contentTextareaRef}
                  rows={13}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tuliskan cerita, gagasan, atau wawasan Anda di sini. Klik tombol '+ Sisipkan Foto ke Naskah' di atas untuk menyisipkan foto dokumentasi beserta keterangan & hak cipta langsung di posisi kursor teks Anda..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-sans leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Panjang: {content.split(/\s+/).filter(Boolean).length} kata</span>
                  <span>Perkiraan baca: {Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} menit (200 kpm)</span>
                </div>

                {/* Gallery of photos detected in the article content */}
                {detectedInlinePhotos.length > 0 && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        Daftar Foto yang Terpasang di Naskah ({detectedInlinePhotos.length}):
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        Format markdown: ![Keterangan | Sumber](url)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {detectedInlinePhotos.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2.5 text-xs shadow-2xs group hover:border-amber-300 transition-all"
                        >
                          <img
                            src={item.url}
                            alt={item.caption || 'Foto'}
                            className="w-14 h-14 object-cover rounded-md bg-slate-100 shrink-0 border border-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate text-xs">
                              {item.caption || 'Tanpa keterangan'}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              {item.attribution ? `Sumber: ${item.attribution}` : 'Tanpa atribusi'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromContent(item.fullMatch)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus foto ini dari naskah"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Sumber Rujukan / Referensi (1 per baris)
                  </label>
                  <textarea
                    rows={3}
                    value={sourcesText}
                    onChange={e => setSourcesText(e.target.value)}
                    placeholder="Wawancara narasumber&#10;Laporan riset / Jurnal&#10;Buku referensi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Tagar (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={e => setTagsText(e.target.value)}
                    placeholder="Inspirasi, Desa, Guru, Budaya"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    Tagar membantu pembaca menemukan tulisan Anda melalui penelusuran.
                  </p>
                </div>
              </div>

              {/* Publication Ethics Checkbox */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900">Pernyataan Orisinalitas & Kepatuhan Etika Publikasi:</span>{' '}
                    Saya menyatakan bahwa naskah ini adalah karya orisinal, bukan hasil plagiarisme atau fabrikasi informasi, bebas dari ujaran kebencian/fitnah, dan saya memberikan hak publikasi kepada Rumah Dessa Mentari sesuai dengan{' '}
                    <span className="font-semibold underline text-amber-800">Ketentuan Publikasi Redaksi</span>.
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave(false)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs flex items-center justify-center gap-2 ${
                    isSaving ? 'opacity-50 cursor-not-allowed bg-slate-100' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Save className="w-4 h-4 text-slate-500" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan sebagai Draf'}</span>
                </button>

                <div className="w-full sm:w-auto flex flex-col items-end">
                  <button
                    type="button"
                    disabled={isSaving || currentUser.approvalStatus === 'pending'}
                    onClick={() => handleSave(true)}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all ${
                      currentUser.approvalStatus === 'pending' || isSaving
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSaving
                        ? 'Memproses...'
                        : currentUser.approvalStatus === 'pending'
                        ? 'Menunggu ACC Admin (Ajukan Dinonaktifkan)'
                        : 'Ajukan ke Meja Redaksi'}
                    </span>
                  </button>
                  {currentUser.approvalStatus === 'pending' && (
                    <p className="text-[10px] text-amber-700 mt-1 font-medium text-center sm:text-right">
                      * Harap simpan draf tulisan. Fitur pengajuan aktif setelah akun di-ACC oleh Admin Deni Santoso, M.M.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PROFILE & PHOTO EDITOR */}
        {activeTab === 'profil' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-amber-600" />
                    <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
                      Kelola Profil & Foto Penulis
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Perbarui foto profil, biodata ringkas, dan kontak penulis yang akan muncul di halaman artikel dan direktori kontributor Rumah Dessa Mentari.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                    ID Penulis: {currentUser.id}
                  </span>
                </div>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {profileSuccessMsg}
                  </span>
                  <button
                    onClick={() => setProfileSuccessMsg(null)}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    {profileErrorMsg}
                  </span>
                  <button
                    onClick={() => setProfileErrorMsg(null)}
                    className="text-rose-700 font-bold hover:underline"
                  >
                    Tutup
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-8">
                {/* Section 1: Foto Profil Avatar */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        1. Foto Profil / Avatar Penulis
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Rasio 1:1, tampilan bundar/persegi di artikel
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Live Image Preview Card */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 text-center space-y-3">
                      <div className="relative group">
                        <img
                          src={profileAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                          alt="Foto Profil Penulis"
                          className="w-28 h-28 rounded-2xl object-cover border-4 border-amber-400 shadow-md transition-all group-hover:opacity-90"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 p-2 rounded-xl bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 transition-transform active:scale-95"
                          title="Unggah Foto dari Komputer"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">{profileName || 'Nama Penulis'}</p>
                        <p className="text-[11px] text-slate-500">Pratinjau Foto Profil</p>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unggah Foto dari Komputer</span>
                      </button>
                    </div>

                    {/* Options: File Upload or Preset selection */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* Option A: Preset Avatars */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">
                          Pilihan Karakter Foto / Avatar Terkurasi Redaksi:
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                          {PRESET_AVATARS.map((item) => {
                            const isSelected = profileAvatarUrl === item.url;
                            return (
                              <button
                                key={item.url}
                                type="button"
                                onClick={() => {
                                  setProfileAvatarUrl(item.url);
                                  setProfileSuccessMsg(null);
                                }}
                                className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 aspect-square ${
                                  isSelected
                                    ? 'border-amber-500 ring-2 ring-amber-300 shadow-sm scale-105'
                                    : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                                }`}
                                title={item.name}
                              >
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {isSelected && (
                                  <div className="absolute top-0.5 right-0.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow-xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Option B: Direct URL Input */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                        <label className="block text-xs font-bold text-slate-700">
                          Atau Masukkan Tautan / URL Foto Luar (Unsplash/Web):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={profileAvatarUrl}
                            onChange={e => setProfileAvatarUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 text-xs bg-white"
                          />
                          {profileAvatarUrl && (
                            <button
                              type="button"
                              onClick={() => setProfileAvatarUrl('')}
                              className="px-2.5 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-200 font-medium"
                            >
                              Bersihkan
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Pastikan link foto berformat gambar (.jpg, .png, .webp) dan dapat diakses publik.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Informasi Biodata Penulis */}
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-600" />
                      2. Identitas & Biodata Penulis
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Nama Lengkap / Penulis *
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="Contoh: Dr. H. Denis Santoso, M.M."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alamat Email (Terdaftar)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-mono cursor-not-allowed"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Email digunakan untuk login dan notifikasi ACC.</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Biografi Ringkas Penulis *
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {profileBio.length} karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={e => setProfileBio(e.target.value)}
                      placeholder="Tuliskan latar belakang keahlian, profesi, atau ketertarikan Anda. Biografi ini muncul di bawah setiap naskah artikel Anda..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Nomor WhatsApp / Telepon</span>
                      </label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tautan Portofolio / Media Sosial</span>
                      </label>
                      <input
                        type="url"
                        value={profilePortfolioUrl}
                        onChange={e => setProfilePortfolioUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/... atau website"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Preferred Categories */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Fokus Rubrik & Spesialisasi Penulisan:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CATEGORIES_LIST.map((cat) => {
                        const isChecked = profileCategories.includes(cat);
                        return (
                          <label
                            key={cat}
                            className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                              isChecked
                                ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProfileCategories([...profileCategories, cat]);
                                } else {
                                  setProfileCategories(profileCategories.filter(c => c !== cat));
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="truncate">{cat}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section 3: Live Reader Article Bio Card Preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F1E36] text-white space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Pratinjau Kartu Penulis di Bawah Artikel (Live View)
                    </span>
                    <span className="text-[10px] text-slate-400">Tampilan Publik Pembaca</span>
                  </div>

                  <div className="p-4 bg-white/10 rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                      src={profileAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={profileName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-sm shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold font-serif-editorial text-amber-300">
                          {profileName || 'Nama Penulis'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                          Penulis RDM
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{profileBio || 'Belum mengisi biografi.'}"
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1">
                        {profilePhone && <span>WA: {profilePhone}</span>}
                        {profilePortfolioUrl && (
                          <span className="text-amber-300 underline flex items-center gap-1">
                            Portofolio <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {profileCategories.length > 0 && (
                          <span>Spesialisasi: {profileCategories.slice(0, 2).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(currentUser.name);
                      setProfileBio(currentUser.bio);
                      setProfileAvatarUrl(currentUser.avatarUrl || '');
                      setProfilePhone(currentUser.phone || '');
                      setProfilePortfolioUrl(currentUser.portfolioUrl || '');
                      setProfileCategories(currentUser.preferredCategories || []);
                      setProfileSuccessMsg(null);
                      setProfileErrorMsg(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal / Reset
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all ${
                      isSavingProfile
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                        <span>Menyimpan Profil...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Card for Writer */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-600" />
                    <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                      Keamanan Akun & Ubah Kata Sandi
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Gunakan kata sandi yang aman dan tidak mudah ditebak untuk melindungi draf serta naskah Anda.
                  </p>
                </div>
              </div>

              {writerPasswordMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold ${
                    writerPasswordMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {writerPasswordMessage.text}
                </div>
              )}

              <form onSubmit={handleWriterChangePassword} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kata Sandi Saat Ini (Lama) *
                  </label>
                  <div className="relative">
                    <input
                      type={showWriterCurrentPassword ? 'text' : 'password'}
                      required
                      value={writerCurrentPassword}
                      onChange={e => setWriterCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWriterCurrentPassword(!showWriterCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showWriterCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Kata Sandi Baru * (Min. 6 Karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showWriterNewPassword ? 'text' : 'password'}
                        required
                        value={writerNewPassword}
                        onChange={e => setWriterNewPassword(e.target.value)}
                        placeholder="Kata sandi baru"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWriterNewPassword(!showWriterNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showWriterNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Ulangi Kata Sandi Baru *
                    </label>
                    <div className="relative">
                      <input
                        type={showWriterConfirmPassword ? 'text' : 'password'}
                        required
                        value={writerConfirmPassword}
                        onChange={e => setWriterConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 focus:border-amber-500 text-xs text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWriterConfirmPassword(!showWriterConfirmPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showWriterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isWriterChangingPassword}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>{isWriterChangingPassword ? 'Memproses Sandi...' : 'Perbarui Kata Sandi Akun'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDELINES & ETHICAL CODE */}
        {activeTab === 'pedoman' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
              Alur Editorial & Pedoman Penulisan Kontributor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-bold text-sm text-slate-900">Penulisan Orisinal</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tuliskan ide autentik tanpa menyalin karya orang lain tanpa atribusi. Sertakan rujukan bila mengutip data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-bold text-sm text-slate-900">Kurasi Meja Redaksi</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Editor menelaah kelayakan substantif, kesantunan bahasa, dan keakuratan fakta sebelum disetujui.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-bold text-sm text-slate-900">Publikasi Terverifikasi</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Artikel tayang resmi dengan nama profil penulis dan dapat dibagikan kepada publik luas secara bermartabat.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <h5 className="font-bold text-amber-950">Catatan Khusus Rubrik Kesehatan & Fakta Berita:</h5>
              <p>
                Hindari memberikan rekomendasi obat keras atau ramuan yang belum teruji klinis. Cantumkan rujukan jurnal ilmiah atau pedoman resmi instansi kesehatan nasional.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFIKASI REDAKSI */}
        {activeTab === 'notifikasi' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-serif-editorial text-xl font-bold text-slate-900">
                    Pemberitahuan & Umpan Balik Redaksi
                  </h2>
                  {unreadNotifsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-2xs">
                      {unreadNotifsCount} Baru
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pemberitahuan resmi saat naskah Anda disetujui terbit atau memerlukan revisi penyempurnaan dari Meja Redaksi.
                </p>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={() => DmlStore.markAllNotificationsAsRead(currentUser.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span>Tandai Semua Sudah Dibaca</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setNotifFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  notifFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua ({notifications.length})
              </button>

              <button
                onClick={() => setNotifFilter('unread')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  notifFilter === 'unread'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Belum Dibaca ({unreadNotifsCount})
              </button>

              <button
                onClick={() => setNotifFilter('revision')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  notifFilter === 'revision'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                Perlu Revisi ({revisionNotifsCount})
              </button>

              <button
                onClick={() => setNotifFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  notifFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Disetujui ({approvedNotifsCount})
              </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-serif-editorial text-lg font-bold text-slate-800">
                  {notifFilter === 'all'
                    ? 'Belum Ada Pemberitahuan'
                    : 'Tidak Ada Pemberitahuan Sesuai Filter'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {notifFilter === 'all'
                    ? 'Setiap kali editor menelaah, menyetujui, atau meminta revisi naskah Anda, informasinya akan otomatis muncul di sini.'
                    : 'Silakan pilih filter lain atau tampilkan semua notifikasi.'}
                </p>
                {notifFilter !== 'all' && (
                  <button
                    onClick={() => setNotifFilter('all')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                  >
                    Tampilkan Semua Notifikasi
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notif) => {
                  const isApproved = notif.type === 'approved';
                  const isRevision = notif.type === 'revision_requested';
                  const isRejected = notif.type === 'rejected';

                  return (
                    <div
                      key={notif.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        !notif.isRead
                          ? isRevision
                            ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20 shadow-xs'
                            : isApproved
                            ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                            : 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 flex-1">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRevision
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isApproved && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                            {isRevision && <AlertCircle className="w-5 h-5 text-blue-700" />}
                            {isRejected && <XCircle className="w-5 h-5 text-rose-700" />}
                          </div>

                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : isRevision
                                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                                }`}
                              >
                                {isApproved && 'Disetujui & Diterbitkan'}
                                {isRevision && 'Memerlukan Revisi'}
                                {isRejected && 'Belum Lolos Kurasi'}
                              </span>

                              {!notif.isRead && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                                  Baru
                                </span>
                              )}

                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} WIB
                              </span>
                            </div>

                            <h4 className="font-serif-editorial text-base sm:text-lg font-bold text-slate-900">
                              {notif.articleTitle}
                            </h4>

                            <p className="text-xs text-slate-700 leading-relaxed">
                              {notif.message}
                            </p>

                            {/* Revision notes callout */}
                            {isRevision && notif.revisionNotes && (
                              <div className="p-3.5 bg-white/95 rounded-xl border border-blue-200/90 shadow-2xs space-y-1.5 my-2.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                  Catatan Masukan Meja Redaksi:
                                </span>
                                <p className="text-xs text-slate-800 italic leading-relaxed pl-2.5 border-l-2 border-blue-600 font-sans">
                                  "{notif.revisionNotes}"
                                </p>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-2">
                              {isRevision && (
                                <button
                                  onClick={() => handleOpenArticleFromNotification(notif)}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Buka Editor & Perbaiki Naskah</span>
                                </button>
                              )}

                              {isApproved && (
                                <button
                                  onClick={() => handleOpenArticleFromNotification(notif)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat Artikel di Portal</span>
                                </button>
                              )}

                              {!notif.isRead ? (
                                <button
                                  onClick={() => DmlStore.markNotificationAsRead(notif.id)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Tandai Sudah Dibaca</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  Sudah dibaca
                                </span>
                              )}

                              <button
                                onClick={() => DmlStore.deleteNotification(notif.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
                                title="Hapus notifikasi ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: COVER PHOTO PRESETS MODAL */}
      {showCoverPresetsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowCoverPresetsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-slate-900">
                  Pilih Foto Sampul Bebas Royalti
                </h3>
                <p className="text-xs text-slate-500">
                  Koleksi kurasi foto beresolusi tinggi siap pakai sesuai topik rubrik
                </p>
              </div>
              <button
                onClick={() => setShowCoverPresetsModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 max-h-[65vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESET_COVERS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCoverImage(preset.url);
                      setImageAttribution(preset.attribution);
                      setShowCoverPresetsModal(false);
                    }}
                    className="group border border-slate-200 hover:border-amber-500 rounded-xl overflow-hidden bg-slate-50 cursor-pointer shadow-2xs hover:shadow-md transition-all text-left"
                  >
                    <div className="h-36 overflow-hidden relative bg-slate-200">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[10px] text-white px-2 py-0.5 rounded font-semibold uppercase">
                        {preset.category}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1 group-hover:text-amber-700">
                        {preset.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 italic truncate">
                        Sumber: {preset.attribution}
                      </p>
                      <span className="text-[11px] font-semibold text-amber-600 block pt-1">
                        Pilih foto ini →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowCoverPresetsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: INLINE PHOTO INSERTER MODAL */}
      {showInlinePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowInlinePhotoModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-serif-editorial text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-600" />
                  Sisipkan Foto ke Dalam Naskah
                </h3>
                <p className="text-xs text-slate-500">
                  Foto akan disisipkan di posisi kursor teks lengkap dengan takarir (keterangan) dan atribusi hak cipta.
                </p>
              </div>
              <button
                onClick={() => setShowInlinePhotoModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">
              {/* Method Selector Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInlinePhotoMethod('upload')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    inlinePhotoMethod === 'upload'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah dari HP / Komputer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInlinePhotoMethod('preset')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    inlinePhotoMethod === 'preset'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pilih dari Galeri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInlinePhotoMethod('url')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    inlinePhotoMethod === 'url'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tautan URL</span>
                </button>
              </div>

              {/* Method 1: Device Upload */}
              {inlinePhotoMethod === 'upload' && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-amber-50/20 transition-all">
                    <input
                      ref={inlinePhotoFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={handleInlinePhotoFileUpload}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">Klik tombol di bawah</span> untuk memilih foto dari perangkat Anda
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Mendukung JPG, PNG, WEBP. Foto otomatis dioptimalkan agar ringan dimuat pembaca.
                      </p>
                      <button
                        type="button"
                        disabled={isUploadingInlinePhoto}
                        onClick={() => inlinePhotoFileInputRef.current?.click()}
                        className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {isUploadingInlinePhoto ? 'Memproses Foto...' : 'Pilih Berkas Foto'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Method 2: Curated Presets */}
              {inlinePhotoMethod === 'preset' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Klik foto untuk memilih:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                    {PRESET_COVERS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setInlinePhotoUrl(preset.url);
                          setInlinePhotoCaption(preset.title);
                          setInlinePhotoAttribution(preset.attribution);
                        }}
                        className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          inlinePhotoUrl === preset.url
                            ? 'ring-2 ring-amber-500 border-amber-500'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-1.5 bg-white text-[10px] truncate">
                          <span className="font-bold block truncate">{preset.title}</span>
                          <span className="text-slate-400 block truncate">{preset.category}</span>
                        </div>
                        {inlinePhotoUrl === preset.url && (
                          <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Method 3: Direct URL */}
              {inlinePhotoMethod === 'url' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Tautan URL Gambar Langsung
                  </label>
                  <input
                    type="text"
                    value={inlinePhotoUrl}
                    onChange={e => setInlinePhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-500">
                    Pastikan tautan berakhir dengan format gambar (jpg, png, webp) atau berasal dari penyedia gambar terpercaya.
                  </p>
                </div>
              )}

              {/* Error indicator */}
              {inlinePhotoError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{inlinePhotoError}</span>
                </div>
              )}

              {/* Photo Preview & Details */}
              {inlinePhotoUrl && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Pratinjau & Keterangan Foto:
                  </span>

                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                      <img
                        src={inlinePhotoUrl}
                        alt="Pratinjau"
                        className="w-full h-full object-cover"
                        onError={() => setInlinePhotoError('Tautan gambar tidak dapat dimuat atau tidak valid.')}
                      />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Keterangan Foto / Takarir (Caption) *
                        </label>
                        <input
                          type="text"
                          value={inlinePhotoCaption}
                          onChange={e => setInlinePhotoCaption(e.target.value)}
                          placeholder="Contoh: Suasana gotong royong pemuda membangun balai baca"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Sumber / Hak Cipta Foto (Atribusi) *
                        </label>
                        <input
                          type="text"
                          value={inlinePhotoAttribution}
                          onChange={e => setInlinePhotoAttribution(e.target.value)}
                          placeholder="Contoh: Dokumentasi Penulis / Foto: Budi / Unsplash"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowInlinePhotoModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!inlinePhotoUrl.trim()}
                onClick={handleInsertInlinePhoto}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Sisipkan ke Naskah</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
