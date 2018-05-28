// tslint:disable:max-line-length
// tslint:disable-next-line:import-blacklist
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';

// non-generic reactive command functionality
export interface IReactiveCommand {
    /// <summary>
    /// An observable whose value indicates whether the command can currently execute.
    /// </summary>
    /// <remarks>
    /// The value provided by this observable is governed both by any <c>canExecute</c> observable provided during
    /// command creation, as well as the current execution status of the command. A command that is currently executing
    /// will always yield <c>false</c> from this observable, even if the <c>canExecute</c> pipeline is currently <c>true</c>.
    /// </remarks>
    CanExecute: Observable<boolean>;

    /// <summary>
    /// An observable whose value indicates whether the command is currently executing.
    /// </summary>
    /// <remarks>
    /// This observable can be particularly useful for updating UI, such as showing an activity indicator whilst a command
    /// is executing.
    /// </remarks>
    IsExecuting: Observable<boolean>;

    /// <summary>
    /// An observable that ticks any exceptions in command execution logic.
    /// </summary>
    /// <remarks>
    /// Any exceptions that are not observed via this observable will propagate out and cause the application to be torn
    /// down. Therefore, you will always want to subscribe to this observable if you expect errors could occur (e.g. if
    /// your command execution includes network activity).
    /// </remarks>
    ThrownExceptions: Observable<any>;
}

export interface ReactiveCommandBase<TParam, TResult> extends IReactiveCommand, Subscribable<TResult> {
    /// <summary>
    /// Gets an observable that, when subscribed, executes this command.
    /// </summary>
    /// <remarks>
    /// <para>
    /// Invoking this method will return a cold (lazy) observable that, when subscribed, will execute the logic
    /// encapsulated by the command. It is worth restating that the returned observable is lazy. Nothing will
    /// happen if you call <c>Execute</c> and neglect to subscribe (directly or indirectly) to the returned observable.
    /// </para>
    /// <para>
    /// If no parameter value is provided, a default value of type <typeparamref name="TParam"/> will be passed into
    /// the execution logic.
    /// </para>
    /// <para>
    /// Any number of subscribers can subscribe to a given execution observable and the execution logic will only
    /// run once. That is, the result is broadcast to those subscribers.
    /// </para>
    /// <para>
    /// In those cases where execution fails, there will be no result value. Instead, the failure will tick through the
    /// <see cref="ThrownExceptions"/> observable.
    /// </para>
    /// </remarks>
    /// <param name="parameter">
    /// The parameter to pass into command execution.
    /// </param>
    /// <returns>
    /// An observable that will tick the single result value if and when it becomes available.
    /// </returns>
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

/// <summary>
/// Encapsulates a user interaction behind a reactive interface.
/// </summary>
/// <remarks>
/// <para>
/// This class provides the bulk of the actual implementation for reactive commands. You should not create instances
/// of this class directly, but rather via the static creation methods on the non-generic <see cref="ReactiveCommand"/>
/// class.
/// </para>
/// </remarks>
/// <typeparam name="TParam">
/// The type of parameter values passed in during command execution.
/// </typeparam>
/// <typeparam name="TResult">
/// The type of the values that are the result of command execution.
/// </typeparam>
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

        /// <summary>
    /// Creates a <see cref="ReactiveCommand{TParam, TResult}"/>
    /// with asynchronous execution logic that takes a parameter of type <typeparamref name="TParam"/>.
    /// </summary>
    /// <param name="execute">
    /// Provides an observable representing the command's asynchronous execution logic.
    /// </param>
    /// <param name="canExecute">
    /// An optional observable that dictates the availability of the command for execution.
    /// </param>
    /// <param name="outputScheduler">
    /// An optional scheduler that is used to surface events. Defaults to <c>RxApp.MainThreadScheduler</c>.
    /// </param>
    /// <returns>
    /// The <c>ReactiveCommand</c> instance.
    /// </returns>
    /// <typeparam name="TParam">
    /// The type of the parameter passed through to command execution.
    /// </typeparam>
    /// <typeparam name="TResult">
    /// The type of the command's result.
    /// </typeparam>
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

    // tslint:disable-next-line:no-unnecessary-initializer
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
