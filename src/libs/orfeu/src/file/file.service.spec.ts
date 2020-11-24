/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AplsInputFileService } from './file.service';

describe('Service: File', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AplsInputFileService]
    });
  });

  it('should ...', inject([AplsInputFileService], (service: AplsInputFileService) => {
    expect(service).toBeTruthy();
  }));
});
