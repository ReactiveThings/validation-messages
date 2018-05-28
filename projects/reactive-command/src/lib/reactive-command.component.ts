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
        this.unsubscribeCanExecute();
        this._command = value;
        if (value) {
            this.subscribeCanExecute();
        }
    }
    @Input() public commandParameter: any = null;

    @Input() public preventDefault = true;
    @Input() public stopPropagation = true;

    private _disableElement = true;
    get disableElement(): boolean {
        return this._disableElement;
    }

    private canExecute = true;

    @Input()
    set disableElement(value: boolean) {
        this._disableElement = value;
        if (!this._disableElement) {
            this.enable();
        }
    }

    private commandSubscription: Subscription;
    private elementRef: ElementRef;

    constructor( @Inject(ElementRef) elementRef: ElementRef<DisableableElement>) {
        this.elementRef = elementRef;
    }

    @HostListener('click', ['$event'])
    public onClick($event: Event) {
        if (this.preventDefault) {
            $event.preventDefault();
        }
        if(this.stopPropagation) {
            $event.stopPropagation();
        }
        if (this.canExecute) {
            this.command.executeAsync(this.commandParameter);
        }
    }

    private subscribeCanExecute() {
        this.commandSubscription = this._command.canExecute
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

    private unsubscribeCanExecute() {
        if (this.commandSubscription) {
            this.commandSubscription.unsubscribe();
        }
    }

    private disable() {
        this.elementRef.nativeElement.disabled = true;
    }

    private enable() {
        this.elementRef.nativeElement.disabled = false;
    }

    public ngOnDestroy() {
        this.unsubscribeCanExecute();
    }
}
