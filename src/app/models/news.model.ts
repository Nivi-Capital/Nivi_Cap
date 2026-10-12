export interface NewsArticle {
  videoUrl: string;
  uid: string;

  title: string;
  publication: string;
  date: string;
  language: string;
  type: 'text' | 'video';

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