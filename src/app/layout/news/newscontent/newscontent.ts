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

import newsData from '../../../../assets/jsonData/publication.json';
import videoData from '../../../../assets/jsonData/videosList.json';

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
    private cdr: ChangeDetectorRef
  ) {}

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
    // Reset video URL when changing content
    this.trustedUrl = undefined;

    // Check news
    const article = newsData.find((item: any) => item.uid === id);

    if (article) {
      this.newsArticle = article;

      this.newsList = newsData.filter(
        (item: any) =>
          item.uid !== id &&
          item.Language === article.Language
      );

      this.resetCarousel();
      return;
    }

    // Check video
    const video = videoData.find((item: any) => item.uid === id);

    if (video) {
      this.newsArticle = video;

      this.newsList = videoData.filter(
        (item: any) => item.uid !== id
      );

      this.trustedUrl = this.getSafeYouTubeUrl(video.URL);

      this.resetCarousel();
    }
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
}
