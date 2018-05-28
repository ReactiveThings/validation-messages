// tslint:disable:max-line-length
// tslint:disable-next-line:import-blacklist
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

// non-generic reactive command functionality
export interface IReactiveCommand {

    CanExecute: Observable<boolean>;

    IsExecuting: Observable<boolean>;

    ThrownExceptions: Observable<any>;
}

export interface ReactiveCommandBase<TParam, TResult> extends IReactiveCommand, Subscribable<TResult> {
    ExecuteObservable(parameter: TParam): Observable<TResult>;

    Execute(parameter: TParam): void;
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
    private execute: (param: TParam) => Observable<TResult>;

    private isExecuting: Observable<boolean>;
    private canExecute: Observable<boolean>;
    private results: Observable<TResult | undefined>;
    private exceptions: Subject<any>;
    private canExecuteSubscription: Subscription;
    private executeSubscribtion: Subscription;
    private synchronizedExecutionInfo: Subject<ExecutionInfo<TResult>>;

    constructor(execute: (param: TParam) => Observable<TResult>, canExecute: Observable<boolean>) {
        super();
        if (!execute) {
            throw new Error('ArgumentNullException(execute)');
        }

        if (!canExecute) {
            throw new Error('ArgumentNullException(canExecute)');
        }
        this.execute = execute;
        this.synchronizedExecutionInfo = new Subject<ExecutionInfo<TResult>>();
        this.exceptions = new Subject<any>();
        this.exceptions.subscribe(err => {
            console.error(err);
        });
        this.isExecuting = this
            .synchronizedExecutionInfo
            .map(x => x.Demarcation === ExecutionDemarcation.Begin)
            .startWith(false)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this.canExecute = canExecute
            .catch(ex => {
                this.exceptions.next(ex);
                return Observable.of(false);
            })
            .startWith(false)
            .combineLatest(this.isExecuting, (canEx, isEx) => canEx && !isEx)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this.results = this
            .synchronizedExecutionInfo
            .filter(x => x.Demarcation === ExecutionDemarcation.EndWithResult)
            .map(x => x.Result);

        this.canExecuteSubscription = this.canExecute.subscribe();
    }

    public static Create<TParam, TResult>(execute: (param: TParam) => Observable<TResult>, canExecute?: Observable<boolean>): ReactiveCommand<TParam, TResult> {
        return new ReactiveCommand<TParam, TResult>(
            execute,
            canExecute || Observable.of(true));
    }

    public static Action(canExecute?: Observable<boolean>): ReactiveCommand<any, any> {
        return new ReactiveCommand<any, any>(
            p => Observable.of(p),
            canExecute || Observable.of(true));
    }

    get CanExecute(): Observable<boolean> {
        return this.canExecute;
    }

    get IsExecuting(): Observable<boolean> {
        return this.isExecuting;
    }

    get ThrownExceptions(): Observable<any> {
        return this.exceptions;
    }

    protected _subscribe(subscriber: Subscriber<TResult>): Subscription {
        return this.results.subscribe(subscriber);
    }


    public ExecuteObservable(parameter: TParam): Observable<TResult> {
        try {
            return Observable
                .defer(
                () => {
                    this.synchronizedExecutionInfo.next(ExecutionInfo.CreateBegin<TResult>());
                    return Observable.empty<TResult>();
                })
                .concat(this.execute(parameter))
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

    public Execute(parameter: TParam) {
        if (this.executeSubscribtion) {
            this.executeSubscribtion.unsubscribe();
        }
        this.executeSubscribtion = Observable.timer().switchMap(() => this.ExecuteObservable(parameter).take(1)).subscribe();
    }

    public Dispose(): any {
        this.synchronizedExecutionInfo.unsubscribe();
        this.exceptions.unsubscribe();
        this.canExecuteSubscription.unsubscribe();
        if (this.executeSubscribtion) {
            this.executeSubscribtion.unsubscribe();
        }
    }

}
