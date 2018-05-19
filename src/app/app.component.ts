import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '';

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
}
