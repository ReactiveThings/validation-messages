import { ComponentFixture, tick, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Validators, ValidationErrors, FormBuilder, FormGroup } from "@angular/forms";
import { Component } from "@angular/core";

@Component({
    selector: 'test-wrapper',
    template: '',
  })
  export class TestWrapperComponent {
    title = null;
    form: FormGroup;
    constructor(private fb: FormBuilder) {
      this.createForm();
    }
    static formGroupValidator(form: FormGroup): ValidationErrors {
      const titleControl = form.get('title');
      if (titleControl != null) {
        const title = titleControl.value;
   
        return !title ? { 'formGroupValidator': true } : null;
      }
    }
    createForm() {
      this.form = this.fb.group({
        title: ['', Validators.required ]
      }, 
      {
        validator: Validators.compose([TestWrapperComponent.formGroupValidator])
      });
    }
  }
  
  export function buildComponent(
      template: string,
      bindings: {[binding: string]: any} = {}): Promise<ComponentFixture<TestWrapperComponent>> {
    TestBed.overrideComponent(
      TestWrapperComponent, {set: {template, inputs: Object.keys(bindings)}});
    return TestBed.compileComponents().then(() => {
      // Note: we can also use TestWrapperComponent.prototype[binding] instead of
      // Object.assign; however, using Object.assign more closely matches
      // Angular, wherein the inputs are not available on construction.
      const fixture = TestBed.createComponent(TestWrapperComponent);
      (Object as any).assign(fixture.componentInstance, bindings);
      return fixture;
    });
  }
  
  export class TestWrapper {
    constructor(private testFixture: ComponentFixture<TestWrapperComponent>) {
      testFixture.detectChanges();
      tick();
    }
  
    public markInputAsDirty(){
      const input: HTMLInputElement = this.testFixture.debugElement.query(By.css('input')).nativeElement;
      input.dispatchEvent(new Event( "input" ));
      this.testFixture.detectChanges();
      tick();
    }
  
    public setValue(value: string) {
      const input: HTMLInputElement = this.testFixture.debugElement.query(By.css('input')).nativeElement;
      input.value = value;
      input.dispatchEvent(new Event( "input" ));
      this.testFixture.detectChanges();
      tick();
    }
  
    public get message() {
      const element = this.testFixture.debugElement.query(By.css('.rt-validation-message'));
      if(!element) {
        return element;
      }
      return element.nativeElement.textContent;
    }
  
    public get customMessage() {
      const element = this.testFixture.debugElement.query(By.css('.rt-custom-template-message'));
      if(!element) {
        return element;
      }
      return element.nativeElement.textContent;
    }
  }