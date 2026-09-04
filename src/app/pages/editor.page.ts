import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LibraryService } from '../core/library.service';
import { NoticeService } from '../core/notice.service';
import { errorMessage } from '../core/error-message';

function nonBlank(control: AbstractControl): ValidationErrors | null {
  if (typeof control.value !== 'string' || control.value.trim() === '') {
    return { blank: true };
  }
  return null;
}

function validDate(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  const parsed = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value <= '0001-01-01' || Number.isNaN(parsed.getTime())) {
    return { date: true };
  }
  // Ett datum som 30 februari får inte automatiskt bli ett datum i mars.
  if (parsed.toISOString().slice(0, 10) !== value) {
    return { date: true };
  }
  return null;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './editor.page.html',
})
export class EditorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(LibraryService);
  private readonly notices = inject(NoticeService);
  readonly isQuote = !!this.route.snapshot.data['quote'];
  readonly id = this.route.snapshot.paramMap.has('id')
    ? Number(this.route.snapshot.paramMap.get('id'))
    : undefined;
  readonly back = this.isQuote ? '/citat' : '/bocker';
  get heading(): string {
    if (this.id !== undefined) {
      return this.isQuote ? 'Redigera citat' : 'Redigera bok';
    }
    return this.isQuote ? 'Lägg till nytt citat' : 'Lägg till ny bok';
  }

  get saveButtonText(): string {
    if (this.saving()) return 'Sparar…';
    if (this.id !== undefined) return 'Spara ändringar';
    return this.isQuote ? 'Spara citat' : 'Spara bok';
  }
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly ready = signal(true);
  readonly error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', this.isQuote ? [] : [nonBlank, Validators.maxLength(200)]],
    text: ['', this.isQuote ? [nonBlank, Validators.maxLength(1000)] : []],
    author: ['', [nonBlank, Validators.maxLength(200)]],
    publicationDate: ['', this.isQuote ? [] : [validDate]],
  });
  invalid(name: 'title' | 'text' | 'author' | 'publicationDate'): boolean {
    const field = this.form.controls[name];
    return field.invalid && field.touched;
  }
  async ngOnInit(): Promise<void> {
    if (this.id === undefined) return;
    this.loading.set(true);
    this.ready.set(false);
    try {
      if (!Number.isInteger(this.id) || this.id <= 0) {
        this.error.set('Ogiltig adress. Gå tillbaka till listan.');
        return;
      }
      if (this.isQuote) {
        const quote = await this.api.quote(this.id);
        this.form.patchValue(quote);
      } else {
        const book = await this.api.book(this.id);
        this.form.patchValue(book);
      }
      this.ready.set(true);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving() || !this.ready()) return;
    this.saving.set(true);
    this.error.set('');
    const values = this.form.getRawValue();
    try {
      if (this.isQuote)
        await this.api.saveQuote(
          { text: values.text.trim(), author: values.author.trim() },
          this.id,
        );
      else
        await this.api.saveBook(
          {
            title: values.title.trim(),
            author: values.author.trim(),
            publicationDate: values.publicationDate,
          },
          this.id,
        );
      if (this.id !== undefined) {
        this.notices.show('Dina ändringar har sparats.');
      } else if (this.isQuote) {
        this.notices.show('Citatet har lagts till.');
      } else {
        this.notices.show('Boken har lagts till.');
      }
      await this.router.navigateByUrl(this.back);
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.saving.set(false);
    }
  }
}
