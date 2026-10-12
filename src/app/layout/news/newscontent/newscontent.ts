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

  @ViewChild('newsGrid') newsGrid!: ElementRef<HTMLDivElement>;

  newsArticle: any;
  newsList: any[] = [];
  trustedUrl?: SafeResourceUrl;

  isAtStart = true;
  isAtEnd = false;
  isSliding = false;

  private readonly cardsPerMove = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private newsService: NewsService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.loadContent(id);
      }
    });
  }

  ngAfterViewInit(): void {
    this.updateCarouselState();
    this.cdr.detectChanges();
  }



  private loadContent(id: string): void {

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
              this.getSafeYouTubeUrl(
                article.videoUrl
              );
          }

          this.newsService
            .incrementView(id)
            .subscribe({

              next: result => {

                this.newsArticle.views =
                  result.views;

              },

              error: error => {

                console.error(
                  'Unable to update views',
                  error
                );

              }

            });

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
            article.type === 'text'
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

  shareStory(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const card = button.closest('.card');

    const title =
      card?.querySelector('.headline')?.textContent?.trim() ||
      document.title;

    const url = window.location.href;

    if (navigator.share) {
      void navigator.share({ title, url });
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

  private getYouTubeVideoId(url: string): string {
    if (url.includes('watch?v=')) {
      return url.split('watch?v=')[1].split('&')[0];
    }

    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }

    if (url.includes('embed/')) {
      return url.split('embed/')[1].split('?')[0];
    }

    return '';
  }

  openArticlePage(item: any): void {
    this.router.navigate(['/newscontent', item.uid]);
  }

  getDescriptionParagraphs(description: string): string[] {

    if (!description) {
      return [];
    }

    return description
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

    if (!this.newsArticle?.uid) {
      return;
    }

    this.newsService
      .incrementLike(
        this.newsArticle.uid
      )
      .subscribe({

        next: result => {

          this.newsArticle.likes =
            result.likes;

        },

        error: error => {

          console.error(
            'Unable to update like',
            error
          );

        }

      });
  }
}
