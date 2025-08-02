import { Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  animations: [
    trigger('fadeUp', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      state('*', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        animate('{{delay}}ms 600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 300 } })
    ]),

  ],
})
export class ContactComponent {

}
