import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';

interface Font {
  family: string;
  variants: string[];
  // Add other properties if needed from the API response
}

@Injectable({
  providedIn: 'root'
})
export class GoogleFontsService {

  private apiUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB7F6FC3vPT7wJGiksdBWPg_54XctfcDn0';

  constructor(private http: HttpClient) { }

  getFonts(): Observable<Font[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.items as Font[]),
      catchError(error => {
        console.error('Error fetching Google Fonts:', error);
        throw error;
      })
    );
  }

  loadGoogleFonts(fontFamilies: string[]): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css?family=${fontFamilies.join('|').replace(/ /g, '+')}`;
    document.head.appendChild(link);
  }
}
