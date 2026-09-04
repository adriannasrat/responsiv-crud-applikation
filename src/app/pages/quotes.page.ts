import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Quote } from '../core/models';
import { LibraryService } from '../core/library.service';
import { NoticeService } from '../core/notice.service';
import { errorMessage } from '../core/error-message';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quotes.page.html',
})
export class QuotesPage implements OnInit {
  private readonly api = inject(LibraryService);
  private readonly notices = inject(NoticeService);
  readonly quotes = signal<Quote[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly deleting = signal<number | null>(null);
  ngOnInit(): void {
    void this.load();
  }
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.quotes.set(await this.api.quotes());
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
  async remove(quote: Quote): Promise<void> {
    if (
      this.deleting() !== null ||
      !window.confirm(`Radera citatet ”${quote.text}”? Det går inte att ångra.`)
    )
      return;
    this.deleting.set(quote.id);
    try {
      await this.api.deleteQuote(quote.id);
      this.quotes.update((quotes) =>
        quotes.filter((item) => item.id !== quote.id),
      );
      this.notices.show('Citatet har raderats.');
    } catch (error) {
      this.notices.show(errorMessage(error));
    } finally {
      this.deleting.set(null);
    }
  }
}
