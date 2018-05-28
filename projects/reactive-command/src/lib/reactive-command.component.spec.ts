import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveCommandComponent } from './reactive-command.component';

describe('ReactiveCommandComponent', () => {
  let component: ReactiveCommandComponent;
  let fixture: ComponentFixture<ReactiveCommandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactiveCommandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactiveCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
