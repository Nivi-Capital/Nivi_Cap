import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, HostListener, NgZone, ChangeDetectorRef, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Main } from '../service/main';
import { environment } from '../../environments/environment.prod';

type FormStatusType = 'form' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink,RouterModule],
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
})

export class Index implements OnInit {
  isScrolled = false;
  activeSection: string = 'home';
  private observer?: IntersectionObserver;
  private timerInterval?: number;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (window.location.pathname !== '/') return;
    this.isScrolled = window.scrollY > 800;
  }

  loanAmount: string = '';
  amountError = "";

  isAgreed: boolean = true;

  showsuccess: boolean = false;
  showError: boolean = false;
  pleasecheck: boolean = true;
  status!: FormStatusType;
  msgtoshow = "";

  dataList: Array<any> = [];
  selectedLoanType: string = '';

  yearList: number[] = [];
  selectedYearOfIntake: number = 0;

  monthofIntakeList: Array<any> = [];
  monthofIntakeSelected: string = '';

  pincodeInput: string = '';
  pincodeList: Array<any> = [];
  selectedPincode: string = '';
  isPincodeLoading: boolean = false;
  pincodeError: string = '';
  pincodeID: string = '';
@ViewChild('pincodeSelectRef') pincodeSelectRef!: ElementRef<HTMLSelectElement>;
@ViewChild('pincodeInputRef') pincodeInputRef!: ElementRef<HTMLInputElement>;


  allMonths = [
    { code: 'JAN', name: "January" },
    { code: 'FEB', name: "February" },
    { code: 'MAR', name: "March" },
    { code: 'APR', name: "April" },
    { code: 'MAY', name: "May" },
    { code: 'JUN', name: "June" },
    { code: 'JUL', name: "July" },
    { code: 'AUG', name: "August" },
    { code: 'SEP', name: "September" },
    { code: 'OCT', name: "October" },
    { code: 'NOV', name: "November" },
    { code: 'DEC', name: "December" }
  ];
  isExpanded = false;
  consentAgreed = false
displayPincodeValue: string = '';
displayofficename: string = '';
selectedPincodeDisplay: string = '';


  constructor(private http: HttpClient, public main: Main, private ngZone: NgZone, private cdr: ChangeDetectorRef,public router: Router) {
    this.status = 'form';
    

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
  ngOnInit(): void {
    this.displayPincodeValue = '';
    this.dataList = [
      { code: 1, name: "Education Loan" },

    ]
    this.generateYearList();


  }

  clearActiveSection() {
  this.activeSection = '';
}

  generateYearList() {
    const currentYear = new Date().getFullYear();
    this.yearList = [
      currentYear,
      currentYear + 1,
      currentYear + 2
    ];

    // this.selectedYearOfIntake = currentYear;
  }
  onYearChange() {
     this.monthofIntakeList = []; 
      this.monthofIntakeSelected = '';
    if (this.selectedYearOfIntake > 0) {
      this.generateMonthList();
    } else {
      this.monthofIntakeList = []; 
      this.monthofIntakeSelected = '';
    }
  }

  generateMonthList() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthCode = this.getMonthCode(currentMonth);

    const isCurrentYear = this.selectedYearOfIntake == currentYear;

    if (isCurrentYear) {
      this.monthofIntakeList = this.allMonths
        .filter(month => {
          const monthNum = this.getMonthNumber(month.code);
          return monthNum >= currentMonth;
        });
    } else {
      this.monthofIntakeList = [...this.allMonths];
    }


  }
  getMonthCode(monthNumber: number): string {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthNames[monthNumber - 1];
  }

  getMonthNumber(monthCode: string): number {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
      'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthNames.indexOf(monthCode) + 1;
  }



  trackByCode(index: number, item: any): any {
    return item.code;
  }

  trackByYear(index: number, year: number): number {
    return year;
  }






  // Scroll to a specific section
  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    
this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
    this.activeSection = sectionId;
    // scroll logic here
  });


    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ----------------------submit form---------------


  //format amount 2000000 to 20,00,000
  formatAmount() {
    if (!this.loanAmount) return;

    let value = this.loanAmount.replace(/,/g, '');

    value = value.replace(/\D/g, '');

    this.loanAmount = this.formatIndian(value);
    this.validateAmount();
  }

  formatIndian(x: string): string {
    if (!x) return '';
    let lastThree = x.substring(x.length - 3);
    let otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  }
  

  validateAmount() {
    const numericValue = Number(this.loanAmount.toString().replace(/,/g, ''));
    // this.amountError = 1000000 > numericValue || numericValue > 4500000;
    // if (!numericValue) {
    //   this.amountError = '';
    //   return;
    // }

    if (numericValue < 1000000) {
      this.amountError = 'min';
    } else if (numericValue > 10000000) {
      this.amountError = 'max';
    } else {
      this.amountError = '';
    }
  }

  submitLoanForm(data: NgForm) {
    console.log(data.value);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    if (this.status === 'loading') return; // prevent double submit

    //   setTimeout(() => {
    //   this.status = 'loading';
    // }, 10000);

    this.status = 'loading';

    if (!data || data.invalid || this.amountError) return;

    const inputobj = {
      fullName: data.value.name,
      mobileNumber: data.value.phone,
      email: data.value.email,
      loanAmount: data.value.loanAmount,
      loanType: data.value.loanType,
      yearOfIntake: data.value.yearOfIntake,
      monthOfIntake: data.value.monthOfIntake,
      consent: this.isAgreed === true ? 1 : 0,
      pinCodeMasterId: this.pincodeID?? '',
      pinCode: data.value.pincodeInput,

        source: "WEBSITE"   //live
        // source: "CAMPAIGN"      //testUAT
      // source: environment.checkenv   
    };

    console.log(inputobj);

    this.main.submitLead(inputobj).subscribe({
      next: (res) => {
        this.status = 'success';
        this.showsuccess = true;
        this.msgtoshow = res.message;
        data.resetForm();
        this.loanAmount = '';
        this.selectedLoanType='';
        this.selectedYearOfIntake=0;
        this.monthofIntakeSelected='';
         this.displayofficename = '';
        this.clearPincodeSelection();
        setTimeout(() => {
          this.status = 'form';
          this.showsuccess = false;
        }, 1000);
      },
      error: (err) => {
        this.status = 'error';
        this.msgtoshow = err.error?.message || 'Something went wrong. Please try again.';

        this.showError = true;
        setTimeout(() => {
          this.showError = false;
          this.status = 'form';

        }, 1000);
      }

    });
  }

  //pincode check

  onPincodeInput(event: any) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.pincodeInput = value;

    if (value.length === 6) {
      setTimeout(() => this.searchPincodes(), 500);
    }
  }

  async searchPincodes() {
    if (this.pincodeInput.length !== 6 || this.isPincodeLoading) {
      this.displayofficename = '';
      this.pincodeID = '';
      return;
    }


    this.isPincodeLoading = true;
    this.pincodeError = '';
    this.pincodeList = [];

    this.main.checkPincode(this.pincodeInput).subscribe({
      next: (res) => {
        console.log(res);
        this.pincodeList = res;
        this.isPincodeLoading = false;
         setTimeout(() => {
        this.openPincodeDropdown();
      }, 50);
      if(this.pincodeList.length === 0) {
        this.displayofficename = '';
        this.pincodeID = '';
      }
      },
      error: (err) => {
        this.isPincodeLoading = false;
        this.pincodeError = 'Failed to fetch pincode data. Please try again.';
      }
    });
  }

 

 openPincodeDropdown() {
  if (this.pincodeSelectRef && this.pincodeList.length > 0) {
    const select = this.pincodeSelectRef.nativeElement;
    
    select.style.height = 'auto';
    select.style.maxHeight = 'auto';
    select.style.overflowY = 'auto';
    
    // Show all options
    select.size = this.pincodeList.length + 1;
    
    // Focus and scroll to top
    select.focus();
    select.scrollTop = 0;
    
    // Add open class for styling
    select.classList.add('dropdown-open');
  }
}

onPincodeSelect(selectedValue: any): void {
  if (!selectedValue) return;
  
  this.selectedPincode = selectedValue.target.value;
  
  const selectedItem = this.pincodeList.find(item => item.officename === this.selectedPincode);
  if (selectedItem) {
    // this.displayPincodeValue = `${selectedItem.pincode} - ${selectedItem.officename}`;
        this.displayPincodeValue = `${selectedItem.pincode}`;
        this.displayofficename = `${selectedItem.officename}`;
        this.pincodeID = selectedItem.id;

    this.pincodeID = selectedItem.id || '';
  }
  
  // Auto-hide dropdown
  setTimeout(() => {
    this.pincodeList = [];
  }, 300);
}

onDropdownFocus() {
  if (this.pincodeSelectRef) {
    const select = this.pincodeSelectRef.nativeElement;
    select.scrollTop = 0;
  }
}

clearPincodeSelection() {
  this.pincodeInput = '';
  this.displayPincodeValue = '';
  this.pincodeList = [];
  this.selectedPincode = '';
  this.pincodeError = '';
  this.pincodeID = '';
}
  trackByPincode(index: number, item: any): string {
    return item.code;
  }


  toggleExpand(autoCheck: boolean = false) {
    this.isExpanded = !this.isExpanded;

    if (autoCheck && this.isExpanded) {
      // this.consentAgreed = true;  
    }
  }

  onAgreeChange(event: any) {
    this.isAgreed = event.target.checked;
  }


  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    if (this.timerInterval !== undefined) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  // Helper methods for template type checking
  isLoading(): boolean {
    return this.status === 'loading';
  }

  isForm(): boolean {
    return this.status === 'form';
  }

  isSuccess(): boolean {
    return this.status === 'success';
  }

  isError(): boolean {
    return this.status === 'error';
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

}
