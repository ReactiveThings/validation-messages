import { async, TestBed, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestWrapperComponent, buildComponent, TestWrapper } from './test-wrapper';
import { RequiredAsterixDirective } from './required-asterix.directive';


fdescribe('RequiredAsterixDirective', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule],
      declarations: [TestWrapperComponent, RequiredAsterixDirective]
    });
  }));

  it('ngModel', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
      <label for="title">Label</label>
      <input type="text" id="title" required name="title" [(ngModel)]="title" />
    </form>
    `);

    test(testFixture);
  }));

  it('formControlName', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
      <label for="title">Label</label>
      <input type="text" id="title" name="title" formControlName="title" />
    </div>
    `);

    test(testFixture);
  }));

  it('formControl', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
      <label for="title">Label</label>
      <input type="text" id="title" name="title" [formControl]="form.controls['title']" />
    </div>
    `);

    test(testFixture);
  }));
  
});

function test(testFixture: ComponentFixture<TestWrapperComponent>) {
  const test = new TestWrapper(testFixture);

  expect(test.labelRequired).toBeTruthy();

}

