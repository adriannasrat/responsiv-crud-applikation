import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Book, BookInput, Quote, QuoteInput } from './models';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly http = inject(HttpClient);

  books(): Promise<Book[]> {
    return firstValueFrom(this.http.get<Book[]>('/api/books'));
  }

  book(id: number): Promise<Book> {
    return firstValueFrom(this.http.get<Book>(`/api/books/${id}`));
  }

  async saveBook(data: BookInput, id?: number): Promise<void> {
    if (id !== undefined) {
      await firstValueFrom(this.http.put(`/api/books/${id}`, data));
    } else {
      await firstValueFrom(this.http.post('/api/books', data));
    }
  }

  async deleteBook(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/books/${id}`));
  }

  quotes(): Promise<Quote[]> {
    return firstValueFrom(this.http.get<Quote[]>('/api/quotes'));
  }

  quote(id: number): Promise<Quote> {
    return firstValueFrom(this.http.get<Quote>(`/api/quotes/${id}`));
  }

  async saveQuote(data: QuoteInput, id?: number): Promise<void> {
    if (id !== undefined) {
      await firstValueFrom(this.http.put(`/api/quotes/${id}`, data));
    } else {
      await firstValueFrom(this.http.post('/api/quotes', data));
    }
  }

  async deleteQuote(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`/api/quotes/${id}`));
  }
}
