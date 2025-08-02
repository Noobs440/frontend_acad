import { TestBed } from '@angular/core/testing';

import { SubmitProjectService } from './submit-project.service';

describe('SubmitProjectService', () => {
  let service: SubmitProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmitProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
