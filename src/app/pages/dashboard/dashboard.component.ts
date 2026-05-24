import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UrlService } from '../../services/url.service';
import { UrlResponse, SortField, SortDirection } from '../../models/url.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  urls = signal<UrlResponse[]>([]);
  loading = signal(false);
  formLoading = signal(false);
  formError = signal('');
  formSuccess = signal('');
  deleteError = signal('');
  copiedCode = signal('');

  originalUrl = '';
  shortCode = '';
  expiresAt = '';

  sortBy: SortField = 'createdAt';
  direction: SortDirection = 'DESC';

  readonly sortFields: { label: string; value: SortField }[] = [
    { label: 'Created', value: 'createdAt' },
    { label: 'Short Code', value: 'shortCode' },
    { label: 'Original URL', value: 'originalUrl' },
    { label: 'Expires', value: 'expiresAt' },
  ];

  constructor(
    public auth: AuthService,
    private urlService: UrlService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUrls();
  }

  loadUrls(): void {
    this.loading.set(true);
    this.deleteError.set('');
    this.urlService.getUrls(this.sortBy, this.direction).subscribe({
      next: (data) => {
        this.urls.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSortChange(field: SortField): void {
    if (this.sortBy === field) {
      this.direction = this.direction === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.direction = 'DESC';
    }
    this.loadUrls();
  }

  onDirectionToggle(): void {
    this.direction = this.direction === 'ASC' ? 'DESC' : 'ASC';
    this.loadUrls();
  }

  onSubmit(): void {
    if (!this.originalUrl.trim()) {
      this.formError.set('Please enter a URL to shorten.');
      return;
    }

    if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
      this.formError.set('Expiration date must be in the future.');
      return;
    }
    this.formError.set('');
    this.formSuccess.set('');
    this.formLoading.set(true);

    const request: { originalUrl: string; shortCode?: string; expiresAt?: string } = {
      originalUrl: this.originalUrl.trim(),
    };
    if (this.shortCode.trim()) request.shortCode = this.shortCode.trim();
    if (this.expiresAt) request.expiresAt = new Date(this.expiresAt).toISOString();

    this.urlService.createUrl(request).subscribe({
      next: (url) => {
        this.formLoading.set(false);
        this.formSuccess.set(`Shortened! Your code: ${url.shortCode}`);
        this.originalUrl = '';
        this.shortCode = '';
        this.expiresAt = '';
        this.loadUrls();
        setTimeout(() => this.formSuccess.set(''), 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.formLoading.set(false);
        if (err.status === 409) {
          this.formError.set('That short code is already in use. Try a different one or leave it blank.');
        } else if (err.status === 400) {
          this.formError.set(err.error?.error ?? 'Invalid request. Please check your inputs.');
        } else {
          this.formError.set('Failed to shorten URL. Please try again.');
        }
      },
    });
  }

  deleteUrl(shortCode: string): void {
    this.deleteError.set('');
    this.urlService.deleteUrl(shortCode).subscribe({
      next: () => this.loadUrls(),
      error: () => this.deleteError.set('Failed to delete the URL. Please try again.'),
    });
  }

  copyToClipboard(shortCode: string): void {
    navigator.clipboard.writeText(`${window.location.origin}/api/urls/${shortCode}`).then(() => {
      this.copiedCode.set(shortCode);
      setTimeout(() => this.copiedCode.set(''), 2000);
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  isExpired(expiresAt: string | undefined): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }
}
