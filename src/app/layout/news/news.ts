import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import newsData from '../../../assets/jsonData/publication.json'
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';


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
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})

export class News implements OnInit, AfterViewInit, OnDestroy {


  newsList: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  visiblePages: (number | string)[] = [];
  selectedHtml = '';
  selectedNews: any;
  category: any = 'news';

  private newsGridElement?: ElementRef<HTMLElement>;

  @ViewChild('newsGrid')
  set newsGrid(value: ElementRef<HTMLElement> | undefined) {
    this.newsGridElement = value;

    if (value) {
      requestAnimationFrame(() => {
        this.initializeGrid();
      });
    }
  }


  private readonly ratioNames = new Set(['16-9', '2-3', '21-9', '1-1']);
  private readonly fallbackRatios = ['16-9', '2-3', '21-9', '1-1'];

  constructor(private http: HttpClient) { }
  ngOnInit() {
    this.newsList = newsData;
    this.newsList.sort((a, b) => {
      return this.parseDate(b.Date).getTime() - this.parseDate(a.Date).getTime();
    });
    if (this.newsList?.length) this.totalPages = Math.floor(this.newsList.length / 10);
    this.generateVisiblePages();
  }

  ngAfterViewInit(): void {
    this.initializeGrid();
  }

  ngOnDestroy(): void {

  }

  get pagedNews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.newsList.slice(start, start + this.pageSize);
  }

  parseDate(dateStr: string): Date {
    // Converts "19-Nov-25" → "19 Nov 2025"
    const [day, month, year] = dateStr.split('-');
    return new Date(`${day} ${month} 20${year}`);
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

  changeSection(section: any) {
    this.category = section;
  }

  shareStory(event: Event): void {
    const button = event.currentTarget as HTMLButtonElement;
    const card = button.closest('.card');
    const title = card?.querySelector('h2')?.textContent?.trim() || document.title;

    if (navigator.share) {
      void navigator.share({ title, url: window.location.href });
      return;
    }

    void navigator.clipboard?.writeText(window.location.href);
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
}
