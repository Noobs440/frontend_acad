import { Component, inject } from '@angular/core';
import { SearchbarService } from '../../services/searchbar.service';

@Component({
  selector: 'app-overlay-options',
  templateUrl: './overlay-options.component.html',
  styleUrl: './overlay-options.component.css'
})
export class OverlayOptionsComponent {
  categories= [{
    category: 'Politics',
    title: 'Dolorum optio tempore voluptas dignissimos',
    authorImgSrc: 'assets/img/blog/blog-author.jpg',
    author: 'Maria Doe',
    date: '2022-01-01'
  }];
  projects: string[] = ['Project 1', 'Project 2', 'Project 3'];
  constructor() {}
  searchValue=inject(SearchbarService)
  search(value:any){
    this.searchValue.searchValue=value;
  }

  ngOnInit(): void {}
}



