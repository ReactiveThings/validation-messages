import { Directive, ElementRef, OnInit, Optional } from '@angular/core';
import { FormControlName, AbstractControl, NgModel, NgControl, FormControlDirective } from '@angular/forms';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Directive({
  selector: '[required], [required][disabled], [formControlName], [test]'
})
export class RequiredAsterixDirective implements OnInit{

  constructor(
    private readonly elementRef: ElementRef,
    @Optional() public control: NgControl) { }

  public ngOnInit() {

    if(this.control) {
      const disabled = this.control.disabled;
      const required = hasRequiredField(this.control.control)
      this.setLabel(disabled, required);

      this.control.statusChanges
      .pipe(map( () => ({
        disabled: this.control.disabled,
        required: hasRequiredField(this.control.control)
      })), distinctUntilChanged((a,b) => a.disabled === b.disabled && a.required === b.required))
      .subscribe(status => {
        console.log(status)
        this.setLabel(status.required, status.disabled);
      });

    }
  }

  public setLabel(required: boolean, disabled: boolean) {
    const element =  this.elementRef.nativeElement;

    const label = document.querySelector(`label[for="${element.id}"]`);
    if(!label) return;
    if( required && !disabled) {
      label.classList.add("required");
    }else{
      label.classList.remove("required");
    }
    
  }

}


function hasRequiredField(abstractControl: AbstractControl): boolean {
  if (abstractControl.validator) {
    const validator = abstractControl.validator({}as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }
  if (abstractControl['controls']) {
    for (const controlName in abstractControl['controls']) {
      if (abstractControl['controls'][controlName]) {
        if (hasRequiredField(abstractControl['controls'][controlName])) {
          return true;
        }
      }
    }
  }
  return false;
};