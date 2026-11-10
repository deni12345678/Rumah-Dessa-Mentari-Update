export type UserRole = 'reader' | 'contributor' | 'editor' | 'admin';

export type UserApprovalStatus = 'approved' | 'pending' | 'rejected';

export type ArticleCategory =
  | 'Kisah Inspiratif'
  | 'Pendidikan'
  | 'Ekonomi dan UMKM'
  | 'Olahraga'
  | 'Kesehatan'
  | 'Opini dan Gagasan'
  | 'Informasi Umum'
  | 'Literasi dan Buku';

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'rejected'
  | 'approved'
  | 'published';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approvalStatus: UserApprovalStatus;
  bio: string;
  avatarUrl?: string;
  phone?: string;
  portfolioUrl?: string;
  preferredCategories?: string[];
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient: string; // santosodeni3@gmail.com
  subject: string;
  body: string;
  type: 'new_writer_registration' | 'writer_acc' | 'consultation_request' | 'new_article_submitted' | 'system_security_notice';
  sentAt: string;
  status: 'delivered' | 'queued';
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  authorId: string;
  authorName: string;
  authorBio: string;
  authorAvatar?: string;
  coverImage: string;
  imageAttribution: string;
  readingTime: number; // in minutes
  status: ArticleStatus;
  sources: string[];
  revisionNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  views: number;
  likes?: number;
  featured?: boolean;
}

export interface CorrectionReport {
  id: string;
  articleId: string;
  articleTitle: string;
  reporterName: string;
  reporterEmail: string;
  issueType: 'fakta_keliru' | 'hak_cipta' | 'kesalahan_bahasa' | 'sumber_tidak_valid' | 'lainnya';
  description: string;
  sourceEvidence?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface ConsultationRequest {
  id: string;
  clientName: string;
  email: string;
  whatsapp: string;
  serviceType: string;
  manuscriptTitle?: string;
  wordCountEstimate?: string;
  notes: string;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
}

export interface BookCatalogItem {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  coverImage: string;
  status: 'koleksi_kurasi' | 'segera_terbit' | 'pembinaan_naskah';
  genre: string;
  estimatedPages: number;
  targetAudience: string;
}

export interface SiteSettings {
  brandName: string;
  slogan: string;
  shortDescription: string;
  whatsappNumber: string; // e.g. 6281234567890
  contactEmail: string;
  adminEmailBackup: string; // santosodeni3@gmail.com
  officeLocation: string;
  allowSubmissions: boolean;
  editorialPolicyVersion: string;
}

export interface WriterNotification {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  type: 'approved' | 'revision_requested' | 'rejected';
  message: string;
  revisionNotes?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}
