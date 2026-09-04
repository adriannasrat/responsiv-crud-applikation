import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { LoginResponse, User } from './models';
import { NoticeService } from './notice.service';
import { errorMessage } from './error-message';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notices = inject(NoticeService);
  readonly user = signal<User | null>(null);
  readonly connectionError = signal('');
  private readonly tokenKey = 'bokrum-token';
  private expiryTimer?: ReturnType<typeof setTimeout>;

  async initialize(): Promise<void> {
    if (!this.token()) return;

    try {
      this.setUser(await firstValueFrom(this.http.get<User>('/api/auth/me')));
    } catch (error) {
      this.clear();
      if (!(error instanceof HttpErrorResponse && error.status === 401)) {
        this.connectionError.set(errorMessage(error));
      }
    }
  }

  async register(username: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post('/api/auth/register', { username, password }),
    );
  }

  async login(username: string, password: string): Promise<void> {
    const user = await firstValueFrom(
      this.http.post<LoginResponse>('/api/auth/login', { username, password }),
    );

    localStorage.setItem(this.tokenKey, user.token);
    this.setUser(user);
    this.connectionError.set('');
  }

  async logout(): Promise<void> {
    this.clear();
    await this.router.navigateByUrl('/logga-in');
    this.notices.show('Du är nu utloggad.');
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  expire(): void {
    const hadUser = this.user() !== null;
    this.clear();

    if (hadUser) {
      this.notices.show(
        'Din session har gått ut. Logga in igen för att fortsätta.',
      );
    }

    void this.router.navigateByUrl('/logga-in');
  }

  private clear(): void {
    clearTimeout(this.expiryTimer);
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
  }

  private setUser(user: User): void {
    clearTimeout(this.expiryTimer);
    this.user.set(user);
    this.expiryTimer = setTimeout(
      () => this.expire(),
      Math.max(0, Date.parse(user.expiresAt) - Date.now()),
    );
  }
}
export const authGuard: CanActivateFn = () =>
  inject(AuthService).user()
    ? true
    : inject(Router).createUrlTree(['/logga-in']);
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).user() ? inject(Router).createUrlTree(['/bocker']) : true;
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const authenticatedRequest = token
    ? request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        request.url.startsWith('/api/') &&
        !request.url.includes('/auth/')
      )
        auth.expire();
      return throwError(() => error);
    }),
  );
};
