import { async, TestBed, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { ValidationMessagesModule } from '../validation-messages.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestWrapperComponent, buildComponent, TestWrapper } from '../validation-messages/test-wrapper';


describe('validation-container', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ValidationMessagesModule, FormsModule, ReactiveFormsModule],
      declarations: [TestWrapperComponent]
    });
  }));

  it('ngModel', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
        <rt-validation-container>
            <input type="text" required name="title" [(ngModel)]="title" />
        </rt-validation-container>
    </form>
    `);

    test(testFixture, 'required : true');
  }));

  it('formControlName', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
      <rt-validation-container>
          <input type="text" name="title" formControlName="title" />
      </rt-validation-container>
    </div>
    `);

    test(testFixture, 'required : true');
  }));

  it('formControl', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
        <rt-validation-container>
            <input type="text" name="title" [formControl]="form.controls['title']" />
        </rt-validation-container>
    </div>
    `);

    test(testFixture, 'required : true');
  }));
  it('custom validation-message', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
        <rt-validation-container>
            <input type="text" required name="title" [(ngModel)]="title" />
            <rt-validation-message validator="required" message="Field is required"></rt-validation-message>
        </rt-validation-container>
    </form>
    `);

    test(testFixture, 'Field is required');
  }));
  it('custom message inside rt-validation-messages', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
        <rt-validation-container>
            <rt-validation-messages>
                <rt-validation-message validator="required" message="Field is required"></rt-validation-message>
            </rt-validation-messages>
            <input type="text" required name="title" [(ngModel)]="title" />
        </rt-validation-container>
    </form>
    `);

    test(testFixture, 'Field is required');
  }));
});

function test(testFixture: ComponentFixture<TestWrapperComponent>, expectedMessage: string) {
  const test = new TestWrapper(testFixture);

  expect(test.message).not.toBeUndefined();

  test.markInputAsDirty();
  expect(test.message).toBe(expectedMessage);

  test.setValue('Title');
  expect(test.message).not.toBeUndefined();

  test.setValue('');

  expect(test.message).toBe(expectedMessage);
}