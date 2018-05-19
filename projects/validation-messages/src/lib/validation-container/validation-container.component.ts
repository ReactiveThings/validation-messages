import { Component, OnInit, ContentChild, ContentChildren, QueryList, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgModel, FormControlName, FormControl, FormControlDirective, AbstractControl, NgControl } from '@angular/forms';
import { ValidationMessageDirective } from '../validation-message.directive';
import { ValidationMessagesComponent } from '../validation-messages/validation-messages.component';

@Component({
  selector: 'rt-validation-container',
  templateUrl: './validation-container.component.html',
  styleUrls: ['./validation-container.component.css']
})
export class ValidationContainerComponent{
  @ContentChild(NgModel)
  public ngModel: NgModel;

  @ContentChild(FormControlName)
  public controlName: FormControlName;

  @ContentChild(FormControlDirective)
  public formControl: FormControlDirective;

  @ContentChildren(ValidationMessageDirective)
  public messages: QueryList<ValidationMessageDirective>;

  @ViewChild(ValidationMessagesComponent)
  public messagesComponent: ValidationMessagesComponent;

  @ContentChild(ValidationMessagesComponent)
  public customMessagesComponent: ValidationMessagesComponent;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit() {
    if(this.customMessagesComponent) {
      this.customMessagesComponent.control = this.getControl().control;
    }

  }

  public ngAfterViewInit() {
    if(!this.customMessagesComponent) {
      this.messagesComponent.messages = this.messages;
    }
    
  }

  public getControl() : NgControl {
    return this.ngModel !== undefined ? this.ngModel : this.controlName !== undefined ? this.controlName : this.formControl;
  }

}
