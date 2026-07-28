import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, NgZone } from '@angular/core';
import { RouterOutlet,Router, RouterLink, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-main',
  imports: [RouterOutlet,CommonModule,RouterLink,RouterModule],
  standalone:true,
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  
isScrolled = false;
activeSection: string = '';
isNavbarCollapsed = true;
isNavbarOpen = false;
  private observer?: IntersectionObserver;


  
constructor(private http:HttpClient,public router: Router,private ngZone: NgZone,private cdr: ChangeDetectorRef){
    this.router.events
  .pipe(filter(event => event instanceof NavigationEnd))
  .subscribe(() => {

    // If on home page → enable smooth scroll
    if (this.router.url === '/') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Otherwise → disable smooth scroll
    else {
      document.documentElement.style.scrollBehavior = 'auto';
    }

    // Always open non-index pages at top instantly
    if (this.router.url !== '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  });
  this.router.events.subscribe(() => {

    if (this.router.url !== '/') {
      this.activeSection = '';
      this.destroyObserver();
    }
    if (this.router.url === '/') {
      setTimeout(() => this.initObserver(), 0);
    }

  });


}
clearActiveSection() {
  this.activeSection = '';
}

toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  
ngAfterViewInit123() {
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.activeSection = entry.target.id;
      }
    });
  }, {
    threshold: 0.6 // 60% of section visible → active
  });

  sections.forEach(section => observer.observe(section));
}

 isContentPage() {
    return (
      this.router.url === '/terms-condition' ||
      this.router.url === '/privacy-policy' ||
      this.router.url === '/news' ||
      this.router.url === '/news-details'
    );
  }

  goToSection(sectionId: string) {
  if (this.router.url === '/') {
    // already on homepage → scroll
    this.scrollToSection(sectionId);
    this.isNavbarOpen = false;
  } else {
    // navigate to homepage → then scroll
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        this.scrollToSection(sectionId);
      }, 50);
    });
  }
}

  // Scroll to a specific section
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
 private initObserver(): void {
  if (this.observer || this.router.url !== '/') return;

  const sections = document.querySelectorAll('#home, #about, #features, #product');

  this.observer = new IntersectionObserver(entries => {
    // HARD exit if not on home (extra safety)
    if (this.router.url !== '/') return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.ngZone.run(() => {
          this.activeSection = entry.target.id;
          this.cdr.detectChanges();
        });
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(section => this.observer!.observe(section));
}

private destroyObserver(): void {
  if (this.observer) {
    this.observer.disconnect();
    this.observer = undefined;
  }
}

ngOnDestroy() {
    this.isNavbarOpen = false;
  }
}


