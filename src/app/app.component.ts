import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
      validator: Validators.compose([AppComponent.formGroupValidator])
    });
  }

  toogleRequired() {
    this.required = !this.required;
  }
  toogleDisabled() {
    this.disabled = !this.disabled;
  }

  
  toogleRequiredReactive() {
    const title = this.form.controls['title'];
    if(!this.required) {
      title.setValidators(Validators.required);
    }else{
      title.setValidators([]);
    }
    title.updateValueAndValidity();
    this.toogleRequired();
  }
  toogleDisabledReactive() {
    const title = this.form.controls['title'];
    
    if(!this.disabled) {
      title.disable();
    }else{
      title.enable();
    }
    this.toogleDisabled();
  }
}
