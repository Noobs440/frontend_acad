import { TestBed } from '@angular/core/testing';

import { ProjetstatusService } from './projetstatus.service';

describe('ProjetstatusService', () => {
  let service: ProjetstatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjetstatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
