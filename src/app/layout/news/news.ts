import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
// import newsData from '../../../assets/jsonData/publication.json';
// import videoData from '../../../../newsdata/videosList.json';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NewsService } from '../../service/news';
import { NewsArticle } from '../../models/news.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { YouTubePlayer, YouTubePlayerModule } from '@angular/youtube-player';



interface NewsStory {
  image?: string;
  imageUrl?: string;
  ratio?: string;
  aspectRatio?: string;
  source?: string;
  date?: string;
  title?: string;
  description?: string;
  views?: number;
  likes?: number;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, YouTubePlayerModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})


export class News implements OnInit, AfterViewInit, OnDestroy {
  hoveredVideo = -1;
  @ViewChild('player') player!: YouTubePlayer;

  newsList: any[] = [];
  displayedNews: any[] = [];
  itemsPerLoad = 16;
  currentCount = 16;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  visiblePages: (number | string)[] = [];
  selectedHtml = '';
  selectedNews: any;
  // category: any = 'news';
  category: 'news' | 'videos' =
  (sessionStorage.getItem('selectedNewsCategory') as 'news' | 'videos')
  || 'news';
  language: string =
  sessionStorage.getItem('selectedNewsLanguage') || 'English';
  videoList: any[] = [];
  hasLiked = false;

  private newsGridElement?: ElementRef<HTMLElement>;
  video: any;
  totalVideos: any [] = [];
  videoItemsPerLoad = 8;
  videoCurrentCount = 8;

  @ViewChild('newsGrid')
  set newsGrid(value: ElementRef<HTMLElement> | undefined) {
    this.newsGridElement = value;

    // if (value) {
    //   requestAnimationFrame(() => {
    //     this.initializeGrid();
    //   });
    // }
  }


  private readonly ratioNames = new Set(['16-9', '2-3', '21-9', '1-1']);
  private readonly fallbackRatios = ['16-9', '2-3', '21-9', '1-1'];

  
  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private newsService: NewsService, private sanitizer: DomSanitizer) { }
  ngOnInit() {

    this.filterByLanguage(this.language);
    // this.videoList = videoData;

    if (!window.hasOwnProperty('YT')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  ngAfterViewInit(): void {
    this.initializeGrid();
  }



  get pagedNews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.newsList.slice(start, start + this.pageSize);
  }

 formatDate(dateStr: string): string {
  if (!dateStr) {
    return '';
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(' ', ' ').replace(' ', ' ');
}

  generateVisiblePages() {
    const maxButtons = 5;
    this.visiblePages = [];

    if (this.totalPages <= maxButtons) {
      this.visiblePages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      return;
    }

    this.visiblePages.push(1);

    if (this.currentPage > 3) this.visiblePages.push("...");

    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) this.visiblePages.push(i);

    if (this.currentPage < this.totalPages - 2) this.visiblePages.push("...");

    this.visiblePages.push(this.totalPages);
  }

  goToPage(page: any) {
    if (page === "...") return;
    this.currentPage = page;
    this.generateVisiblePages();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.generateVisiblePages();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.generateVisiblePages();
    }
  }

  openNews1(url: string): void {
    window.open(url, '_blank');
  }


  openNews(item: any) {
    console.log(item);
    const url = `/news-details?file=${encodeURIComponent(item.htmlFile)}`;

    window.open(url, '_blank');
  }

  initializeGrid(): void {
    const grid = this.newsGridElement?.nativeElement;

    if (!grid) {
      return;
    }

    this.applyThumbnailRatios();
    this.sizeMasonryCards();

    grid.querySelectorAll<HTMLImageElement>('img').forEach(image => {
      if (!image.complete) {
        image.addEventListener(
          'load',
          this.sizeMasonryCardsHandler,
          { once: true }
        );
      }
    });
  }

  changeSection(section: 'news' | 'videos'): void {
    this.category = section;
sessionStorage.setItem(
    'selectedNewsCategory',
    section
  );
    if (section === 'videos') {
      this.loadVideos();
      return;
    }

    this.loadNews();
  }
  private loadNews(): void {
    this.newsService
      .getNews(this.language)
      .subscribe({
        next: data => {
          this.newsList = data;

          this.currentCount = 16;

          this.displayedNews = this.newsList.slice(
            0,
            this.currentCount
          );

          this.refreshGrid();
        },

        error: error => {
          console.error(
            'Error loading news',
            error
          );

          this.newsList = [];
          this.displayedNews = [];
        }
      });
  }
  shareStory1(news: any): void {
     const title = news.title;
    const newsLink = `${window.location.href}/newscontent/${news.uid}`
 
    if (navigator.share) {
      void navigator.share({ title, url: newsLink });
      return;
    }

    void navigator.clipboard?.writeText(newsLink);
  }
  shareStory(news: NewsArticle): void {
  const language = news.language?.trim().toLowerCase();

  const type =  news.type === 'video' ? 'video' : 'onlinemedia';

  const slug = news.slug?.trim();

  if (!language || !slug) {
    return;
  }

  const routeUrl =
    this.router.serializeUrl(
      this.router.createUrlTree([
        '/newscontent',
        language,
        type,
        slug
      ])
    );

  const relativeRoute =
    routeUrl.replace(/^\//, '');

  const newsLink =
    new URL(
      relativeRoute,
      document.baseURI
    ).href;

  if (navigator.share) {
    void navigator.share({
      title: news.title,
      url: newsLink
    });

    return;
  }

  void navigator.clipboard.writeText(
    newsLink
  );
}


  private readonly sizeMasonryCardsHandler = (): void => {
    this.sizeMasonryCards();
  };

  private normalizeRatio(value: string | null, index: number): string {
    const ratio = String(value || '').replace(/\s*:\s*/g, '-').replace(/\//g, '-');
    return this.ratioNames.has(ratio)
      ? ratio
      : this.fallbackRatios[index % this.fallbackRatios.length];
  }

  private applyThumbnailRatios(): void {
    this.newsGridElement?.nativeElement
      .querySelectorAll<HTMLImageElement>(':scope > .card > img')
      .forEach((image, index) => {
        const ratio = this.normalizeRatio(
          image.dataset['ratio'] || null,
          index
        );

        image.classList.add(`thumbnail--${ratio}`);
      });
  }

  private sizeMasonryCards(): void {
    const grid = this.newsGridElement?.nativeElement;

    if (!grid) {
      return;
    }

    const styles = getComputedStyle(grid);
    const rowHeight = parseFloat(
      styles.getPropertyValue('--masonry-row')
    );

    const rowGap = parseFloat(styles.rowGap) || 0;

    if (!rowHeight) {
      return;
    }

    grid
      .querySelectorAll<HTMLElement>(':scope > .card')
      .forEach(card => {
        const rowSpan = Math.ceil(
          (card.getBoundingClientRect().height + rowGap) /
          (rowHeight + rowGap)
        );

        card.style.setProperty('--row-span', String(rowSpan));
      });
  }

  openArticlePage(item: NewsArticle): void {
    // sessionStorage.setItem('newsData', JSON.stringify(item));
    // this.router.navigate(['/newscontent', item.uid]);

      const language = item.language?.trim().toLowerCase();

  const type = this.getArticleType(item);

  const slug = item.slug?.trim();

  if (!language || !slug) {
    console.error('Article language or slug missing',item );

    return;
  }

    void this.router.navigate(['/newscontent', language,
    type,
    slug]);
  }
  private getArticleType(item: NewsArticle): string {
  return item.type === 'video'
    ? 'video'
    : 'onlinemedia';
}

// for new tab 
  openArticlePage1(item: any): void {
  if (!item?.uid) {
    return;
  }

  const routeUrl = this.router.serializeUrl(
    this.router.createUrlTree([
      '/newscontent',
      item.uid
    ])
  );

  const relativeRoute = routeUrl.replace(/^\//, '');

  const articleUrl = new URL(
    relativeRoute,
    document.baseURI
  ).href;

  window.open(
    articleUrl,
    '_blank',
    'noopener,noreferrer'
  );
}
  openVideo(item: any): void {
    // this.router.navigate(['/newscontent', item.uid]);

     this.router.navigate(['/newscontent', item.language.toLowerCase(),
  item.type,
  item.slug]);
  }

  filterByLanguage(lang: string): void {

    this.language = lang;
     sessionStorage.setItem(
    'selectedNewsLanguage',
    lang
  );

    if (this.category === 'videos') {
      this.loadVideos();
      return;
    }

    this.loadNews();

   
  }
  loadMore(): void {
      if(this.category === "news"){
    this.currentCount += this.itemsPerLoad;

    this.displayedNews = this.newsList.slice(
      0,
      this.currentCount
    );

    this.refreshGrid();
    } else {
      this.videoCurrentCount += this.videoItemsPerLoad;
 
      this.videoList = this.totalVideos.slice(0, this.videoCurrentCount);
    }
  }


  private refreshGrid(): void {
    this.cdr.detectChanges();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.initializeGrid();
      });
    });
  }

  addnews() {
    this.router.navigate(['/newsform']);
  }


  getYouTubeVideoId(url: string): string {

    if (!url) {
      return '';
    }

    const match = url.match(
      /(?:youtube\.com\/(?:.*v=|embed\/|shorts\/)|youtu\.be\/)([^&?\/]+)/
    );

    return match ? match[1] : '';
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const videoId = this.getYouTubeVideoId(url);

    const embedUrl =
      `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
  private loadVideos(): void {
    this.newsService
      .getVideos(this.language)
      .subscribe({
        next: videos => {
          console.log('Videos from PHP:', videos);
          // this.videoList = videos;
          this.videoList = [];
          this.totalVideos = [];
          this.videoCurrentCount = 8;

          this.totalVideos = videos;
          this.videoList = videos.slice(
            0,
            this.videoCurrentCount
          );
 
        },

        error: error => {
          console.error(
            'Error loading videos',
            error
          );

          this.videoList = [];
        }
      });
  }



  getYouTubeThumbnail(url: string): string {
    const videoId = this.getYouTubeVideoId(url);

    if (!videoId) {
      return 'assets/images/video-placeholder.jpg';
    }

    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  onPlay(player: YouTubePlayer) {
    if (player && typeof player.playVideo === 'function') {
      player.playVideo();
    }
  }

  onPause(player: YouTubePlayer) {
    if (player && typeof player.stopVideo === 'function') {
      player.stopVideo();
    }
  }

  likeArticle(item: NewsArticle, event: Event): void {
    const language =item?.language;

const type =item?.type;
    event.stopPropagation();

    const id = item?.uid;

    if (!id || this.isLiked(id)) {
      return;
    }

    this.newsService
      .incrementLike(id,language,type)
      .subscribe({
        next: result => {
          item.likes = result.likes;

          sessionStorage.setItem(
            this.getLikeStorageKey(id),
            'true'
          );
        },

        error: error => {
          console.error(
            'Unable to update like',
            error
          );
        }
      });
  }
  isLiked(id: string): boolean {
    if (!id) {
      return false;
    }

    return sessionStorage.getItem(
      this.getLikeStorageKey(id)
    ) === 'true';
  }

  private getLikeStorageKey(id: string): string {
    return `liked_${id}`;
  }

  
    ngOnDestroy(): void {

  }

}
