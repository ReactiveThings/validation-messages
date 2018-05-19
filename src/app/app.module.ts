import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TestcaseComponent } from './testcase/testcase.component';
import { ValidationMessagesModule } from '@reactivethings/validation-messages';
class MyValidationMessageService
{
  public getMessage(validator: string, parameters: any) : string {
    return 'Field ' + parameters + ' is required';
  }
}

@NgModule({
  declarations: [
    AppComponent,
    TestcaseComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    ValidationMessagesModule
  ],
  //providers: [{ provide: ValidationMessageProvider, useClass: MyValidationMessageProvider }],
  bootstrap: [AppComponent]
})
export class AppModule { }
