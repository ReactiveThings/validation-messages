import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCommandService } from './reactive-command.service';

describe('ReactiveCommandService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReactiveCommandService]
    });
  });

  it('should be created', inject([ReactiveCommandService], (service: ReactiveCommandService) => {
    expect(service).toBeTruthy();
  }));
});
