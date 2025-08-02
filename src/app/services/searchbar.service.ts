import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchbarService {

  constructor() { }
  overlayOpen=signal(false);
  searchValue=""
}
