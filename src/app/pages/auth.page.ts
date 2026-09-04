import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NoticeService } from '../core/notice.service';
import { errorMessage } from '../core/error-message';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth.page.html',
})
export class AuthPage {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notices = inject(NoticeService);
  readonly register = !!inject(ActivatedRoute).snapshot.data['register'];
  readonly busy = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    username: [
      '',
      this.register
        ? [
            Validators.required,
            Validators.pattern(/^[a-zA-Z0-9åäöÅÄÖ_-]{3,32}$/),
          ]
        : [Validators.required],
    ],
    password: [
      '',
      this.register
        ? [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(128),
          ]
        : [Validators.required],
    ],
    confirmPassword: [''],
  });
  invalid(name: 'username' | 'password'): boolean {
    const field = this.form.controls[name];
    return field.invalid && field.touched;
  }
  mismatch(): boolean {
    return (
      this.register &&
      this.form.controls.confirmPassword.touched &&
      this.form.controls.password.value !==
        this.form.controls.confirmPassword.value
    );
  }
  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.mismatch() || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.auth.connectionError.set('');
    const { username, password } = this.form.getRawValue();
    try {
      if (this.register) {
        await this.auth.register(username, password);
        this.notices.show(
          'Ditt konto är skapat! Logga in för att öppna ditt bokrum.',
        );
        await this.router.navigateByUrl('/logga-in');
      } else {
        await this.auth.login(username, password);
        await this.router.navigateByUrl('/bocker');
      }
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
