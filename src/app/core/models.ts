export interface User {
  id: number;
  username: string;
  expiresAt: string;
}

export interface LoginResponse extends User {
  token: string;
}
export interface Book {
  id: number;
  title: string;
  author: string;
  publicationDate: string;
}
export interface Quote {
  id: number;
  text: string;
  author: string;
}
// Uppgifterna som skickas när en bok eller ett citat sparas. API:et skapar id.
export interface BookInput {
  title: string;
  author: string;
  publicationDate: string;
}
export interface QuoteInput {
  text: string;
  author: string;
}
