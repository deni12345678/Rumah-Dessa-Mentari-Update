import {
  Article,
  ArticleCategory,
  ArticleComment,
  ArticleStatus,
  BookCatalogItem,
  ConsultationRequest,
  CorrectionReport,
  EmailNotificationLog,
  SiteSettings,
  User,
  UserApprovalStatus,
  WriterNotification
} from '../types';
import { calculateReadingTime } from './readingTime';
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

function logFirestoreDiag(
  operation: string,
  path: string,
  payload: Record<string, any> | null,
  success: boolean,
  error?: unknown
) {
  const timestamp = new Date().toISOString();
  const currentUser = auth.currentUser;
  const authState = currentUser
    ? { uid: currentUser.uid, email: currentUser.email, isAnonymous: currentUser.isAnonymous }
    : 'Unauthenticated / Anonymous';

  if (success) {
    console.log(
      `[RDM-Firestore-Diag] [SUCCESS] ${timestamp} | Op: ${operation} | Path: ${path} | Auth: ${JSON.stringify(
        authState
      )} | Keys: ${payload ? Object.keys(payload).join(', ') : 'none'}`
    );
  } else {
    const errorDetails = error instanceof Error ? error.stack || error.message : String(error);
    console.error(
      `[RDM-Firestore-Diag] [FAILURE] ${timestamp} | Op: ${operation} | Path: ${path} | Auth: ${JSON.stringify(
        authState
      )} | Error: ${errorDetails} | Payload:`,
    );
  }
}

function formatAuthError(err: any): string {
  if (!err) return 'Terjadi kesalahan sistem saat proses otentikasi.';
  const message = err.message || String(err);
  const code = err.code || '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
    return 'Email atau kata sandi tidak sesuai. Periksa kembali email dan kata sandi Anda.';
  }
  if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
    return 'Alamat email ini sudah terdaftar. Silakan pilih tab "Masuk" atau gunakan fitur pemulihan kata sandi.';
  }
  if (code === 'auth/weak-password' || message.includes('weak-password')) {
    return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.';
  }
  if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
    return 'Format alamat email tidak valid. Pastikan penulisan email sudah benar.';
  }
  if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
    return 'Aktivitas masuk terlalu banyak. Silakan tunggu beberapa saat lalu coba lagi.';
  }
  if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
    return 'Koneksi jaringan terganggu. Silakan periksa jaringan internet Anda.';
  }
  if (code === 'auth/requires-recent-login' || message.includes('requires-recent-login')) {
    return 'Demi keamanan, pembaruan kata sandi memerlukan Anda keluar dan masuk kembali terlebih dahulu.';
  }

  const cleaned = message.replace(/^Firebase:\n?\s*Error\s*\([^)]+\):\s*/i, '').trim();
  return cleaned || 'Gagal memproses otentikasi akun. Silakan coba kembali.';
}

const STORAGE_KEYS = {
  ARTICLES: 'dml_articles_v1',
  USERS: 'dml_users_v1',
  CURRENT_USER: 'dml_current_user_v1',
  SETTINGS: 'dml_settings_v1',
  CONSULTATIONS: 'dml_consultations_v1',
  CORRECTIONS: 'dml_corrections_v1',
  BOOKS: 'dml_books_v1',
  EMAIL_LOGS: 'dml_email_logs_v1',
  NOTIFICATIONS: 'dml_writer_notifications_v1',
  COMMENTS: 'dml_article_comments_v1',
};

export const DEFAULT_SEED_ARTICLES: Article[] = [
  {
    id: 'art-seed-01',
    slug: 'menyemai-benih-literasi-di-era-digital-tantangan-dan-harapan',
    title: 'Menyemai Benih Literasi di Era Digital: Tantangan dan Harapan',
    summary: 'Di tengah derasnya arus informasi digital, memperkuat minat baca dan kedalaman berpikir menjadi fondasi penting bagi kemajuan peradaban literasi bangsa.',
    content: `Literasi bukan sekadar kemampuan membaca huruf demi huruf, melainkan kapasitas intelektual untuk memahami, menganalisis, serta mengolah informasi secara kritis. Di era keterlimpahan data seperti saat ini, tantangan utama literasi bukan lagi keterbatasan akses membaca, melainkan ketajaman daya saring terhadap distorsi informasi.

Rumah Dessa Mentari menghadirkan ruang publikasi ini sebagai wadah menyemaikan gagasan bernas. Melalui kontribusi para penulis, akademisi, dan pegiat literasi di seluruh pelosok Nusantara, kita membangun ekosistem membaca yang berdaya tahan.

### Membangun Budaya Menulis yang Berkelanjutan

Menulis adalah proses mendokumentasikan pemikiran agar menjadi warisan abadi. Ketika sebuah karya diterbitkan, ia tidak hanya menjadi tulisan konsumsi pribadi, tetapi membuka ruang dialog interaktif dan refleksi bagi generasi mendatang.

1. **Kedalaman Pemikiran**: Mengedepankan analisis komprehensif ketimbang narasi provokatif.
2. **Integritas Karya**: Menghormati hak cipta, etika redaksi, serta orisinalitas riset.
3. **Pemberdayaan Komunitas**: Menghubungkan penulis pemula dengan penyunting berpengalaman.

Melalui sinergi platform digital ini, kami mengajak seluruh elemen masyarakat untuk terus berkarya, membagikan inspirasi, dan menerbitkan naskah yang menggerakkan kebaikan.`,
    category: 'Literasi dan Buku',
    tags: ['Literasi', 'Pendidikan', 'Buku', 'Esai'],
    authorId: 'user-admin-root',
    authorName: 'Deni Santoso, M.M.',
    authorBio: 'Pendiri & Pimpinan Redaksi Rumah Dessa Mentari, Penulis & Pegiat Literasi.',
    authorAvatar: '/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png',
    coverImage: '/assets/aistudio/image_0363e103.png',
    imageAttribution: 'Dokumentasi Rumah Dessa Mentari',
    readingTime: 4,
    status: 'published',
    sources: ['Jurnal Literasi Indonesia', 'Arsip Redaksi RDM'],
    views: 342,
    createdAt: '2026-11-01T08:00:00.000Z',
    updatedAt: '2026-11-01T08:00:00.000Z',
    publishedAt: '2026-11-01T08:30:00.000Z',
    featured: true,
  },
  {
    id: 'art-seed-02',
    slug: 'menjaga-api-inspirasi-kisah-perjuangan-guru-pembina-di-daerah-pelosok',
    title: 'Menjaga Api Inspirasi: Perjuangan Guru Pembina Literasi di Daerah Pelosok',
    summary: 'Kisah nyata pengabdian para pendidik yang mendedikasikan waktu dan tenaga untuk membuka rumah baca gratis di daerah terpencil.',
    content: `Perjalanan membangun tradisi membaca di pelosok daerah penuh dengan dinamika dan keharuan. Tanpa fasilitas modern dan jaringan internet yang memadai, para pejuang literasi terus bergerak mendistribusikan buku-buku bacaan ke sudut-sudut desa.

Bapak Ahmad, salah satu guru pembina di pedalaman, percaya bahwa setiap anak berhak bermimpi tinggi. "Buku adalah jendela dunia. Ketika anak-anak membaca, pandangan mereka menembus batas geografis," ujarnya saat ditemui tim Redaksi RDM.

### Rumah Baca Berbasis Swadaya Komunitas

Dengan memanfaatkan teras rumah sederhana, ratusan buku koleksi pribadi ditata rapi. Setiap sore, anak-anak berkumpul untuk membaca kisah-kisah penuh keteladanan. Inisiatif seperti inilah yang mengilhami lahirnya jaringan gerakan literasi di Rumah Dessa Mentari.`,
    category: 'Kisah Inspiratif',
    tags: ['Kisah Inspiratif', 'Pendidikan', 'Pengabdian', 'Komunitas'],
    authorId: 'user-contributor-01',
    authorName: 'Siti Rahmawati, S.Pd.',
    authorBio: 'Pendidik & Kontributor Kisah Inspiratif RDM',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    coverImage: '/assets/aistudio/image_0af6c975.png',
    imageAttribution: 'Arsip Rumah Baca Komunitas',
    readingTime: 3,
    status: 'published',
    sources: ['Wawancara Lapangan RDM'],
    views: 215,
    createdAt: '2026-11-02T09:00:00.000Z',
    updatedAt: '2026-11-02T09:00:00.000Z',
    publishedAt: '2026-11-02T10:00:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-03',
    slug: 'transformasi-pendidikan-karakter-dan-metode-pembelajaran-modern',
    title: 'Transformasi Pendidikan Karakter dan Metode Pembelajaran Modern',
    summary: 'Mengintegrasikan teknologi informasi dengan penguatan karakter mulia murid dalam ekosistem persekolahan abad ke-21.',
    content: `Pendidikan sejati tidak sekadar mentransfer pengetahuan kognitif, melainkan membimbing pembentukan karakter yang berintegritas dan berbudi pekerti luhur. Di tengah pesatnya perkembangan teknologi kecerdasan buatan, aspek kemanusiaan dalam pendidikan justru semakin krusial.

Kurikulum modern harus memberi ruang bagi kreativitas, kolaborasi, pemikiran kritis, dan komunikasi efektif. Pendidik berperan sebagai fasilitator yang menyalakan rasa ingin tahu siswa.`,
    category: 'Pendidikan',
    tags: ['Pendidikan', 'Pedagogi', 'Karakter', 'Inovasi Belajar'],
    authorId: 'user-editor-01',
    authorName: 'Dr. H. Bambang Kusuma',
    authorBio: 'Pakar Pendidikan & Editor Konsultan RDM',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    coverImage: '/assets/aistudio/image_0f9d7c68.png',
    imageAttribution: 'Dokumentasi Seminar Pendidikan',
    readingTime: 4,
    status: 'published',
    sources: ['Kajian Pendidikan Nasional'],
    views: 189,
    createdAt: '2026-11-03T07:30:00.000Z',
    updatedAt: '2026-11-03T07:30:00.000Z',
    publishedAt: '2026-11-03T08:00:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-04',
    slug: 'strategi-pengembangan-ekonomi-kreatif-dan-digitalisasi-umkm-desa',
    title: 'Strategi Pengembangan Ekonomi Kreatif dan Digitalisasi UMKM Desa',
    summary: 'Bagaimana pelaku usaha mikro dan menengah mengadopsi pemasaran digital serta branding kemasan untuk menembus pasar nasional.',
    content: `Usaha Mikro, Kecil, dan Menengah (UMKM) merupakan tulang punggung perekonomian Indonesia. Dengan pemanfaatan teknologi digital, produk-produk lokal berbasis potensi desa kini memiliki peluang besar bersaing di kancah nasional maupun global.

Langkah-langkah strategis bagi penggiat UMKM meliputi:
1. **Penataan Branding & Visual**: Memperbaiki kualitas logo, foto produk, dan cerita di balik merek.
2. **Pemasaran Digital**: Memanfaatkan media sosial dan portal berita lokal untuk promosi terarah.
3. **Pengelolaan Keuangan Digital**: Mengadopsi pencatatan keuangan berbasis aplikasi dan pembayaran nontunai.`,
    category: 'Ekonomi dan UMKM',
    tags: ['Ekonomi', 'UMKM', 'Digitalisasi', 'Bisnis Desa'],
    authorId: 'user-admin-root',
    authorName: 'Deni Santoso, M.M.',
    authorBio: 'Pendiri & Pimpinan Redaksi Rumah Dessa Mentari, Penulis & Pegiat Literasi.',
    authorAvatar: '/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png',
    coverImage: '/assets/aistudio/image_10ff7b17.png',
    imageAttribution: 'Galeri Produk Usaha Komunitas',
    readingTime: 3,
    status: 'published',
    sources: ['Studi Kasus UMKM Nusantara'],
    views: 275,
    createdAt: '2026-11-04T10:00:00.000Z',
    updatedAt: '2026-11-04T10:00:00.000Z',
    publishedAt: '2026-11-04T11:00:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-05',
    slug: 'menjaga-kesehatan-mental-dan-keseimbangan-hidup-pekerja-literasi',
    title: 'Menjaga Kesehatan Mental dan Keseimbangan Hidup Pekerja Kreatif',
    summary: 'Ulasan praktis mengenai manajemen stres, perawatan diri (self-care), dan mempertahankan fokus produktif di tengah hiruk-pikuk aktivitas.',
    content: `Kesehatan holistik tidak hanya mencakup kondisi fisik, tetapi juga kesejahteraan mental dan emosional. Penulis, akademisi, dan pekerja kreatif kerap kali menghadapi kelelahan mental (burnout) akibat beban kerja intelektual yang tinggi.

Penting bagi kita untuk menerapkan jeda teratur, menjaga kecukupan tidur, serta melakukan olahraga ringan di sela-sela aktivitas harian. Kesehatan yang prima akan melahirkan pemikiran dan karya yang lebih jernih.`,
    category: 'Kesehatan',
    tags: ['Kesehatan', 'Kesehatan Mental', 'Gaya Hidup', 'Kesejahteraan'],
    authorId: 'user-contributor-02',
    authorName: 'dr. Nabila Putri',
    authorBio: 'Praktisi Kesehatan & Penulis Artikel Kesehatan RDM',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    coverImage: '/assets/aistudio/image_12c41fd4.png',
    imageAttribution: 'Ilustrasi Kesehatan RDM',
    readingTime: 3,
    status: 'published',
    sources: ['Jurnal Kesehatan Komunitas'],
    views: 164,
    createdAt: '2026-11-05T08:00:00.000Z',
    updatedAt: '2026-11-05T08:00:00.000Z',
    publishedAt: '2026-11-05T08:30:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-06',
    slug: 'etika-penulisan-dan-tanggung-jawab-intelektual-di-ruang-publik',
    title: 'Etika Penulisan dan Tanggung Jawab Intelektual di Ruang Publik',
    summary: 'Opini mendalam mengenai pentingnya kebenaran fakta, kehati-hatian berbahasa, dan penghormatan terhadap pembaca dalam tulisan Opini.',
    content: `Kebebasan berpendapat di ruang publik digital membawa konsekuensi moral yang besar. Setiap kata yang dituliskan memiliki dampak bagi persepsi dan pemahaman masyarakat luas.

Oleh karena itu, gagasan intelektual harus dilandasi oleh riset yang sahih, verifikasi data, serta sikap santun dalam menyampaikan perbedaan argumen. Rumah Dessa Mentari berkomitmen menjaga ruang opini publik yang sehat dan bermartabat.`,
    category: 'Opini dan Gagasan',
    tags: ['Opini', 'Etika Redaksi', 'Intelektual', 'Gagasan'],
    authorId: 'user-admin-root',
    authorName: 'Deni Santoso, M.M.',
    authorBio: 'Pendiri & Pimpinan Redaksi Rumah Dessa Mentari, Penulis & Pegiat Literasi.',
    authorAvatar: '/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png',
    coverImage: '/assets/aistudio/image_1826f528.png',
    imageAttribution: 'Koleksi Redaksi RDM',
    readingTime: 4,
    status: 'published',
    sources: ['Kode Etik Jurnalistik & Etika Penulisan RDM'],
    views: 298,
    createdAt: '2026-11-06T09:15:00.000Z',
    updatedAt: '2026-11-06T09:15:00.000Z',
    publishedAt: '2026-11-06T10:00:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-07',
    slug: 'semangat-olahraga-dan-sportivitas-sebagai-perekat-persatuan-bangsa',
    title: 'Semangat Olahraga dan Sportivitas Sebagai Perekat Persatuan Bangsa',
    summary: 'Pelajaran berharga dari nilai-nilai olahraga: disiplin, kerja keras, persaudaraan, dan keberanian menerima kekalahan dengan elegan.',
    content: `Olahraga melampaui sekat-sekat perbedaan sosial dan latar belakang. Di lapangan permainan, nilai yang dijunjung tinggi adalah integritas, aturan bersama, dan rasa saling menghormati antaratlet.

Tradisi berolahraga di lingkungan warga dan sekolah bukan hanya membangun ketahanan fisik, tetapi juga membentuk mental kebersamaan dan sportivitas bagi generasi muda.`,
    category: 'Olahraga',
    tags: ['Olahraga', 'Sportivitas', 'Kesehatan Fisik', 'Karakter'],
    authorId: 'user-contributor-03',
    authorName: 'Rian Hidayat',
    authorBio: 'Pengamat Olahraga & Penulis RDM',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    coverImage: '/assets/aistudio/image_42822640.png',
    imageAttribution: 'Galeri Olahraga Komunitas',
    readingTime: 3,
    status: 'published',
    sources: ['Dokumentasi Olahraga Rekreasi'],
    views: 142,
    createdAt: '2026-11-07T11:00:00.000Z',
    updatedAt: '2026-11-07T11:00:00.000Z',
    publishedAt: '2026-11-07T11:30:00.000Z',
    featured: false,
  },
  {
    id: 'art-seed-08',
    slug: 'panduan-layanan-penerbitan-buku-biografi-dan-memoar-profesional',
    title: 'Panduan Layanan Penerbitan Buku Biografi dan Memoar Profesional',
    summary: 'Informasi lengkap mengenai tahapan penulisan bayangan (ghostwriting), penyuntingan, tata letak, hingga pengurusan ISBN di Rumah Dessa Mentari.',
    content: `Merekam perjalanan hidup, pemikiran, atau sejarah institusi ke dalam sebuah buku adalah langkah berharga untuk mewariskan jejak karya bagi generasi mendatang.

Melalui divisi penerbitan Rumah Dessa Mentari, kami siap mendampingi Anda di setiap tahap:
1. **Wawancara & Penggalian Gagasan**: Menggali kisah dan hikmah secara mendalam.
2. **Penulisan Naskah (Ghostwriting / Co-writing)**: Merangkai naskah dengan gaya bahasa yang mengalir dan menggugah.
3. **Penyuntingan & Layout**: Memastikan tata bahasa yang baku, estetika sampul, serta kerapian cetak.
4. **Penerbitan & Distribusi**: Pengurusan ISBN resmi serta penyebaran ke jaringan pembaca.`,
    category: 'Informasi Umum',
    tags: ['Informasi Umum', 'Penerbitan Buku', 'Biografi', 'Layanan RDM'],
    authorId: 'user-admin-root',
    authorName: 'Deni Santoso, M.M.',
    authorBio: 'Pendiri & Pimpinan Redaksi Rumah Dessa Mentari, Penulis & Pegiat Literasi.',
    authorAvatar: '/assets/aistudio/Logo_Rumah_Mentari_dengan_Buku_Terbuka_4cb8855a.png',
    coverImage: '/assets/aistudio/image_4611ea45.png',
    imageAttribution: 'Layanan Penerbitan Rumah Dessa Mentari',
    readingTime: 4,
    status: 'published',
    sources: ['Pedoman Penerbitan RDM'],
    views: 410,
    createdAt: '2026-11-08T07:00:00.000Z',
    updatedAt: '2026-11-08T07:00:00.000Z',
    publishedAt: '2026-11-08T07:30:00.000Z',
    featured: false,
  }
];

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean as T;
}

export class DmlStore {
  private static listeners: (() => void)[] = [];
  private static memoryCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL caching

  private static cachedGet<T>(key: string, fallback: T): T {
    const cached = this.memoryCache.get(key);
    const now = Date.now();
    if (cached && (now - cached.timestamp < this.CACHE_TTL_MS)) {
      return cached.data as T;
    }
    const val = safeGet<T>(key, fallback);
    this.memoryCache.set(key, { data: val, timestamp: now });
    return val;
  }

  private static cachedSet<T>(key: string, value: T): void {
    safeSet(key, value);
    this.memoryCache.set(key, { data: value, timestamp: Date.now() });
  }

  public static invalidateCache(key?: string) {
    if (key) {
      this.memoryCache.delete(key);
    } else {
      this.memoryCache.clear();
    }
  }

  public static subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private static notify() {
    this.listeners.forEach(fn => fn());
  }
  public static async init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      safeSet(STORAGE_KEYS.USERS, []);
    }

    const currentArticles = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    if (!currentArticles || currentArticles.length === 0) {
      safeSet(STORAGE_KEYS.ARTICLES, DEFAULT_SEED_ARTICLES);
      this.invalidateCache(STORAGE_KEYS.ARTICLES);
      
      // Auto-sync initial seed articles to Cloud Firestore
      DEFAULT_SEED_ARTICLES.forEach((art) => {
        const cleanDoc = cleanUndefined(art);
        setDoc(doc(db, 'articles', art.id), cleanDoc, { merge: true }).catch(err => {
          console.warn('Initial cloud seed warning for article', art.id, err);
        });
      });
    }

    // Real-time cloud sync for published articles
    try {
      const q = query(collection(db, 'articles'), where('status', '==', 'published'), orderBy('publishedAt', 'desc'));
      onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const cloudArticles: Article[] = [];
          snapshot.forEach((docSnap) => {
            cloudArticles.push(docSnap.data() as Article);
          });
          
          const localArticles = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, DEFAULT_SEED_ARTICLES);
          const mergedMap = new Map<string, Article>();
          
          // Seed articles as baseline
          DEFAULT_SEED_ARTICLES.forEach(a => mergedMap.set(a.id, a));
          // Keep local drafts/private articles
          localArticles.forEach(a => mergedMap.set(a.id, a));
          // Cloud articles override
          cloudArticles.forEach(a => mergedMap.set(a.id, a));
          
          const finalArticles = Array.from(mergedMap.values());
          safeSet(STORAGE_KEYS.ARTICLES, finalArticles);
          this.notify();
        }
      }, (error) => {
        console.warn('Real-time articles sync error:', error);
      });
    } catch (e) {
      console.warn('Could not set up real-time articles sync from Firestore:', e);
    }

    const existingSettings = safeGet<SiteSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!existingSettings) {
      safeSet(STORAGE_KEYS.SETTINGS, {
        brandName: 'Rumah Dessa Mentari',
        slogan: 'Inspirasi untuk Semua, Karya untuk Dunia.',
        shortDescription: 'Berbagi inspirasi, memperluas wawasan, dan menghadirkan karya yang bermakna melalui media artikel, komunitas kontributor, dan layanan literasi buku.',
        whatsappNumber: '6287879069404',
        contactEmail: 'dessamentarilangit@gmail.com',
        adminEmailBackup: 'santosodeni3@gmail.com',
        officeLocation: 'Karawang & Bekasi, Indonesia',
        allowSubmissions: true,
        editorialPolicyVersion: 'v2.5 (Production)',
      });
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
      safeSet(STORAGE_KEYS.BOOKS, []);
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef).catch(() => null);
          if (userDoc && userDoc.exists()) {
            const data = userDoc.data() as User;
            const userEmail = firebaseUser.email?.toLowerCase();
            if ((userEmail === 'santosodeni3@gmail.com' || userEmail === 'denisarah26@gmail.com') && data.role !== 'admin') {
              data.role = 'admin';
              data.approvalStatus = 'approved';
            }
            safeSet(STORAGE_KEYS.CURRENT_USER, data);

            // Fetch full user list only if privileged
            if (data.role === 'admin' || data.role === 'editor') {
              this.refreshUsersFromCloud().catch(() => {});
            }
          } else {
            const userEmail = firebaseUser.email?.toLowerCase();
            const role = (userEmail === 'santosodeni3@gmail.com' || userEmail === 'denisarah26@gmail.com') ? 'admin' : 'contributor';
            const approvalStatus = role === 'admin' ? 'approved' : 'pending';
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Penulis Baru',
              email: firebaseUser.email || '',
              role,
              approvalStatus,
              bio: 'Penulis dan kontributor Rumah Dessa Mentari.',
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
              createdAt: new Date().toISOString(),
            };
            const cleanDoc = cleanUndefined(newUser);
            safeSet(STORAGE_KEYS.CURRENT_USER, newUser);

            try {
              await setDoc(userDocRef, cleanDoc, { merge: true });
              logFirestoreDiag('initNewUser', `users/${firebaseUser.uid}`, cleanDoc, true);
              if (newUser.role === 'admin' || newUser.role === 'editor') {
                this.refreshUsersFromCloud().catch(() => {});
              }
            } catch (createErr) {
              logFirestoreDiag('initNewUser', `users/${firebaseUser.uid}`, cleanDoc, false, createErr);
              console.warn('Could not write user profile doc to Firestore:', createErr);
            }
          }
        } catch (error) {
          console.warn('onAuthStateChanged error handled safely:', error);
        }
      }
      this.notify();
    });
  }

  public static sendEmailNotification(
    type: EmailNotificationLog['type'],
    subject: string,
    body: string
  ): EmailNotificationLog {
    const settings = this.getSettings();
    const recipient = settings.adminEmailBackup || 'santosodeni3@gmail.com';
    const logs = safeGet<EmailNotificationLog[]>(STORAGE_KEYS.EMAIL_LOGS, []);

    const newLog: EmailNotificationLog = {
      id: 'email-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      recipient,
      subject,
      body,
      type,
      sentAt: new Date().toISOString(),
      status: 'delivered',
    };

    logs.unshift(newLog);
    safeSet(STORAGE_KEYS.EMAIL_LOGS, logs.slice(0, 100));
    this.notify();
    return newLog;
  }

  public static getEmailNotificationLogs(): EmailNotificationLog[] {
    return safeGet<EmailNotificationLog[]>(STORAGE_KEYS.EMAIL_LOGS, []);
  }

  public static getSettings(): SiteSettings {
    const s = safeGet<SiteSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!s) {
      return {
        brandName: 'Rumah Dessa Mentari',
        slogan: 'Inspirasi untuk Semua, Karya untuk Dunia.',
        shortDescription: '',
        whatsappNumber: '6287879069404',
        contactEmail: 'dessamentarilangit@gmail.com',
        adminEmailBackup: 'santosodeni3@gmail.com',
        officeLocation: 'Karawang & Bekasi, Indonesia',
        allowSubmissions: true,
        editorialPolicyVersion: 'v2.5',
      };
    }
    return s;
  }

  public static updateSettings(settings: Partial<SiteSettings>): void {
    const curr = this.getSettings();
    const updated = { ...curr, ...settings };
    safeSet(STORAGE_KEYS.SETTINGS, updated);
    this.notify();
  }

  public static getCurrentUser(): User | null {
    return safeGet<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  public static async login(email: string, passwordPlain: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      let firebaseUser: any = null;

      try {
        const credential = await signInWithEmailAndPassword(auth, cleanEmail, passwordPlain);
        firebaseUser = credential.user;
      } catch (authErr: any) {
        return { success: false, error: formatAuthError(authErr) };
      }

      // Firebase Auth login succeeded
      const users = safeGet<any[]>(STORAGE_KEYS.USERS, []);
      let localMatch = users.find(u => u.email.toLowerCase().trim() === cleanEmail || u.id === firebaseUser.uid);

      const isRootAdmin = cleanEmail === 'santosodeni3@gmail.com' || cleanEmail === 'denisarah26@gmail.com';
      const role = isRootAdmin ? 'admin' : (localMatch?.role || 'contributor');
      const approvalStatus = isRootAdmin ? 'approved' : (localMatch?.approvalStatus || 'pending');

      const sessionUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || localMatch?.name || cleanEmail.split('@')[0],
        email: firebaseUser.email || cleanEmail,
        role,
        approvalStatus,
        bio: localMatch?.bio || 'Penulis dan kontributor di Rumah Dessa Mentari.',
        avatarUrl: firebaseUser.photoURL || localMatch?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        phone: localMatch?.phone || '',
        portfolioUrl: localMatch?.portfolioUrl || '',
        preferredCategories: localMatch?.preferredCategories || [],
        createdAt: localMatch?.createdAt || new Date().toISOString(),
      };

      if (!localMatch) {
        users.push(sessionUser);
      } else {
        const idx = users.findIndex(u => u.id === localMatch.id || u.email.toLowerCase().trim() === cleanEmail);
        if (idx !== -1) users[idx] = { ...users[idx], ...sessionUser };
      }
      safeSet(STORAGE_KEYS.USERS, users);
      safeSet(STORAGE_KEYS.CURRENT_USER, sessionUser);

      // Background Firestore profile doc write
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const cleanDoc = cleanUndefined(sessionUser);
        await setDoc(userDocRef, cleanDoc, { merge: true });
        logFirestoreDiag('loginSyncUser', `users/${firebaseUser.uid}`, cleanDoc, true);
      } catch (cloudErr) {
        console.warn('Firestore user profile sync warning during login:', cloudErr);
      }

      this.notify();
      return { success: true, user: sessionUser };
    } catch (error: any) {
      return { success: false, error: formatAuthError(error) };
    }
  }

  public static async loginWithGoogle(): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();

      const users = safeGet<any[]>(STORAGE_KEYS.USERS, []);
      let localMatch = users.find(u => u.email.toLowerCase().trim() === cleanEmail || u.id === firebaseUser.uid);

      const isRootAdmin = cleanEmail === 'santosodeni3@gmail.com' || cleanEmail === 'denisarah26@gmail.com';
      const role = isRootAdmin ? 'admin' : (localMatch?.role || 'contributor');
      const approvalStatus = isRootAdmin ? 'approved' : (localMatch?.approvalStatus || 'approved');

      const sessionUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || localMatch?.name || (isRootAdmin ? 'Deni Santoso, M.M.' : cleanEmail.split('@')[0]),
        email: cleanEmail,
        role,
        approvalStatus,
        bio: localMatch?.bio || (isRootAdmin ? 'Pimpinan Redaksi & Pengelola Rumah Dessa Mentari.' : 'Penulis dan kontributor di Rumah Dessa Mentari.'),
        avatarUrl: firebaseUser.photoURL || localMatch?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        phone: localMatch?.phone || (isRootAdmin ? '087879069404' : ''),
        portfolioUrl: localMatch?.portfolioUrl || '',
        preferredCategories: localMatch?.preferredCategories || [],
        createdAt: localMatch?.createdAt || new Date().toISOString(),
      };

      if (!localMatch) {
        users.push(sessionUser);
      } else {
        const idx = users.findIndex(u => u.id === localMatch.id || u.email.toLowerCase().trim() === cleanEmail);
        if (idx !== -1) users[idx] = { ...users[idx], ...sessionUser };
      }
      safeSet(STORAGE_KEYS.USERS, users);
      safeSet(STORAGE_KEYS.CURRENT_USER, sessionUser);

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const cleanDoc = cleanUndefined(sessionUser);
        await setDoc(userDocRef, cleanDoc, { merge: true });
        logFirestoreDiag('googleLoginSync', `users/${firebaseUser.uid}`, cleanDoc, true);
      } catch (cloudErr) {
        console.warn('Firestore user profile sync warning during Google login:', cloudErr);
      }

      this.notify();
      return { success: true, user: sessionUser };
    } catch (error: any) {
      return { success: false, error: formatAuthError(error) };
    }
  }

  public static async changePassword(
    currentPasswordPlain: string,
    newPasswordPlain: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        return { success: false, error: 'Sesi masuk tidak ditemukan. Silakan masuk terlebih dahulu.' };
      }

      if (!currentPasswordPlain) {
        return { success: false, error: 'Silakan masukkan kata sandi saat ini (lama).' };
      }

      if (!newPasswordPlain || newPasswordPlain.length < 6) {
        return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
      }

      if (currentPasswordPlain === newPasswordPlain) {
        return { success: false, error: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.' };
      }

      // Re-authenticate user to permit password modification
      try {
        const credential = EmailAuthProvider.credential(user.email, currentPasswordPlain);
        await reauthenticateWithCredential(user, credential);
      } catch (authErr: any) {
        const code = authErr?.code || '';
        const msg = authErr?.message || String(authErr);
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
          return { success: false, error: 'Kata sandi saat ini (lama) yang Anda masukkan tidak sesuai.' };
        }
        return { success: false, error: formatAuthError(authErr) };
      }

      // Perform update password in Firebase Auth
      await updatePassword(user, newPasswordPlain);

      // Audit notification in email log
      this.sendEmailNotification(
        'system_security_notice',
        `[RDM - Keamanan Akun] Pembaruan Kata Sandi (${user.email})`,
        `Pemberitahuan Sistem Keamanan Rumah Dessa Mentari:\nKata sandi untuk akun pengelola/admin ${user.displayName || user.email} (${user.email}) telah berhasil diperbarui pada ${new Date().toLocaleString('id-ID')}.\n\nJika perubahan ini bukan dilakukan oleh Anda, segera hubungi kontak teknis.`
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: formatAuthError(error) };
    }
  }

  public static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Format alamat email tidak valid. Masukkan email yang benar.' };
      }

      await sendPasswordResetEmail(auth, cleanEmail);

      this.sendEmailNotification(
        'system_security_notice',
        `[RDM - Pemulihan Kata Sandi] Permohonan Reset (${cleanEmail})`,
        `Pemberitahuan Sistem Keamanan Rumah Dessa Mentari:\nPermohonan pemulihan (reset) kata sandi untuk akun email ${cleanEmail} telah diproses pada ${new Date().toLocaleString('id-ID')}.\nTautan pemulihan resmi Firebase telah dikirim ke kotak masuk email tersebut.`
      );

      return { success: true };
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/user-not-found' || String(error).includes('user-not-found')) {
        return { success: false, error: 'Alamat email tidak ditemukan atau belum terdaftar dalam sistem.' };
      }
      return { success: false, error: formatAuthError(error) };
    }
  }

  public static async register(
    name: string,
    email: string,
    passwordPlain: string,
    bio: string,
    extra?: {
      phone?: string;
      portfolioUrl?: string;
      preferredCategories?: string[];
    }
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Format alamat email tidak valid. Masukkan email yang benar.' };
      }
      if (!passwordPlain || passwordPlain.length < 6) {
        return { success: false, error: 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.' };
      }

      let uid = 'user-' + Date.now();
      try {
        const credential = await createUserWithEmailAndPassword(auth, cleanEmail, passwordPlain);
        uid = credential.user.uid;
        await updateProfile(credential.user, { displayName: name.trim() });
      } catch (authErr: any) {
        return { success: false, error: formatAuthError(authErr) };
      }

      const newUser: User = {
        id: uid,
        name: name.trim(),
        email: cleanEmail,
        role: 'contributor',
        approvalStatus: 'pending',
        bio: bio.trim() || 'Penulis dan kontributor baru di Rumah Dessa Mentari.',
        phone: extra?.phone?.trim() || '',
        portfolioUrl: extra?.portfolioUrl?.trim() || '',
        preferredCategories: extra?.preferredCategories || [],
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
        createdAt: new Date().toISOString(),
      };

      // 1. Local state update
      const users = this.cachedGet<any[]>(STORAGE_KEYS.USERS, []);
      users.push(newUser);
      this.cachedSet(STORAGE_KEYS.USERS, users);
      this.cachedSet(STORAGE_KEYS.CURRENT_USER, newUser);

      this.sendEmailNotification(
        'new_writer_registration',
        `[RDM - Pengajuan Penulis Baru] ${newUser.name}`,
        `Pengajuan pendaftaran akun penulis baru:\n- Nama: ${newUser.name}\n- Email: ${newUser.email}\n- WhatsApp: ${newUser.phone || '-'}\n- Status: MENUNGGU ACC (PENDING).`
      );

      // 2. Background Firestore write
      const cleanDoc = cleanUndefined(newUser);
      try {
        await setDoc(doc(db, 'users', newUser.id), cleanDoc, { merge: true });
        logFirestoreDiag('register', `users/${newUser.id}`, cleanDoc, true);
      } catch (e: any) {
        logFirestoreDiag('register', `users/${newUser.id}`, cleanDoc, false, e);
        console.warn('Cloud store user registration warning:', e);
      }

      this.notify();
      return { success: true, user: newUser };
    } catch (error: any) {
      return { success: false, error: formatAuthError(error) };
    }
  }

  public static createWriterByAdmin(writerData: {
    name: string;
    email: string;
    passwordPlain: string;
    bio: string;
    phone?: string;
    role?: 'contributor' | 'editor' | 'admin';
    preferredCategories?: string[];
  }): { success: boolean; error?: string; user?: User } {
    const admin = this.getCurrentUser();
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: 'Hanya Administrator yang berwenang membuat akun.' };
    }

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: writerData.name.trim(),
      email: writerData.email.trim().toLowerCase(),
      role: writerData.role || 'contributor',
      approvalStatus: 'approved',
      bio: writerData.bio.trim() || 'Penulis resmi terdaftar.',
      phone: writerData.phone?.trim() || '',
      preferredCategories: writerData.preferredCategories || [],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      createdAt: new Date().toISOString(),
    };

    // 1. Local state update
    const users = this.cachedGet<any[]>(STORAGE_KEYS.USERS, []);
    users.push(newUser);
    this.cachedSet(STORAGE_KEYS.USERS, users);

    // 2. Background Firestore write
    const cleanDoc = cleanUndefined(newUser);
    setDoc(doc(db, 'users', newUser.id), cleanDoc, { merge: true })
      .then(() => {
        logFirestoreDiag('createWriterByAdmin', `users/${newUser.id}`, cleanDoc, true);
      })
      .catch((e) => {
        logFirestoreDiag('createWriterByAdmin', `users/${newUser.id}`, cleanDoc, false, e);
        handleFirestoreError(e, OperationType.WRITE, `users/${newUser.id}`);
        console.warn('Cloud store create writer warning:', e);
      });

    this.sendEmailNotification(
      'writer_acc',
      `[RDM - Akun Penulis Dibuat Admin] ${newUser.name}`,
      `Akun penulis dibuat dan langsung di-ACC oleh Admin.`
    );

    this.notify();
    return { success: true, user: newUser };
  }

  public static async approveWriterAccount(
    userId: string,
    decision: 'approved' | 'rejected'
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Update local state immediately
    const users = this.cachedGet<any[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].approvalStatus = decision;
      this.cachedSet(STORAGE_KEYS.USERS, users);
    }

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.approvalStatus = decision;
      this.cachedSet(STORAGE_KEYS.CURRENT_USER, current);
    }

    // 2. Sync with Cloud Firestore
    const payload = cleanUndefined({ approvalStatus: decision });
    try {
      await setDoc(doc(db, 'users', userId), payload, { merge: true });
      logFirestoreDiag('approveWriterAccount', `users/${userId}`, payload, true);
    } catch (e: any) {
      logFirestoreDiag('approveWriterAccount', `users/${userId}`, payload, false, e);
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
      console.warn('Cloud store writer approval warning:', e);
    }

    this.notify();
    return { success: true };
  }

  public static getPendingWriters(): User[] {
    const users = this.cachedGet<User[]>(STORAGE_KEYS.USERS, []);
    return users.filter(u => u.role === 'contributor' && u.approvalStatus === 'pending');
  }

  public static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.invalidateCache(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  public static getAllUsers(): User[] {
    return this.cachedGet<User[]>(STORAGE_KEYS.USERS, []);
  }

  public static async refreshUsersFromCloud(): Promise<User[]> {
    const user = this.getCurrentUser();
    const isPrivileged = user && (user.role === 'admin' || user.role === 'editor') && user.approvalStatus === 'approved';
    const email = auth.currentUser?.email?.toLowerCase();
    const isRootAdmin = email === 'santosodeni3@gmail.com' || email === 'denisarah26@gmail.com';

    if (!isPrivileged && !isRootAdmin) {
      return this.cachedGet<User[]>(STORAGE_KEYS.USERS, []);
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      if (!querySnapshot.empty) {
        const firestoreUsers: User[] = [];
        querySnapshot.forEach((docSnap) => {
          firestoreUsers.push(docSnap.data() as User);
        });
        this.cachedSet(STORAGE_KEYS.USERS, firestoreUsers);
        this.notify();
        return firestoreUsers;
      }
    } catch (e: any) {
      if (e?.code !== 'permission-denied') {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }
    }
    return this.cachedGet<User[]>(STORAGE_KEYS.USERS, []);
  }

  public static async updateUserRole(userId: string, newRole: 'reader' | 'contributor' | 'editor' | 'admin'): Promise<{ success: boolean; error?: string }> {
    // 1. Update local state immediately
    const users = this.cachedGet<any[]>(STORAGE_KEYS.USERS, []);
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].role = newRole;
      users[idx].approvalStatus = 'approved';
      this.cachedSet(STORAGE_KEYS.USERS, users);
    }

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.role = newRole;
      current.approvalStatus = 'approved';
      this.cachedSet(STORAGE_KEYS.CURRENT_USER, current);
    }

    // 2. Sync with Cloud Firestore
    const payload = cleanUndefined({ role: newRole, approvalStatus: 'approved' });
    try {
      await setDoc(doc(db, 'users', userId), payload, { merge: true });
      logFirestoreDiag('updateUserRole', `users/${userId}`, payload, true);
    } catch (e: any) {
      logFirestoreDiag('updateUserRole', `users/${userId}`, payload, false, e);
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
      console.warn('Cloud store role update warning:', e);
    }

    this.notify();
    return { success: true };
  }

  public static async updateUserProfile(
    userId: string,
    profileData: {
      name?: string;
      bio?: string;
      avatarUrl?: string;
      phone?: string;
      portfolioUrl?: string;
      preferredCategories?: string[];
    }
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    // 1. Update local state immediately
    const users = this.cachedGet<any[]>(STORAGE_KEYS.USERS, []);
    let idx = users.findIndex(u => u.id === userId);

    const current = this.getCurrentUser();
    if (idx === -1 && current?.email) {
      idx = users.findIndex(u => u.email?.toLowerCase().trim() === current.email.toLowerCase().trim());
    }

    const baseUser: User = current && (current.id === userId || (idx !== -1 && users[idx].id === current.id))
      ? current
      : (idx !== -1 ? users[idx] : {
          id: userId,
          name: profileData.name || 'Penulis',
          email: auth.currentUser?.email || '',
          role: 'contributor',
          approvalStatus: 'approved',
          bio: '',
          createdAt: new Date().toISOString()
        });

    const updatedUser: User = {
      ...baseUser,
      id: userId,
      name: profileData.name !== undefined && profileData.name.trim() ? profileData.name.trim() : baseUser.name,
      bio: profileData.bio !== undefined && profileData.bio.trim() ? profileData.bio.trim() : baseUser.bio,
      avatarUrl: profileData.avatarUrl !== undefined && profileData.avatarUrl.trim() ? profileData.avatarUrl.trim() : baseUser.avatarUrl,
      phone: profileData.phone !== undefined ? profileData.phone.trim() : baseUser.phone,
      portfolioUrl: profileData.portfolioUrl !== undefined ? profileData.portfolioUrl.trim() : baseUser.portfolioUrl,
      preferredCategories: profileData.preferredCategories !== undefined ? profileData.preferredCategories : baseUser.preferredCategories,
    };

    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    this.cachedSet(STORAGE_KEYS.USERS, users);

    if (current && (current.id === userId || current.email?.toLowerCase().trim() === updatedUser.email?.toLowerCase().trim())) {
      this.cachedSet(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    // Cascade updates to authorName, authorBio, authorAvatar in user's articles
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    let articlesChanged = false;
    articles.forEach((a, index) => {
      if (a.authorId === userId || (updatedUser.email && a.authorId === current?.id) || (updatedUser.name && a.authorName === current?.name)) {
        if (profileData.name) articles[index].authorName = profileData.name.trim();
        if (profileData.bio) articles[index].authorBio = profileData.bio.trim();
        if (profileData.avatarUrl) articles[index].authorAvatar = profileData.avatarUrl.trim();
        articlesChanged = true;
      }
    });
    if (articlesChanged) {
      this.cachedSet(STORAGE_KEYS.ARTICLES, articles);
    }

    // 2. Sync to Cloud Firestore
    const payload = cleanUndefined({
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      phone: updatedUser.phone,
      portfolioUrl: updatedUser.portfolioUrl,
      preferredCategories: updatedUser.preferredCategories,
    });

    try {
      const targetDocId = (auth.currentUser && auth.currentUser.email?.toLowerCase() === updatedUser.email.toLowerCase())
        ? auth.currentUser.uid
        : userId;

      await setDoc(doc(db, 'users', targetDocId), payload, { merge: true });
      logFirestoreDiag('updateUserProfile', `users/${targetDocId}`, payload, true);
    } catch (e: any) {
      logFirestoreDiag('updateUserProfile', `users/${userId}`, payload, false, e);
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
      console.warn('Cloud store profile update warning:', e);
    }

    // 3. Sync to Firebase Auth user profile if logged in
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: updatedUser.name,
          photoURL: updatedUser.avatarUrl,
        });
      } catch (authErr) {
        console.warn('Auth user profile update warning:', authErr);
      }
    }

    this.notify();
    return { success: true, user: updatedUser };
  }

  public static getArticles(status?: ArticleStatus): Article[] {
    let articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    if (!articles || articles.length === 0) {
      articles = [...DEFAULT_SEED_ARTICLES];
      this.cachedSet(STORAGE_KEYS.ARTICLES, articles);
    }
    if (status) {
      return articles.filter(a => a.status === status);
    }
    return articles;
  }

  public static getPublishedArticles(category?: ArticleCategory | 'Semua', searchQuery?: string): Article[] {
    let list = this.getArticles('published');
    if (category && category !== 'Semua') {
      list = list.filter(a => a.category === category);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());
  }

  public static getArticleBySlug(slug: string): Article | undefined {
    const list = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    return list.find(a => a.slug === slug);
  }

  public static getArticlesByAuthor(authorId: string): Article[] {
    const list = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    return list.filter(a => a.authorId === authorId);
  }

  public static getArticlesForReview(): Article[] {
    const list = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    return list.filter(a => a.status === 'submitted' || a.status === 'under_review');
  }

  public static async refreshArticlesFromCloud(category?: ArticleCategory | 'Semua'): Promise<Article[]> {
    try {
      const user = this.getCurrentUser();
      const isPrivileged = user && (user.role === 'admin' || user.role === 'editor') && user.approvalStatus === 'approved';
      
      let q;
      if (isPrivileged) {
        q = collection(db, 'articles');
      } else if (category && category !== 'Semua') {
        q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          where('category', '==', category),
          orderBy('publishedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const cloudArticles: Article[] = [];
        querySnapshot.forEach(docSnap => cloudArticles.push(docSnap.data() as Article));
        const localArticles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
        const mergedMap = new Map<string, Article>();
        localArticles.forEach(a => mergedMap.set(a.id, a));
        cloudArticles.forEach(a => mergedMap.set(a.id, a));
        const finalArticles = Array.from(mergedMap.values());
        this.cachedSet(STORAGE_KEYS.ARTICLES, finalArticles);
        this.notify();
        return finalArticles;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'articles');
    }
    return this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
  }

  public static async saveArticle(data: Partial<Article>, asSubmit: boolean = false): Promise<{ success: boolean; article?: Article; error?: string }> {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'Silakan masuk terlebih dahulu.' };
    }

    if (asSubmit && user.approvalStatus === 'pending') {
      return {
        success: false,
        error: 'Akun Anda masih dalam status "Menunggu Persetujuan (ACC)". Anda dapat menyimpan sebagai draf.',
      };
    }

    if (!data.title || data.title.trim().length < 5) {
      return { success: false, error: 'Judul minimal 5 karakter.' };
    }

    if (!data.content || data.content.trim().length < 50) {
      return { success: false, error: 'Isi artikel minimal 50 karakter.' };
    }

    const readingTime = calculateReadingTime(data.content || '', data.summary || '', 200);
    const cleanSlug = (data.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .substring(0, 80);

    const now = new Date().toISOString();
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const existingIndex = articles.findIndex(a => a.id === data.id);

    let savedArticle: Article;
    if (existingIndex !== -1) {
      const target = articles[existingIndex];
      savedArticle = {
        ...target,
        title: data.title || target.title,
        summary: data.summary || target.summary,
        content: data.content || target.content,
        category: data.category || target.category,
        tags: data.tags || target.tags,
        coverImage: data.coverImage || target.coverImage,
        readingTime,
        updatedAt: now,
        status: asSubmit ? 'submitted' : (data.status || target.status),
      };
      if (asSubmit) {
        savedArticle.submittedAt = now;
      }
    } else {
      savedArticle = {
        id: data.id || ('art-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
        slug: `${cleanSlug}-${Date.now().toString().slice(-4)}`,
        title: data.title,
        summary: data.summary || data.content.substring(0, 160) + '...',
        content: data.content,
        category: data.category || 'Opini dan Gagasan',
        tags: data.tags && data.tags.length > 0 ? data.tags : ['Tulisan Kontributor'],
        authorId: user.id,
        authorName: user.name,
        authorBio: user.bio || 'Kontributor RDM',
        authorAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        imageAttribution: data.imageAttribution || 'Arsip RDM',
        readingTime,
        status: asSubmit ? 'submitted' : 'draft',
        sources: data.sources || [],
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      if (asSubmit) {
        savedArticle.submittedAt = now;
      }
    }

    // 1. Update local cache immediately so the user's action succeeds without waiting or blocking
    if (existingIndex !== -1) {
      articles[existingIndex] = savedArticle;
    } else {
      articles.unshift(savedArticle);
    }
    this.cachedSet(STORAGE_KEYS.ARTICLES, articles);

    if (asSubmit) {
      this.sendEmailNotification(
        'new_article_submitted',
        `[RDM - Naskah Diajukan] "${savedArticle.title}"`,
        `Naskah baru diajukan oleh ${user.name}.`
      );
    }

    // 2. Background cloud write with clean undefined handling
    const cleanDoc = cleanUndefined(savedArticle);
    try {
      await setDoc(doc(db, 'articles', savedArticle.id), cleanDoc, { merge: true });
      logFirestoreDiag('saveArticle', `articles/${savedArticle.id}`, cleanDoc, true);
    } catch (e: any) {
      logFirestoreDiag('saveArticle', `articles/${savedArticle.id}`, cleanDoc, false, e);
      handleFirestoreError(e, OperationType.WRITE, `articles/${savedArticle.id}`);
      console.warn('Cloud store article write warning:', e);
    }

    this.notify();
    return { success: true, article: savedArticle };
  }

  public static async reviewArticleDecision(
    articleId: string,
    decision: 'approved' | 'revision_requested' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const idx = articles.findIndex(a => a.id === articleId);
    if (idx === -1) return { success: false, error: 'Artikel tidak ditemukan.' };

    const now = new Date().toISOString();
    const target = articles[idx];

    if (decision === 'approved') {
      target.status = 'published';
      target.publishedAt = target.publishedAt || now;
    } else if (decision === 'revision_requested') {
      target.status = 'revision_requested';
      target.revisionNotes = notes || 'Mohon disempurnakan.';
    } else if (decision === 'rejected') {
      target.status = 'rejected';
      target.revisionNotes = notes || 'Naskah belum sesuai standar redaksi.';
    }
    target.reviewedAt = now;
    target.updatedAt = now;

    // 1. Update local cache immediately
    articles[idx] = target;
    this.cachedSet(STORAGE_KEYS.ARTICLES, articles);

    // 2. Sync to Cloud Firestore
    const cleanDoc = cleanUndefined(target);
    try {
      await setDoc(doc(db, 'articles', target.id), cleanDoc, { merge: true });
      logFirestoreDiag('reviewArticleDecision', `articles/${target.id}`, cleanDoc, true);
    } catch (e: any) {
      logFirestoreDiag('reviewArticleDecision', `articles/${target.id}`, cleanDoc, false, e);
      handleFirestoreError(e, OperationType.WRITE, `articles/${target.id}`);
      console.warn('Cloud store review decision warning:', e);
    }

    // 3. Dispatch Writer Notification to Author
    if (target.authorId) {
      let notifMessage = '';
      if (decision === 'approved') {
        notifMessage = `Alhamdulillah! Naskah Anda "${target.title}" telah disetujui oleh Meja Redaksi dan resmi diterbitkan di portal.`;
      } else if (decision === 'revision_requested') {
        notifMessage = `Meja Redaksi telah menelaah naskah "${target.title}" dan meminta perbaikan sebelum penerbitan. Catatan: ${notes || 'Mohon disempurnakan.'}`;
      } else if (decision === 'rejected') {
        notifMessage = `Naskah "${target.title}" belum dapat diterbitkan pada periode kurasi ini. Catatan: ${notes || 'Belum memenuhi standar kurasi.'}`;
      }

      this.addWriterNotification({
        userId: target.authorId,
        articleId: target.id,
        articleTitle: target.title,
        type: decision,
        message: notifMessage,
        revisionNotes: notes,
      });
    }

    this.notify();
    return { success: true };
  }

  public static getWriterNotifications(userId: string): WriterNotification[] {
    const notifications = this.cachedGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async refreshNotificationsFromCloud(userId: string): Promise<WriterNotification[]> {
    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cloudNotifs: WriterNotification[] = [];
        snapshot.forEach(docSnap => cloudNotifs.push(docSnap.data() as WriterNotification));
        
        const localNotifs = safeGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
        const mergedMap = new Map<string, WriterNotification>();
        localNotifs.forEach(n => mergedMap.set(n.id, n));
        cloudNotifs.forEach(n => mergedMap.set(n.id, n));
        
        const finalNotifs = Array.from(mergedMap.values());
        this.cachedSet(STORAGE_KEYS.NOTIFICATIONS, finalNotifs);
        this.notify();
        return finalNotifs.filter(n => n.userId === userId);
      }
    } catch (e) {
      console.warn('Could not refresh notifications from Firestore:', e);
    }
    return this.getWriterNotifications(userId);
  }

  public static addWriterNotification(data: Omit<WriterNotification, 'id' | 'createdAt' | 'isRead'>): WriterNotification {
    const notifs = this.cachedGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: WriterNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: data.userId,
      articleId: data.articleId,
      articleTitle: data.articleTitle,
      type: data.type,
      message: data.message,
      revisionNotes: data.revisionNotes,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    this.cachedSet(STORAGE_KEYS.NOTIFICATIONS, notifs);

    // Sync to Cloud
    const cleanDoc = cleanUndefined(newNotif);
    setDoc(doc(db, 'notifications', newNotif.id), cleanDoc, { merge: true })
      .catch(e => console.warn('Cloud store notification sync warning:', e));

    return newNotif;
  }

  public static async markNotificationAsRead(id: string): Promise<void> {
    const notifs = this.cachedGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].isRead = true;
      this.cachedSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
      try {
        await setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true });
      } catch (e) {
        console.warn('Could not sync notification read status to cloud:', e);
      }
      this.notify();
    }
  }

  public static markAllNotificationsAsRead(userId: string): void {
    const notifs = this.cachedGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    let changed = false;
    notifs.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      this.cachedSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.notify();
    }
  }

  public static deleteNotification(id: string): void {
    const notifs = this.cachedGet<WriterNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = notifs.filter(n => n.id !== id);
    this.cachedSet(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.notify();
  }

  public static async deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
    // 1. Update local cache immediately
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const updated = articles.filter(a => a.id !== articleId);
    this.cachedSet(STORAGE_KEYS.ARTICLES, updated);

    // 2. Cloud delete
    try {
      await deleteDoc(doc(db, 'articles', articleId));
      logFirestoreDiag('deleteArticle', `articles/${articleId}`, { id: articleId }, true);
    } catch (e: any) {
      logFirestoreDiag('deleteArticle', `articles/${articleId}`, { id: articleId }, false, e);
      handleFirestoreError(e, OperationType.DELETE, `articles/${articleId}`);
      console.warn('Cloud store delete article warning:', e);
    }

    this.notify();
    return { success: true };
  }

  public static getConsultations(): ConsultationRequest[] {
    return this.cachedGet<ConsultationRequest[]>(STORAGE_KEYS.CONSULTATIONS, []);
  }

  public static async submitConsultation(inquiry: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    const newReq: ConsultationRequest = {
      id: 'cons-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      clientName: inquiry.clientName,
      email: inquiry.email,
      whatsapp: inquiry.whatsapp,
      serviceType: inquiry.serviceType,
      notes: inquiry.notes,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    if (inquiry.manuscriptTitle) {
      newReq.manuscriptTitle = inquiry.manuscriptTitle;
    }
    if (inquiry.wordCountEstimate) {
      newReq.wordCountEstimate = inquiry.wordCountEstimate;
    }

    // 1. Update local cache immediately
    const list = this.getConsultations();
    list.unshift(newReq);
    this.cachedSet(STORAGE_KEYS.CONSULTATIONS, list);

    this.sendEmailNotification(
      'consultation_request',
      `[RDM - Permohonan Konsultasi Baru] ${inquiry.serviceType}`,
      `Klien: ${inquiry.clientName} (${inquiry.email} / ${inquiry.whatsapp})`
    );

    // 2. Sync to Cloud Firestore
    const cleanDoc = cleanUndefined(newReq);
    try {
      await setDoc(doc(db, 'consultations', newReq.id), cleanDoc, { merge: true });
      logFirestoreDiag('submitConsultation', `consultations/${newReq.id}`, cleanDoc, true);
    } catch (err: any) {
      logFirestoreDiag('submitConsultation', `consultations/${newReq.id}`, cleanDoc, false, err);
      handleFirestoreError(err, OperationType.WRITE, `consultations/${newReq.id}`);
      console.warn('Cloud store consultation submit warning:', err);
    }

    this.notify();
    return { success: true, id: newReq.id };
  }

  public static async refreshConsultationsFromCloud(): Promise<ConsultationRequest[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'consultations'));
      if (!querySnapshot.empty) {
        const cloudList: ConsultationRequest[] = [];
        querySnapshot.forEach(docSnap => cloudList.push(docSnap.data() as ConsultationRequest));
        this.cachedSet(STORAGE_KEYS.CONSULTATIONS, cloudList);
        this.notify();
        return cloudList;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'consultations');
    }
    return this.cachedGet<ConsultationRequest[]>(STORAGE_KEYS.CONSULTATIONS, []);
  }

  public static async updateConsultationStatus(id: string, status: 'new' | 'contacted' | 'completed'): Promise<{ success: boolean; error?: string }> {
    // 1. Update local cache immediately
    const list = this.getConsultations();
    const idx = list.findIndex(c => c.id === id);
    let localItem: ConsultationRequest | null = null;
    if (idx !== -1) {
      list[idx].status = status;
      localItem = list[idx];
      this.cachedSet(STORAGE_KEYS.CONSULTATIONS, list);
    }

    // 2. Sync to Cloud Firestore
    const payload = cleanUndefined({ status });
    try {
      await setDoc(doc(db, 'consultations', id), payload, { merge: true });
      logFirestoreDiag('updateConsultationStatus', `consultations/${id}`, payload, true);
    } catch (e: any) {
      // If doc didn't exist in Firestore, write full record
      if (localItem) {
        try {
          const fullDoc = cleanUndefined(localItem);
          await setDoc(doc(db, 'consultations', id), fullDoc, { merge: true });
          logFirestoreDiag('updateConsultationStatus(fullDoc)', `consultations/${id}`, fullDoc, true);
          this.notify();
          return { success: true };
        } catch (innerErr: any) {
          logFirestoreDiag('updateConsultationStatus', `consultations/${id}`, payload, false, innerErr);
          handleFirestoreError(innerErr, OperationType.UPDATE, `consultations/${id}`);
        }
      } else {
        logFirestoreDiag('updateConsultationStatus', `consultations/${id}`, payload, false, e);
        handleFirestoreError(e, OperationType.UPDATE, `consultations/${id}`);
      }
      console.warn('Cloud store consultation status warning:', e);
    }

    this.notify();
    return { success: true };
  }

  public static getCorrections(): CorrectionReport[] {
    return this.cachedGet<CorrectionReport[]>(STORAGE_KEYS.CORRECTIONS, []);
  }

  public static async refreshCorrectionsFromCloud(): Promise<CorrectionReport[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'corrections'));
      if (!querySnapshot.empty) {
        const cloudList: CorrectionReport[] = [];
        querySnapshot.forEach(docSnap => cloudList.push(docSnap.data() as CorrectionReport));
        this.cachedSet(STORAGE_KEYS.CORRECTIONS, cloudList);
        this.notify();
        return cloudList;
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'corrections');
    }
    return this.cachedGet<CorrectionReport[]>(STORAGE_KEYS.CORRECTIONS, []);
  }

  public static async submitCorrection(report: Omit<CorrectionReport, 'id' | 'status' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    const newReport: CorrectionReport = {
      id: 'corr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      articleId: report.articleId,
      articleTitle: report.articleTitle,
      reporterName: report.reporterName,
      reporterEmail: report.reporterEmail,
      issueType: report.issueType,
      description: report.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (report.sourceEvidence) {
      newReport.sourceEvidence = report.sourceEvidence;
    }

    // 1. Update local cache immediately
    const list = this.getCorrections();
    list.unshift(newReport);
    this.cachedSet(STORAGE_KEYS.CORRECTIONS, list);

    // 2. Sync to Cloud Firestore
    const cleanDoc = cleanUndefined(newReport);
    try {
      await setDoc(doc(db, 'corrections', newReport.id), cleanDoc, { merge: true });
      logFirestoreDiag('submitCorrection', `corrections/${newReport.id}`, cleanDoc, true);
    } catch (err: any) {
      logFirestoreDiag('submitCorrection', `corrections/${newReport.id}`, cleanDoc, false, err);
      handleFirestoreError(err, OperationType.WRITE, `corrections/${newReport.id}`);
      console.warn('Cloud store correction submit warning:', err);
    }

    this.notify();
    return { success: true };
  }

  public static async updateCorrectionStatus(id: string, status: 'pending' | 'resolved' | 'dismissed'): Promise<{ success: boolean; error?: string }> {
    // 1. Update local cache immediately
    const list = this.getCorrections();
    const idx = list.findIndex(c => c.id === id);
    let localItem: CorrectionReport | null = null;
    if (idx !== -1) {
      list[idx].status = status;
      localItem = list[idx];
      this.cachedSet(STORAGE_KEYS.CORRECTIONS, list);
    }

    // 2. Sync to Cloud Firestore
    const payload = cleanUndefined({ status });
    try {
      await setDoc(doc(db, 'corrections', id), payload, { merge: true });
      logFirestoreDiag('updateCorrectionStatus', `corrections/${id}`, payload, true);
    } catch (e: any) {
      if (localItem) {
        try {
          const fullDoc = cleanUndefined(localItem);
          await setDoc(doc(db, 'corrections', id), fullDoc, { merge: true });
          logFirestoreDiag('updateCorrectionStatus(fullDoc)', `corrections/${id}`, fullDoc, true);
          this.notify();
          return { success: true };
        } catch (innerErr: any) {
          logFirestoreDiag('updateCorrectionStatus', `corrections/${id}`, payload, false, innerErr);
          handleFirestoreError(innerErr, OperationType.UPDATE, `corrections/${id}`);
        }
      } else {
        logFirestoreDiag('updateCorrectionStatus', `corrections/${id}`, payload, false, e);
        handleFirestoreError(e, OperationType.UPDATE, `corrections/${id}`);
      }
      console.warn('Cloud store correction status warning:', e);
    }

    this.notify();
    return { success: true };
  }

  public static getBooks(): BookCatalogItem[] {
    return safeGet<BookCatalogItem[]>(STORAGE_KEYS.BOOKS, []);
  }

  public static addBookProposal(book: Omit<BookCatalogItem, 'id' | 'status'>): void {
    const list = this.getBooks();
    const newItem: BookCatalogItem = {
      id: 'book-' + Date.now(),
      ...book,
      status: 'pembinaan_naskah',
    };
    list.push(newItem);
    safeSet(STORAGE_KEYS.BOOKS, list);

    // Sync to Cloud
    const cleanDoc = cleanUndefined(newItem);
    setDoc(doc(db, 'books', newItem.id), cleanDoc, { merge: true })
      .catch(e => console.warn('Cloud store book proposal sync warning:', e));

    this.notify();
  }

  public static async refreshBooksFromCloud(): Promise<BookCatalogItem[]> {
    try {
      const q = query(collection(db, 'books'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cloudBooks: BookCatalogItem[] = [];
        snapshot.forEach(docSnap => cloudBooks.push(docSnap.data() as BookCatalogItem));
        this.cachedSet(STORAGE_KEYS.BOOKS, cloudBooks);
        this.notify();
        return cloudBooks;
      }
    } catch (e) {
      console.warn('Could not refresh books from Firestore:', e);
    }
    return this.getBooks();
  }

  public static async updateBookStatus(id: string, status: BookCatalogItem['status']): Promise<void> {
    const list = this.getBooks();
    const idx = list.findIndex(b => b.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      this.cachedSet(STORAGE_KEYS.BOOKS, list);
      try {
        await setDoc(doc(db, 'books', id), { status }, { merge: true });
      } catch (e) {
        console.warn('Could not sync book status update to cloud:', e);
      }
      this.notify();
    }
  }

  public static exportAllData(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      platform: 'Rumah Dessa Mentari',
      adminRecipient: 'santosodeni3@gmail.com',
      articles: safeGet(STORAGE_KEYS.ARTICLES, []),
      users: safeGet(STORAGE_KEYS.USERS, []),
      settings: safeGet(STORAGE_KEYS.SETTINGS, {}),
      siteVisits: this.getSiteVisitsCount(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importAllData(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.articles) safeSet(STORAGE_KEYS.ARTICLES, parsed.articles);
      if (parsed.users) safeSet(STORAGE_KEYS.USERS, parsed.users);
      if (parsed.settings) safeSet(STORAGE_KEYS.SETTINGS, parsed.settings);
      if (parsed.siteVisits) safeSet('dml_site_visits_v1', parsed.siteVisits);
      this.notify();
      return { success: true };
    } catch {
      return { success: false, error: 'Format JSON tidak valid.' };
    }
  }

  private static STORAGE_KEY_VISITS = 'dml_site_visits_v1';
  private static STORAGE_KEY_DAILY_VISITS = 'dml_daily_visits_v1';

  public static getSiteVisitsCount(): number {
    return safeGet<number>(this.STORAGE_KEY_VISITS, 0);
  }

  public static getDailyVisits(): { date: string; visits: number }[] {
    return safeGet<{ date: string; visits: number }[]>(this.STORAGE_KEY_DAILY_VISITS, []);
  }

  public static incrementSiteVisit(): void {
    const current = this.getSiteVisitsCount();
    const sessionKey = 'dml_visited_session';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');
      const updated = current + 1;
      safeSet(this.STORAGE_KEY_VISITS, updated);

      // Record daily visit breakdown
      const daily = this.getDailyVisits();
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = daily.find(d => d.date === today);
      if (todayEntry) {
        todayEntry.visits += 1;
      } else {
        daily.push({ date: today, visits: 1 });
      }
      safeSet(this.STORAGE_KEY_DAILY_VISITS, daily.slice(-30));

      this.notify();
    }
  }

  public static async likeArticle(articleId: string): Promise<{ success: boolean; likes: number }> {
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const idx = articles.findIndex(a => a.id === articleId);
    if (idx !== -1) {
      const likedKey = `dml_liked_art_${articleId}`;
      const isAlreadyLiked = sessionStorage.getItem(likedKey) === 'true';
      const currentLikes = articles[idx].likes !== undefined ? articles[idx].likes : (Math.floor((articles[idx].views || 10) / 8) + 5);
      
      let newLikes = currentLikes;
      if (!isAlreadyLiked) {
        sessionStorage.setItem(likedKey, 'true');
        newLikes = currentLikes + 1;
      } else {
        sessionStorage.removeItem(likedKey);
        newLikes = Math.max(0, currentLikes - 1);
      }

      articles[idx].likes = newLikes;
      this.cachedSet(STORAGE_KEYS.ARTICLES, articles);

      try {
        await setDoc(doc(db, 'articles', articleId), { likes: newLikes }, { merge: true });
      } catch (e) {
        console.warn('Could not sync article likes to cloud:', e);
      }
      this.notify();
      return { success: true, likes: newLikes };
    }
    return { success: false, likes: 0 };
  }

  public static async incrementArticleViews(articleId: string): Promise<void> {
    const articles = this.cachedGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const idx = articles.findIndex(a => a.id === articleId);
    if (idx !== -1) {
      const viewedKey = `dml_viewed_art_${articleId}`;
      if (!sessionStorage.getItem(viewedKey)) {
        sessionStorage.setItem(viewedKey, 'true');
        articles[idx].views = (articles[idx].views || 0) + 1;
        this.cachedSet(STORAGE_KEYS.ARTICLES, articles);

        try {
          await setDoc(doc(db, 'articles', articleId), { views: articles[idx].views }, { merge: true });
        } catch (e) {
          console.warn('Could not sync article views to cloud:', e);
        }
        this.notify();
      }
    }
  }

  public static getCommentsForArticle(articleId: string): ArticleComment[] {
    const allComments = safeGet<ArticleComment[]>(STORAGE_KEYS.COMMENTS, []);
    return allComments
      .filter(c => c.articleId === articleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async refreshCommentsFromCloud(articleId: string): Promise<ArticleComment[]> {
    try {
      const q = query(collection(db, 'comments'), where('articleId', '==', articleId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cloudComments: ArticleComment[] = [];
        snapshot.forEach(docSnap => cloudComments.push(docSnap.data() as ArticleComment));
        
        const localComments = safeGet<ArticleComment[]>(STORAGE_KEYS.COMMENTS, []);
        const otherComments = localComments.filter(c => c.articleId !== articleId);
        const finalComments = [...cloudComments, ...otherComments];
        
        this.cachedSet(STORAGE_KEYS.COMMENTS, finalComments);
        this.notify();
        return cloudComments;
      }
    } catch (e) {
      console.warn('Could not refresh comments from Firestore:', e);
    }
    return this.getCommentsForArticle(articleId);
  }

  public static async addComment(
    articleId: string,
    data: { authorName: string; authorEmail?: string; content: string }
  ): Promise<{ success: boolean; comment?: ArticleComment; error?: string }> {
    if (!data.authorName || data.authorName.trim().length < 2) {
      return { success: false, error: 'Nama pengomentar minimal 2 karakter.' };
    }
    if (!data.content || data.content.trim().length < 5) {
      return { success: false, error: 'Komentar minimal 5 karakter.' };
    }

    const allComments = safeGet<ArticleComment[]>(STORAGE_KEYS.COMMENTS, []);
    const newComment: ArticleComment = {
      id: 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      articleId,
      authorName: data.authorName.trim(),
      authorEmail: data.authorEmail?.trim() || '',
      authorAvatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      content: data.content.trim(),
      createdAt: new Date().toISOString(),
    };

    allComments.unshift(newComment);
    safeSet(STORAGE_KEYS.COMMENTS, allComments);

    try {
      await setDoc(doc(db, 'comments', newComment.id), cleanUndefined(newComment), { merge: true });
    } catch (e) {
      console.warn('Could not sync comment to cloud:', e);
    }

    this.notify();
    return { success: true, comment: newComment };
  }

  public static getAuthorRankings(): { authorId: string; authorName: string; authorAvatar: string; count: number }[] {
    const articles = this.getPublishedArticles('Semua');
    const counts: Record<string, { name: string; avatar: string; count: number }> = {};

    articles.forEach(art => {
      if (!art.authorId) return;
      if (!counts[art.authorId]) {
        counts[art.authorId] = {
          name: art.authorName || 'Penulis',
          avatar: art.authorAvatar || '',
          count: 0
        };
      }
      counts[art.authorId].count++;
    });

    return Object.entries(counts)
      .map(([id, data]) => ({
        authorId: id,
        authorName: data.name,
        authorAvatar: data.avatar,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count);
  }

  public static async forceSyncWithFirestore(): Promise<{
    success: boolean;
    articlesCount: number;
    usersCount: number;
    source: string;
    error?: string;
  }> {
    try {
      this.invalidateCache();
      
      // 1. Synchronize articles with Cloud Firestore
      let cloudArticles: Article[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'articles'));
        if (!querySnapshot.empty) {
          querySnapshot.forEach(docSnap => {
            cloudArticles.push(docSnap.data() as Article);
          });
        }
      } catch (e) {
        console.warn('Firestore articles query warning during force sync:', e);
      }

      const mergedArticlesMap = new Map<string, Article>();
      DEFAULT_SEED_ARTICLES.forEach(a => mergedArticlesMap.set(a.id, a));
      
      const localArticles = safeGet<Article[]>(STORAGE_KEYS.ARTICLES, []);
      localArticles.forEach(a => mergedArticlesMap.set(a.id, a));
      cloudArticles.forEach(a => mergedArticlesMap.set(a.id, a));

      const finalArticles = Array.from(mergedArticlesMap.values());
      safeSet(STORAGE_KEYS.ARTICLES, finalArticles);

      // Upload missing seed articles to Cloud Firestore to maintain database parity
      for (const art of DEFAULT_SEED_ARTICLES) {
        const cleanDoc = cleanUndefined(art);
        setDoc(doc(db, 'articles', art.id), cleanDoc, { merge: true }).catch(() => {});
      }

      // 2. Synchronize users with Cloud Firestore
      let cloudUsers: User[] = [];
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        if (!usersSnapshot.empty) {
          usersSnapshot.forEach(docSnap => {
            cloudUsers.push(docSnap.data() as User);
          });
        }
      } catch (e) {
        console.warn('Firestore users query warning during force sync:', e);
      }

      const localUsers = safeGet<User[]>(STORAGE_KEYS.USERS, []);
      const mergedUsersMap = new Map<string, User>();
      localUsers.forEach(u => mergedUsersMap.set(u.id, u));
      cloudUsers.forEach(u => mergedUsersMap.set(u.id, u));

      const finalUsers = Array.from(mergedUsersMap.values());
      safeSet(STORAGE_KEYS.USERS, finalUsers);

      this.invalidateCache();
      this.notify();

      return {
        success: true,
        articlesCount: finalArticles.length,
        usersCount: finalUsers.length,
        source: cloudArticles.length > 0 ? 'Cloud Firestore Live & Arsip Resmi Redaksi' : 'Cadangan Resmi Redaksi RDM',
      };
    } catch (err: any) {
      return {
        success: false,
        articlesCount: 0,
        usersCount: 0,
        source: 'Error',
        error: err?.message || String(err),
      };
    }
  }

  public static resetToDefault(): void {
    localStorage.clear();
    this.init();
    this.notify();
  }
}
