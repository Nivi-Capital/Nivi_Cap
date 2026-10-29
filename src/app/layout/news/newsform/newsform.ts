
import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild ,OnInit} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { NewsService } from '../../../service/news';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-newsform',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './newsform.html',
  styleUrl: './newsform.css',
})
export class Newsform implements OnInit {

  selectedImage?: File;
  selectedPdf?: File;

  imagePreview?: string;

  uploading = false;
  successMessage = '';
  errorMessage = '';
  noImageErrorMessage = '';
  languages = [
    'English',
    'Marathi',
    'Hindi',
    'Kannada',
    'Gujarati',
    'Malayalam',
    'Punjabi'
  ];

  @ViewChild('imageInput')
  imageInput!: ElementRef<HTMLInputElement>;

  @ViewChild('pdfInput')
  pdfInput!: ElementRef<HTMLInputElement>;

  imageErrorMessage = '';
  pdfErrorMessage = '';
  today: string = new Date().toISOString().split('T')[0];

  previewArticle: {
  title: string;
  publication: string;
  date: string;
  language: string;
  smallDescription: string;
  largeDescription: string;
  originalNewsUrl: string;
  disclaimerPublication: string;
  imageUrl: string;
    pdfUrl: string;
    type: 'onlinemedia' | 'video';
  videoUrl: string;
} | null = null;

hasPreviewed  : boolean = false;
previewVideoUrl?: SafeResourceUrl;

newsForm!: FormGroup;
invalidDateInput = false;

constructor(
    private fb: FormBuilder,
    private newsService: NewsService,private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {

    this.newsForm = this.fb.group({
      contentType: ['onlinemedia', Validators.required],
      title: ['', [Validators.required, this.noWhitespaceValidator()]],

      publication: ['', [Validators.required, this.noWhitespaceValidator()]],

      date: ['', [Validators.required, this.publicationDateValidator()]],

      language: ['English', Validators.required],

      smallDescription: ['', [Validators.required, this.noWhitespaceValidator()]],

      largeDescription: ['', [Validators.required, this.noWhitespaceValidator()]],

      originalNewsUrl: ['', [Validators.required, this.noWhitespaceValidator()]],

      disclaimerPublication: ['', [Validators.required, this.noWhitespaceValidator()]],

     videoUrl: [''],

    });

     this.newsForm.valueChanges.subscribe(() => {
    this.hasPreviewed = false;
  });
  }

  
 get contentType(): 'onlinemedia' | 'video' {
  return this.newsForm.get('contentType')?.value;
}

get canPreview(): boolean {
  if (this.newsForm.invalid) {
    return false;
  }

  if (this.contentType === 'onlinemedia') {
    return !!this.selectedImage;
  }

  if (this.contentType === 'video') {
    const videoUrl =
      this.newsForm.get('videoUrl')?.value || '';

    return !!this.getYouTubeVideoId(videoUrl);
  }

  return false;
}

  onImageSelected(event: Event): void {
this.hasPreviewed = false;
    const input = event.target as HTMLInputElement;
    this.noImageErrorMessage = '';

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp'
    ];

    const allowedExtensions = [
      'png',
      'jpg',
      'jpeg',
      'webp'
    ];

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || '';

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.includes(extension)
    ) {

      this.imageErrorMessage =
        'Only PNG, JPG, JPEG and WEBP images are allowed.';

      this.selectedImage = undefined;
      this.imagePreview = undefined;

      // Clear selected invalid file
      input.value = '';
      return;
    }

    this.selectedImage = file;
    this.imageErrorMessage = '';
    this.noImageErrorMessage = '';
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }


  removeImage(input: HTMLInputElement): void {
    this.hasPreviewed = false;
    this.selectedImage = undefined;
    this.imagePreview = undefined;
    this.imageErrorMessage = '';
    this.noImageErrorMessage = 'Please select an image.';

    // Clear file input
    input.value = '';
  }

  onPdfSelected(event: Event): void {
    this.hasPreviewed = false;
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    // Allow only PDF
    if (file.type !== 'application/pdf') {
      this.pdfErrorMessage = "Only PDF files are allowed"
      input.value = ''; // Clear selected file
      this.selectedPdf = undefined;
      setTimeout(() => {
        this.pdfErrorMessage = '';
      }, 2000);
      return;
    }

    this.selectedPdf = file;
  }

  onContentTypeChange(): void {
  const videoUrlControl =
    this.newsForm.get('videoUrl');

  const smallDescriptionControl =
    this.newsForm.get('smallDescription');

  const largeDescriptionControl =
    this.newsForm.get('largeDescription');

  const originalNewsUrlControl =
    this.newsForm.get('originalNewsUrl');

  if (this.contentType === 'video') {
    // Video URL is required for Video
    videoUrlControl?.setValidators([
      Validators.required,
      this.youtubeUrlValidator()
    ]);

    // These fields are hidden for Video,
    // so they must not remain required
    smallDescriptionControl?.clearValidators();
    largeDescriptionControl?.clearValidators();
    originalNewsUrlControl?.clearValidators();

    // Clear the hidden values
    smallDescriptionControl?.setValue(
      '',
      { emitEvent: false }
    );

    largeDescriptionControl?.setValue(
      '',
      { emitEvent: false }
    );

    originalNewsUrlControl?.setValue(
      '',
      { emitEvent: false }
    );

    // Video does not require an image
    this.selectedImage = undefined;
    this.imagePreview = undefined;
    this.noImageErrorMessage = '';

    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  } else {
    // Online Media does not require video URL
    videoUrlControl?.clearValidators();

    videoUrlControl?.setValue(
      '',
      { emitEvent: false }
    );

    // Restore Online Media validation
    smallDescriptionControl?.setValidators([
      Validators.required
    ]);

    largeDescriptionControl?.setValidators([
      Validators.required
    ]);

    originalNewsUrlControl?.setValidators([
      Validators.required
    ]);
  }

  videoUrlControl?.updateValueAndValidity({
    emitEvent: false
  });

  smallDescriptionControl?.updateValueAndValidity({
    emitEvent: false
  });

  largeDescriptionControl?.updateValueAndValidity({
    emitEvent: false
  });

  originalNewsUrlControl?.updateValueAndValidity({
    emitEvent: false
  });

  this.hasPreviewed = false;
  this.previewArticle = null;
  this.previewVideoUrl = undefined;
}

youtubeUrlValidator(): ValidatorFn {
  return (
    control: AbstractControl
  ): ValidationErrors | null => {

    if (!control.value) {
      return null;
    }

    const videoId =
      this.getYouTubeVideoId(control.value);

    return videoId
      ? null
      : { invalidYouTubeUrl: true };
  };
}
getYouTubeVideoId(url: string): string {
  if (!url) {
    return '';
  }

  // const match = url.match(
  //   /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/
  // );

  const value = url.trim();

  const match = value.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? match[1] : '';
}
  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.newsForm.markAllAsTouched();

    if (!this.hasPreviewed) {
      this.errorMessage =
        'Please preview the content before submitting.';
      return;
    }

    if (
      this.contentType === 'onlinemedia' &&
      !this.selectedImage
    ) {
      this.noImageErrorMessage =
        'Please select an image.';
      this.errorMessage =
        'Please select an image.';
      return;
    }

    if (
      this.contentType === 'video' &&
      !this.getYouTubeVideoId(
        this.newsForm.value.videoUrl
      )
    ) {
      this.newsForm
        .get('videoUrl')
        ?.setErrors({
          invalidYouTubeUrl: true
        });
      this.errorMessage =
        'Please enter a valid YouTube URL.';
      return;
    }

    if (this.newsForm.invalid || this.invalidDateInput) {
      this.errorMessage =
        'Please fill all required fields.';
      return;
    }



    this.imageErrorMessage = '';
    this.noImageErrorMessage = '';

    const formData = new FormData();

    formData.append(
      'title',
      this.newsForm.value.title
    );

    formData.append(
      'publication',
      this.newsForm.value.publication
    );

    formData.append(
      'date',
      this.newsForm.value.date
    );

    formData.append(
      'language',
      this.newsForm.value.language
    );

    formData.append(
      'type',
      this.contentType
    );

    formData.append(
      'smallDescription',
      this.newsForm.value.smallDescription
    );

    formData.append(
      'largeDescription',
      this.newsForm.value.largeDescription
    );

    formData.append(
      'originalNewsUrl',
      this.newsForm.value.originalNewsUrl || ''
    );

    formData.append(
      'disclaimerPublication',
      this.newsForm.value.disclaimerPublication || ''
    );

    // formData.append(
    //   'disclaimerLink',
    //   this.newsForm.value.disclaimerLink || ''
    // );

    // Image file
  if (
  this.contentType === 'onlinemedia' &&
  this.selectedImage
) {
  formData.append(
    'image',
    this.selectedImage,
    this.selectedImage.name
  );
}
    if (this.contentType === 'video') {
  formData.append(
    'videoUrl',
    this.newsForm.value.videoUrl
  );
}


    // PDF file
    if (
  this.contentType === 'onlinemedia' &&
  this.selectedPdf
) {
    if (this.selectedPdf) {
      formData.append(
        'pdf',
        this.selectedPdf,
        this.selectedPdf.name
      );
    }
  }

    this.uploading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.newsService
      .createNews(formData)
      .subscribe({

        next: response => {

          console.log(
            'Article created:',
            response
          );

          this.uploading = false;

          this.successMessage =
            'News article added successfully.';

          this.errorMessage = '';

          this.resetForm();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },

        error: error => {

          console.error(
            'Error creating article:',
            error
          );

          this.uploading = false;

          this.errorMessage =
            'Unable to add news article.';
        }

      });
  }
  private resetForm(): void {

    this.newsForm.reset({
      language: 'English',
      contentType : 'onlinemedia',
      title: '',
  publication: '',
  date: '',
  smallDescription: '',
  largeDescription: '',
  originalNewsUrl: '',
  disclaimerPublication: '',
  videoUrl: ''
    });

    this.selectedImage = undefined;
    this.selectedPdf = undefined;
    this.imagePreview = undefined;
this.hasPreviewed = false;
this.previewArticle = null;
    this.imageErrorMessage = '';
    this.noImageErrorMessage = '';
    this.pdfErrorMessage = '';
    this.errorMessage = '';
    this.invalidDateInput = false;
   
    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }

    if (this.pdfInput) {
      this.pdfInput.nativeElement.value = '';
    }
  }


  noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined) {
      return null;
    }

    return String(value).trim().length === 0
      ? { whitespace: true }
      : null;
  };
}

  publicationDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = String(control.value);

    // Must strictly match yyyy-MM-dd
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return { invalidDate: true };
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    // Prevent years such as 0000, 1111, etc.
    if (year < 2000) {
      return { minimumDate: true };
    }

    const selectedDate = new Date(year, month - 1, day);

    // Reject impossible dates such as 31 February
    const isValidDate =
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month - 1 &&
      selectedDate.getDate() === day;

    if (!isValidDate) {
      return { invalidDate: true };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    return null;
  };
}

onDateInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const dateControl = this.newsForm.get('date');

  if (!dateControl) {
    return;
  }

 
  this.invalidDateInput =
    input.validity.badInput ||
    input.validity.typeMismatch;

  dateControl.markAsTouched();
  dateControl.updateValueAndValidity({
    emitEvent: false
  });
}

  preview(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.newsForm.markAllAsTouched();

    let hasCustomError = false;

    if (this.contentType === 'onlinemedia' && !this.selectedImage) {
      this.noImageErrorMessage = 'Please select an image.';
      hasCustomError = true;
    } else {
      this.noImageErrorMessage = '';
    }

    if (this.contentType === 'video') {
      const videoUrlControl = this.newsForm.get('videoUrl');
      const videoId = this.getYouTubeVideoId(videoUrlControl?.value);
      if (!videoId) {
        videoUrlControl?.setErrors({ invalidYouTubeUrl: true });
        hasCustomError = true;
      }
    }

    if (this.newsForm.invalid ||  this.invalidDateInput || hasCustomError) {
      this.hasPreviewed = false;
      this.errorMessage = 'Please fill all required fields before previewing.';
      return;
    } 
  
  this.noImageErrorMessage = '';
  const formValue = this.newsForm.getRawValue();

  this.previewArticle = {
    title: formValue.title || 'News title',
    publication: formValue.publication || 'Publication',
    date: formValue.date || '',
    language: formValue.language || 'English',
    smallDescription: formValue.smallDescription || '',
    largeDescription: formValue.largeDescription || '',
    originalNewsUrl: formValue.originalNewsUrl || '',
    disclaimerPublication:
      formValue.disclaimerPublication || '',
    imageUrl: this.contentType === 'onlinemedia' ?
      this.imagePreview || '' : '',
      pdfUrl: formValue.pdfUrl || '',
       type:
      formValue.contentType,

    videoUrl:
      formValue.videoUrl || ''
  };

  if (this.contentType === 'video') {
    const videoId =
      this.getYouTubeVideoId(
        formValue.videoUrl
      );

    this.previewVideoUrl =  this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}`
        );
  } else {
    this.previewVideoUrl = undefined;
  }

  this.hasPreviewed = true;

  const modalEl = document.getElementById('exampleModalLong');
  if (modalEl) {
    const modal = (window as any).bootstrap?.Modal?.getOrCreateInstance(modalEl)
      || new (window as any).bootstrap.Modal(modalEl);
    modal?.show();
  }
}

getPreviewParagraphs(
  description: string | null | undefined
): string[] {
  if (!description) {
    return [];
  }

  return description
    .split(/\r?\n/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);
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
}
