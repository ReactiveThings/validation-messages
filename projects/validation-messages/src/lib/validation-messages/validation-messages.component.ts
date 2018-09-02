import { Component, Input, ContentChildren, QueryList, TemplateRef, Optional } from '@angular/core';
import { AbstractControl, NgForm } from '@angular/forms';
import { ValidationMessageDirective } from '../validation-message.directive';
import { ValidationMessageService } from '../validation-message.service';

@Component({
    selector: 'rt-validation-messages',
    templateUrl: './validation-messages.component.html'
})
export class ValidationMessagesComponent {
    @Input()
    public control: AbstractControl;

    @ContentChildren(ValidationMessageDirective)
    public messages: QueryList<ValidationMessageDirective>;

    constructor(@Optional() private form: NgForm, private messageProvider: ValidationMessageService) {

    }

    public shouldShowValidationMessages() : boolean {
        return this.messageProvider.shouldShowValidationMessages(this.control ? this.control : undefined, this.form);
    }

    private hasCustomMessage(validator: string): boolean {
        return this.messages.some(p => p.validator === validator && p.message != null);
    }

    private getCustomMessage(validator: string): string {
        return this.messages.filter(p => p.validator === validator).map(p => p.message)[0];
    }

    private hasCustomParameters(validator: string): boolean {
        return this.messages.some(p => p.validator === validator && p.parameters != null);
    }

    private getParameters(validator: string): any {
        return this.messages.toArray().filter(p => p.validator === validator).map(p => p.parameters)[0];
    }

    private hasCustomTemplate(validator: string): boolean {
        return this.messages.some(p => p.validator === validator && p.template != null);
    }

    private getCustomTemplate(validator: string): TemplateRef<string> {
        return this.messages.toArray().filter(p => p.validator === validator).map(p => p.template)[0];
    }

    public getTemplate(validator: string): TemplateRef<string> {
        if (this.hasCustomTemplate(validator)) {
            return this.getCustomTemplate(validator);
        }
        return this.messageProvider.getCustomTemplate(validator, this.control);
    }

    public getMessage({ key: validator, value: parameters }): string {
        if (this.hasCustomMessage(validator)) {
            return this.getCustomMessage(validator)
        }
        return this.messageProvider.getMessage(validator, this.hasCustomParameters(validator) ? this.getParameters(validator) : parameters, this.control)
    }
}
