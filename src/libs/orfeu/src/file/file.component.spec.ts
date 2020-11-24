import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AplsInputFileComponent } from './file.component';

import { AplsInput } from '../input/input';

describe('AplsInputFileComponent', () => {
  let component: AplsInputFileComponent;
  let fixture: ComponentFixture<AplsInputFileComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [
          AplsInputFileComponent,
          AplsInput,
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AplsInputFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
