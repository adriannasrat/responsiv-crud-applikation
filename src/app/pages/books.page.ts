import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../core/models';
import { LibraryService } from '../core/library.service';
import { NoticeService } from '../core/notice.service';
import { errorMessage } from '../core/error-message';

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './books.page.html',
})
export class BooksPage implements OnInit {
  private readonly api = inject(LibraryService);
  private readonly notices = inject(NoticeService);
  readonly books = signal<Book[]>([]);
  readonly loading = signal(true);
  readonly deleting = signal<number | null>(null);
  readonly error = signal('');
  readonly search = signal('');
  readonly filtered = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('sv');
    return this.books().filter((book) =>
      `${book.title} ${book.author}`.toLocaleLowerCase('sv').includes(term),
    );
  });
  ngOnInit(): void {
    void this.load();
  }
  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      this.books.set(await this.api.books());
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
  async remove(book: Book): Promise<void> {
    if (
      this.deleting() !== null ||
      !window.confirm(`Radera ”${book.title}”? Det går inte att ångra.`)
    )
      return;
    this.deleting.set(book.id);
    try {
      await this.api.deleteBook(book.id);
      this.books.update((books) => books.filter((item) => item.id !== book.id));
      this.notices.show('Boken har raderats.');
    } catch (error) {
      this.notices.show(errorMessage(error));
    } finally {
      this.deleting.set(null);
    }
  }
}
