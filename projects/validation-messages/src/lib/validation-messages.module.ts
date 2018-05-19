import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ValidationMessagesComponent } from './validation-messages/validation-messages.component';
import { ValidationMessageDirective } from './validation-message.directive';
import { KeysPipe } from './keys.pipe';
import { ValidationContainerComponent } from './validation-container/validation-container.component';
import { ValidationMessageService } from './validation-message.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ValidationMessagesComponent, ValidationMessageDirective, KeysPipe, ValidationContainerComponent],
  exports: [ValidationMessagesComponent, ValidationMessageDirective, ValidationContainerComponent],
  providers: [ValidationMessageService]
})
export class ValidationMessagesModule { }
