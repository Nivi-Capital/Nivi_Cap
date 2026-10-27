export interface NewsArticle {
  videoUrl: string;
  uid: string;

  title: string;
  publication: string;
  date: string;
  language: string;
  type: 'onlinemedia' | 'video';
  slug: string;

  imageUrl: string;

  smallDescription: string;
  largeDescription: string;

  originalNewsUrl?: string;
  // disclaimerLink?: string;
  disclaimerPublication?: string;

  pdfUrl?: string;

  createdAt?: string;
  views?: number;
  likes?: number;
}