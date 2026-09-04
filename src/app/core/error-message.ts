import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 502 || error.status === 504)
      return 'Kunde inte nå API:et. Kontrollera att backenden körs och försök igen.';
    if (error.status === 429)
      return 'För många försök. Vänta en minut och försök igen.';
    if (error.status === 404)
      return 'Posten finns inte längre. Gå tillbaka till listan.';
    if (typeof error.error?.message === 'string') return error.error.message;
    if (error.status === 401) return 'Du behöver logga in igen.';
  }
  return 'Något gick fel. Försök igen om en liten stund.';
}
