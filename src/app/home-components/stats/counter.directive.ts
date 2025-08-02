import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCounter]'
})
export class CounterDirective implements OnInit, OnChanges {
  @Input('appCounterStart') start: number = 0;
  @Input('appCounterEnd') end: number = 0;
  @Input('appCounterDuration') duration: number = 1;
  private timer: any;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.startCounter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['start'] || changes['end'] || changes['duration']) {
      this.startCounter();
    }
  }

  startCounter(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    const range = this.end - this.start; // Calculate the range between start and end
    const stepTime = Math.abs(Math.floor((this.duration * 1000) / range)); // Calculate time per step
    let current = this.start; // Start from the initial value
    const increment = this.end > this.start ? 1 : -1; // Determine if incrementing or decrementing

    this.el.nativeElement.textContent = current; // Set initial value

    this.timer = setInterval(() => {
      current += increment; // Update current value
      this.el.nativeElement.textContent = current; // Update element with current value

      // Check if reached the end
      if ((increment === 1 && current >= this.end) || (increment === -1 && current <= this.end)) {
        clearInterval(this.timer); // Stop the timer
      }
    }, stepTime); // Set interval based on step time
  }
}
