// tslint:disable:max-line-length
// tslint:disable-next-line:import-blacklist
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { PartialObserver } from 'rxjs';
import { toSubscriber } from 'rxjs/internal/util/toSubscriber';

// non-generic reactive command functionality
export interface IReactiveCommand {

    canExecute: Observable<boolean>;

    isExecuting: Observable<boolean>;

    thrownExceptions: Observable<any>;
}

export interface ReactiveCommandBase<TParam, TResult> extends IReactiveCommand, Subscribable<TResult> {
    executeObservable(parameter: TParam): Observable<TResult>;

    execute(parameter: TParam): void;
}

enum ExecutionDemarcation {
    Begin,
    EndWithResult,
    EndWithException,
    Ended
}

class ExecutionInfo<TResult> {
    private demarcation: ExecutionDemarcation;
    private result?: TResult;

    constructor(demarcation: ExecutionDemarcation, result?: TResult) {
        this.demarcation = demarcation;
        this.result = result;
    }

    get Demarcation(): ExecutionDemarcation {
        return this.demarcation;
    }

    get Result(): TResult | undefined {
        return this.result;
    }

    public static CreateBegin<TResult>(): ExecutionInfo<TResult> {
        return new ExecutionInfo(ExecutionDemarcation.Begin);
    }

    public static CreateResult<TResult>(result: TResult): ExecutionInfo<TResult> {
        return new ExecutionInfo(ExecutionDemarcation.EndWithResult, result);
    }

    public static CreateFail<TResult>(): ExecutionInfo<TResult> {
        return new ExecutionInfo(ExecutionDemarcation.EndWithException);
    }

    public static CreateEnded<TResult>(): ExecutionInfo<TResult> {
        return new ExecutionInfo(ExecutionDemarcation.Ended);
    }
}

export class ReactiveCommand<TParam, TResult> extends Observable<TResult> implements ReactiveCommandBase<TParam, TResult> {
    private _execute: (param: TParam) => Observable<TResult>;

    private _isExecuting: Observable<boolean>;
    private _canExecute: Observable<boolean>;
    private results: Observable<TResult | undefined>;
    private exceptions: Subject<any>;
    private _canExecuteSubscription: Subscription;
    private _executeSubscribtion: Subscription;
    private synchronizedExecutionInfo: Subject<ExecutionInfo<TResult>>;

    constructor(_execute: (param: TParam) => Observable<TResult>, _canExecute: Observable<boolean>) {
        super();
        if (!_execute) {
            throw new Error('ArgumentNullException(_execute)');
        }

        if (!_canExecute) {
            throw new Error('ArgumentNullException(_canExecute)');
        }
        this._execute = _execute;
        this.synchronizedExecutionInfo = new Subject<ExecutionInfo<TResult>>();
        this.exceptions = new Subject<any>();
        this.exceptions.subscribe(err => {
            console.error(err);
        });
        this._isExecuting = this
            .synchronizedExecutionInfo
            .map(x => x.Demarcation === ExecutionDemarcation.Begin)
            .startWith(false)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this._canExecute = _canExecute
            .catch(ex => {
                this.exceptions.next(ex);
                return Observable.of(false);
            })
            .startWith(false)
            .combineLatest(this._isExecuting, (canEx, isEx) => canEx && !isEx)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this.results = this
            .synchronizedExecutionInfo
            .filter(x => x.Demarcation === ExecutionDemarcation.EndWithResult)
            .map(x => x.Result);

        this._canExecuteSubscription = this._canExecute.subscribe();
    }

    public static create<TParam, TResult>(_execute: (param: TParam) => Observable<TResult>, _canExecute?: Observable<boolean>): ReactiveCommand<TParam, TResult> {
        return new ReactiveCommand<TParam, TResult>(
            _execute,
            _canExecute || Observable.of(true));
    }

    public static action(_canExecute?: Observable<boolean>): ReactiveCommand<any, any> {
        return new ReactiveCommand<any, any>(
            p => Observable.of(p),
            _canExecute || Observable.of(true));
    }

    get canExecute(): Observable<boolean> {
        return this._canExecute;
    }

    get isExecuting(): Observable<boolean> {
        return this._isExecuting;
    }

    get thrownExceptions(): Observable<any> {
        return this.exceptions;
    }

    public subscribe(observerOrNext?: PartialObserver<TResult> | ((value: TResult) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {
      return this.results.subscribe(toSubscriber(observerOrNext));
    }

    public executeObservable(parameter: TParam): Observable<TResult> {
        try {
            return Observable
                .defer(
                () => {
                    this.synchronizedExecutionInfo.next(ExecutionInfo.CreateBegin<TResult>());
                    return Observable.empty();
                })
                .concat(this._execute(parameter))
                .do(
                result => this.synchronizedExecutionInfo.next(ExecutionInfo.CreateResult(result)),
                () => this.synchronizedExecutionInfo.next(ExecutionInfo.CreateEnded<TResult>()),
                () => this.synchronizedExecutionInfo.next(ExecutionInfo.CreateEnded<TResult>()))
                .catch(
                ex => {
                    this.synchronizedExecutionInfo.next(ExecutionInfo.CreateFail<TResult>());
                    this.exceptions.next(ex);
                    return Observable.throw(ex);
                })
                .publishLast()
                .refCount();
        } catch (ex) {
            this.exceptions.next(ex);
            return Observable.throw(ex);
        }
    }

    public execute(parameter: TParam) {
        if (this._executeSubscribtion) {
            this._executeSubscribtion.unsubscribe();
        }
        this._executeSubscribtion = Observable.timer().switchMap(() => this.executeObservable(parameter).take(1)).subscribe();
    }

    public dispose(): any {
        this.synchronizedExecutionInfo.unsubscribe();
        this.exceptions.unsubscribe();
        this._canExecuteSubscription.unsubscribe();
        if (this._executeSubscribtion) {
            this._executeSubscribtion.unsubscribe();
        }
    }

}
