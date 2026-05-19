export interface CreateUrlRequest {
  shortCode?: string;
  originalUrl: string;
  expiresAt?: string;
}

export interface UrlResponse {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
}

export type SortField = 'createdAt' | 'shortCode' | 'originalUrl' | 'expiresAt';
export type SortDirection = 'ASC' | 'DESC';
