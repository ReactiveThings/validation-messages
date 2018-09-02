import { FormGroup, FormBuilder, ValidationErrors, Validators } from "@angular/forms";
import { ComponentFixture, TestBed, tick } from "@angular/core/testing";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";

@Component({
    selector: 'test-wrapper',
    template: '',
})
export class TestWrapperComponent {
    title = '';
    required = false;
    disabled = false;
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
  
    toogleRequired() {
        this.required = !this.required;
        const title = this.form.controls['title'];
        if(title){
            if(!this.required) {
                title.setValidators(Validators.required);
            }else{
                title.setValidators([]);
            }
            title.updateValueAndValidity();
        }
    }
    toogleDisabled() {
      this.disabled = !this.disabled;
      const title = this.form.controls['title'];
      if(title) {
        if(this.disabled) {
            title.enable();
          }else{
            title.disable();
          }
      }
    }
}

export function buildComponent(
    template: string,
    bindings: { [binding: string]: any } = {}): Promise<ComponentFixture<TestWrapperComponent>> {
    TestBed.overrideComponent(
        TestWrapperComponent, { set: { template, inputs: Object.keys(bindings) } });
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
  
    public get labelRequired() {
      const element = this.testFixture.debugElement.query(By.css('label'));
      if(!element) {
        return false;
      }
      return element.nativeElement.className;
    }

  }
  
  