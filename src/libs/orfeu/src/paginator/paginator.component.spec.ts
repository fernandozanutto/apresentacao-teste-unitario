import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AplsPaginatorComponent } from './paginator.component';
import { OverlayModule } from '@angular/cdk/overlay';

describe('AplsPaginatorComponent', () => {
  let component: AplsPaginatorComponent;
  let fixture: ComponentFixture<AplsPaginatorComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [OverlayModule],
        declarations: [
          AplsPaginatorComponent
        ]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AplsPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
