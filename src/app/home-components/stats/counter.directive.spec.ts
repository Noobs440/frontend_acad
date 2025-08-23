import { CounterDirective } from './counter.directive';

import { ElementRef } from '@angular/core';

describe('CounterDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = { nativeElement: document.createElement('div') } as ElementRef;
    const directive = new CounterDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
