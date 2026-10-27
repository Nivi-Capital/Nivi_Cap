import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

// import newsData from '../../../../assets/jsonData/publication.json';
// import videoData from '../../../../assets/jsonData/videosList.json';
import videoData from '../../../../../newsdata/videosList.json';
import { NewsService } from '../../../service/news';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-newscontent',
  imports: [CommonModule],
  templateUrl: './newscontent.html',
  styleUrl: './newscontent.css',
})
export class Newscontent implements OnInit, AfterViewInit {

  // @ViewChild('newsGrid') newsGrid!: ElementRef<HTMLDivElement>;
  private newsGrid?: ElementRef<HTMLDivElement>;
  @ViewChild('newsGrid')
  set newsGridElement(element: ElementRef<HTMLDivElement> | undefined) {
    if (element) {
      this.newsGrid = element;

      setTimeout(() => {
        this.updateCarouselState();
      });
    }
  }

  newsArticle: any;
  newsList: any[] = [];
  trustedUrl?: SafeResourceUrl;

  isAtStart = true;
  isAtEnd = false;
  isSliding = false;

  private readonly cardsPerMove = 1;
  hasLiked = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private newsService: NewsService
  ) { }

  // ngOnInit(): void {
  //   this.route.paramMap.subscribe(params => {
  //     const id = params.get('id');

  //     if (id) {
  //       this.loadContent(id);
  //     }
  //   });
  // }
ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    const slug = params.get('slug');
    const language = params.get('language');
   const type = params.get('type');

   
    if (!language || !type || !slug) {
      console.error('Missi*g article route parameters');
     return;
    }


      this.newsService
        .getNewsBySlug(language, type, slug)
        .subscribe({

          next: article => {

            this.newsArticle = article;
            const id = article.uid;
            if (
              article.type === 'video' &&
              article.videoUrl
            ) {
              this.trustedUrl =
                this.getYouTubeEmbedUrl(
                  article.videoUrl
                );
            }

             if (id) {
           this.initializeArticleInteractions(id);
          }
            this.loadLatestContent(
              article.language
            );
          },

          error: err => {
            console.error(err);
          }

        });

    

  });

}
  ngAfterViewInit(): void {
    // this.updateCarouselState();
    this.cdr.detectChanges();
  }

private initializeArticleInteractions(id: string): void{
  const viewStorageKey =
    this.getViewStorageKey(id);

  const likeStorageKey =
    this.getLikeStorageKey(id);

    const language =
  this.newsArticle?.language;

const type =
  this.newsArticle?.type;

  this.hasLiked =
   sessionStorage.getItem(likeStorageKey) === 'true';

  if (!sessionStorage.getItem(viewStorageKey)) {
   this.newsService
      .incrementView(id,language,
    type)
      .subscribe({
        next: result => {
          this.newsArticle.views = result.views;

        sessionStorage.setItem(
           viewStorageKey,
           'true'
          );
        },

       error: error => {
          console.error(
            'Unable *o update views',
            error          );
        }
      });
 }
}

  private loadContent(id: string): void {
const language =
  this.newsArticle?.language;

const type =
  this.newsArticle?.type;

    this.newsService
      .getNewsById(id)
      .subscribe({

        next: article => {
          if (!article) {
            console.error(
              'News article not found:',
              id
            );

            return;
          }
          console.log('Article response:', article);
          this.newsArticle = article;

          if (article.type === 'video' && article.videoUrl) {
            this.trustedUrl =
              this.getYouTubeEmbedUrl(
                article.videoUrl
              );
          }

          const viewStorageKey = this.getViewStorageKey(id);
          const likeStorageKey = this.getLikeStorageKey(id);

          this.hasLiked =
            sessionStorage.getItem(likeStorageKey) === 'true';

          if (!sessionStorage.getItem(viewStorageKey)) {

            this.newsService
              .incrementView(id,language,type)
              .subscribe({
                next: result => {

                  this.newsArticle.views = result.views;

                  // Prevent view increment after refresh
                  sessionStorage.setItem(
                    viewStorageKey,
                    'true'
                  );
                },

                error: error => {
                  console.error(
                    'Unable to update views',
                    error
                  );
                }
              });
          }


          this.loadLatestContent(article.language);

        },

        error: error => {

          console.error(
            'News not found',
            error
          );

        }
      });
  }


  private loadLatestContent(language: string): void {

    if (this.newsArticle?.type === 'video') {

      this.newsService
        .getVideos(language)
        .subscribe({
          next: videos => {

            console.log(
              'Latest videos response:',
              videos
            );

            this.newsList = videos.filter(
              video =>
                video.uid !== this.newsArticle.uid &&
                video.type === 'video'
            );

            this.resetCarousel();
          },

          error: error => {
            console.error(
              'Unable to load latest videos',
              error
            );

            this.newsList = [];
          }
        });

      return;
    }

    this.newsService
      .getNews(language)
      .subscribe({
        next: articles => {

          console.log(
            'Latest news response:',
            articles
          );

          this.newsList = articles.filter(
            article =>
              article.uid !== this.newsArticle.uid &&
              article.type === 'onlinemedia'
          );

          this.resetCarousel();
        },

        error: error => {
          console.error(
            'Unable to load latest news',
            error
          );

          this.newsList = [];
        }
      });
  }


  nextNews(): void {
    this.moveCarousel(1);
  }

  previousNews(): void {
    this.moveCarousel(-1);
  }

  private moveCarousel(direction: 1 | -1): void {
    if (this.isSliding) {
      return;
    }

    const grid = this.newsGrid?.nativeElement;
    const card = grid?.querySelector<HTMLElement>('.news-card');

    if (!grid || !card) {
      return;
    }

    this.isSliding = true;

    const styles = getComputedStyle(grid);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;

    grid.scrollBy({
      left: direction * (card.offsetWidth + gap) * this.cardsPerMove,
      behavior: 'smooth'
    });

    setTimeout(() => {
      this.isSliding = false;
      this.updateCarouselState();
    }, 400);
  }

  updateCarouselState(): void {
    const grid = this.newsGrid?.nativeElement;

    if (!grid) {
      return;
    }

    const maxScroll = grid.scrollWidth - grid.clientWidth;

    this.isAtStart = grid.scrollLeft <= 1;
    this.isAtEnd = grid.scrollLeft >= maxScroll - 1;
  }

  private resetCarousel(): void {
    setTimeout(() => {
      this.newsGrid?.nativeElement.scrollTo({
        left: 0,
        behavior: 'instant'
      });

      this.updateCarouselState();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCarouselState();
  }

  shareStory(news: any): void {

    if (!news?.uid) {
      return;
    }
    const title = news.title;
    // const newsLink = `${window.location.href}/newscontent/${news.uid}`

    const routeUrl1 = this.router.serializeUrl(
      this.router.createUrlTree([
        '/newscontent',
        news.uid
      ])
    )

    const routeUrl = this.router.serializeUrl(
  this.router.createUrlTree([
    '/newscontent',
    news.language.toLowerCase(),
    news.type,
    news.slug
  ])
);


    // Remove starting slash so document.baseURI is preserved
    const relativeRoute = routeUrl.replace(/^\//, '');

    // Example:
    // document.baseURI = http://localhost:4200/testUAT/test/
    // relativeRoute = newscontent/123
    const newsLink = new URL(
      relativeRoute,
      document.baseURI
    ).href;
    const url = window.location.href;

    if (navigator.share) {
      void navigator.share({ title, url: newsLink });
    } else {
      void navigator.clipboard.writeText(url);
    }
  }

  getSafeYouTubeUrl(url: string): SafeResourceUrl {
    const videoId = this.getYouTubeVideoId(url);

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}`
    );
  }



  openArticlePage1(item: any): void {
    this.router.navigate(['/newscontent', item.uid]);
  }
openArticlePage(item: any): void {

  this.router.navigate([
    '/newscontent',
    item.language.toLowerCase(),
    item.type,
    item.slug
  ]);

}
  getDescriptionParagraphs(description: string): string[] {

    if (!description) {
      return [];
    }

    const cleaned = description
      .replace(/\\r|\r/g, '')
      .replace(/\\"/g, '"');

    return cleaned
      .split(/\\n|\n/)
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  }
  async downloadPage(): Promise<void> {

    const element =
      document.getElementById('article-pdf');

    if (!element) {
      console.error('Article PDF content not found');
      return;
    }

    const fileName =
      this.getPdfFileName();

    const options = {

      margin: [
        10,
        10,
        10,
        10
      ] as [number, number, number, number],

      filename: fileName,

      image: {
        type: 'jpeg' as const,
        quality: 0.98
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      },

      jsPDF: {
        unit: 'mm' as const,
        format: 'a4' as const,
        orientation: 'portrait' as const
      },

      pagebreak: {
        mode: [
          'css',
          'legacy'
        ]
      }

    };

    await html2pdf()
      .set(options)
      .from(element)
      .save();
  }
  private getPdfFileName(): string {

    const title =
      this.newsArticle?.title ||
      'NiviCap-News';

    const safeTitle =
      title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

    return `${safeTitle}.pdf`;
  }
  likeArticle(): void {

    const id = this.newsArticle?.uid;
const language =this.newsArticle?.language;

const type = this.newsArticle?.type;
    if (!id || this.hasLiked) {
      return;
    }

    const likeStorageKey = this.getLikeStorageKey(id);

    this.newsService
      .incrementLike(id,language,type)
      .subscribe({

        next: result => {

          this.newsArticle.likes = result.likes;
          this.hasLiked = true;

          sessionStorage.setItem(
            likeStorageKey,
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

  getYouTubeThumbnail(url: string): string {
    const videoId = this.getYouTubeVideoId(url);

     if (!videoId) {
    return 'assets/images/video-placeholder.jpg';
  }
  
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }


  private getViewStorageKey(id: string): string {
    return `viewed_${id}`;
  }

  private getLikeStorageKey(id: string): string {
    return `liked_${id}`;
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

  likeLatestArticle(item: any, event: Event): void {
    event.stopPropagation();

    const id = item?.uid;
const language = this.newsArticle?.language;

const type = this.newsArticle?.type;

    if (!id || this.isLatestLiked(id)) {
      return;
    }

    this.newsService
      .incrementLike(id,language,type)
      .subscribe({
        next: result => {
          // Update only the clicked Latest News card
          item.likes = result.likes;

          sessionStorage.setItem(
            this.getLikeStorageKey(id),
            'true'
          );
        },

        error: error => {
          console.error(
            'Unable to update Latest News like',
            error
          );
        }
      });
  }
  isLatestLiked(id: string): boolean {
    if (!id) {
      return false;
    }

    return sessionStorage.getItem(
      this.getLikeStorageKey(id)
    ) === 'true';
  }
}
