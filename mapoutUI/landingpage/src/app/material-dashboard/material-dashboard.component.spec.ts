
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDashboardComponent } from './material-dashboard.component';

describe('MaterialDashboardComponent', () => {
  let component: MaterialDashboardComponent;
  let fixture: ComponentFixture<MaterialDashboardComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
