import { AbstractControl, NgForm } from '@angular/forms';
import { TemplateRef } from '@angular/core';

export class ValidationMessageService {
    public shouldShowValidationMessages(control: AbstractControl, form?: NgForm): boolean {
        return control && !control.valid && (control.dirty || form && form.submitted);
    }
    public getMessage(validator: string, parameters: any, control: AbstractControl): string {
        return `${validator} : ${parameters}`;
    }
    public getCustomTemplate(validator: string, control: AbstractControl): TemplateRef<string> {
        return undefined;
    }
}
