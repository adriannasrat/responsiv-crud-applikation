import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NoticeService } from './core/notice.service';
import { errorMessage } from './core/error-message';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly auth = inject(AuthService);
  readonly notices = inject(NoticeService);
  readonly menuOpen = signal(false);
  readonly dark = signal(false);
  readonly loggingOut = signal(false);
  constructor() {
    let theme: string | null = null;
    try {
      theme = localStorage.getItem('bokrum-theme');
    } catch {
      /* Optional storage. */
    }
    this.dark.set(
      theme
        ? theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    this.applyTheme();
  }
  toggleTheme(): void {
    this.dark.update((value) => !value);
    this.applyTheme();
    try {
      localStorage.setItem('bokrum-theme', this.dark() ? 'dark' : 'light');
    } catch {
      /* Optional preference. */
    }
  }
  private applyTheme(): void {
    document.documentElement.setAttribute(
      'data-bs-theme',
      this.dark() ? 'dark' : 'light',
    );
  }
  async logout(): Promise<void> {
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
      this.menuOpen.set(false);
    } catch (error) {
      this.notices.show(errorMessage(error));
    } finally {
      this.loggingOut.set(false);
    }
  }
}
