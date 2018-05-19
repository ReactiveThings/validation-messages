import { Directive, Input, TemplateRef, Optional } from '@angular/core';

@Directive({
  selector: 'rt-validation-message, [rt-validation-message]'
})
export class ValidationMessageDirective {
  @Input()
  public validator: string;

  @Input()
  public parameters: any;

  @Input()
  public message: string;

  @Input()
  public template: TemplateRef<any>;

  constructor(@Optional() public itemTemplate: TemplateRef<any>) {
    this.template = itemTemplate;
  }
}
