import { Directive, OnDestroy, HostListener, ElementRef, Inject, Input } from '@angular/core';

import { Command } from './reactive-command.service';
import { Subscription } from 'rxjs/Subscription';

interface DisableableElement {
    disabled: boolean;
}

@Directive({
    selector: '[rtCommand]',
    exportAs: 'command'
})
export class ReactiveCommandDirective implements OnDestroy {
    private _command: Command<any, any>;
    get command(): Command<any, any> {
        return this._command;
    }

    @Input('rtCommand')
    set command(value: Command<any, any>) {
        this.unsubscribeDisableSubscription();
        this._command = value;
        if (this._command) {
            this.disableElementSubscription = this.createDisableSubscription();
        }
    }
    @Input() public commandParameter: any = null;

    @Input() public preventDefault = true;
    @Input() public stopPropagation = true;

    private _disableElement = true;
    get disableElement(): boolean {
        return this._disableElement;
    }
    @Input()
    set disableElement(value: boolean) {
        this._disableElement = value;
        if (!this._disableElement) {
            this.enable();
        }
    }

    private disableElementSubscription: Subscription;
    private canExecute = true;

    constructor(@Inject(ElementRef) private elementRef: ElementRef<DisableableElement>) {
    }

    @HostListener('click', ['$event'])
    public onClick($event: Event) {
        if (this.preventDefault) {
            $event.preventDefault();
        }
        if(this.stopPropagation) {
            $event.stopPropagation();
        }
        if (this.canExecute && this.command) {
            this.command.executeAsync(this.commandParameter);
        }
    }

    private createDisableSubscription() {
        return this._command.canExecute
            .combineLatest(
            this._command.isExecuting,
            (canExecute, isExecuting) => ({ canExecute: canExecute, isExecuting: isExecuting }))
            .subscribe(p => {
                this.canExecute = p.canExecute;
                if ((!p.canExecute && this.disableElement) || p.isExecuting) {
                    this.disable();
                } else {
                    this.enable();
                }
            });
    }

    private unsubscribeDisableSubscription() {
        if (this.disableElementSubscription) {
            this.disableElementSubscription.unsubscribe();
        }
    }

    private disable() {
        this.elementRef.nativeElement.disabled = true;
    }

    private enable() {
        this.elementRef.nativeElement.disabled = false;
    }

    public ngOnDestroy() {
        this.unsubscribeDisableSubscription();
    }
}
