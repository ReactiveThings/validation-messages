import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ValidationMessagesModule } from '../validation-messages.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { buildComponent, TestWrapperComponent, TestWrapper } from './test-wrapper';

describe('rt-validation-messages -> display required message only when field is dirty and empty', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ValidationMessagesModule, FormsModule, ReactiveFormsModule],
      declarations: [TestWrapperComponent]
    });
  }));

  it('ngModel', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
      <form>
          <input type="text" required name="title" [(ngModel)]="title" #titleControl1="ngModel" />
          <rt-validation-messages [control]="titleControl1">
          </rt-validation-messages>
      </form>`
    );

    test(testFixture, 'required : true');
  }));

  it('formControlName', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
        <input type="text" name="title" formControlName="title" />
        <rt-validation-messages [control]="form.controls['title']"></rt-validation-messages>
    </div>
    `);

    test(testFixture, 'required : true');
  }));

  it('formControl', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <div [formGroup]="form">
        <input type="text" name="title" [formControl]="form.controls['title']" />
        <rt-validation-messages [control]="form.controls['title']"></rt-validation-messages>
    </div>
    `);

    test(testFixture, 'required : true');
  }));

  it('formGroup', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
      <div [formGroup]="form">
          <input type="text" name="title" formControlName="title" />
          <rt-validation-messages [control]="form"></rt-validation-messages>
      </div>
    `);
    test(testFixture, 'formGroupValidator : true');
  }));

  it('custom message', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
        <input type="text" required name="title" [(ngModel)]="title" #titleControl2="ngModel" />
        <rt-validation-messages [control]="titleControl2">
            <rt-validation-message validator="required" message="Field is required"></rt-validation-message>
        </rt-validation-messages>
    </form>
    `);
    test(testFixture, 'Field is required');
    
  }));

  it('message with custom parameters', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <form>
        <input type="text" required name="title" [(ngModel)]="title" #titleControl3="ngModel" />
        <rt-validation-messages [control]="titleControl3">
            <rt-validation-message validator="required" parameters="Title"></rt-validation-message>
        </rt-validation-messages>
    </form>
    `);
    test(testFixture, 'required : Title');
    
  }));
  it('message in custom template', fakeAsync( async () => {
    const testFixture = await buildComponent(`        
    <ng-template #customTemplate let-message>
        <div class="rt-custom-template-message" style="color: yellow">{{message}}</div>
    </ng-template>
    <form>
        <input type="text" required name="title" [(ngModel)]="title" #titleControl4="ngModel" />
        <rt-validation-messages [control]="titleControl4">
            <rt-validation-message validator="required" [template]="customTemplate"></rt-validation-message>
        </rt-validation-messages>
    </form>
    `);
    const expectedMessage = 'required : true';
    const test = new TestWrapper(testFixture);

    expect(test.customMessage).not.toBeUndefined();
  
    test.markInputAsDirty();
    expect(test.customMessage).toBe(expectedMessage);
  
    test.setValue('Title');
    expect(test.customMessage).not.toBeUndefined();
  
    test.setValue('');
  
    expect(test.customMessage).toBe(expectedMessage);
    
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
