import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-newscontent',
  imports: [],
  templateUrl: './newscontent.html',
  styleUrl: './newscontent.css',
})
export class Newscontent implements AfterViewInit {
  @ViewChild('newsGrid') newsGrid!: ElementRef<HTMLDivElement>;

  cardsPerMove = 1;

  isAtStart = true;
  isAtEnd = true;
  isSliding = false;

  ngAfterViewInit(): void {
    this.updateCarouselState();
  }

  nextNews(): void {
    if (this.isSliding) {
      return;
    }
    this.isSliding = true;
    this.scrollNews(1);
    setTimeout(() => {
      this.isSliding = false;
    }, 400);
  }

  previousNews(): void {
    if (this.isSliding) {
     return;
    }
    this.isSliding = true;
    this.scrollNews(-1);
    setTimeout(() => {
      this.isSliding = false;
    }, 400);
  }

  private scrollNews(direction: number): void {

    const grid = this.newsGrid.nativeElement;

    const card = grid.querySelector<HTMLElement>('.news-card');

    if (!card) {
      return;
    }

    const styles = getComputedStyle(grid);
    const gap = parseFloat(styles.columnGap || styles.gap) || 0;

    const scrollAmount =
      (card.offsetWidth + gap) * this.cardsPerMove;

    grid.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  }

  updateCarouselState(): void {
    const grid = this.newsGrid?.nativeElement;

    if (!grid) {
      return;
    }

    const maxScrollLeft =
      grid.scrollWidth - grid.clientWidth;

    this.isAtStart = grid.scrollLeft <= 1;

    this.isAtEnd =
      grid.scrollLeft >= maxScrollLeft - 1;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateCarouselState();
  }
}
