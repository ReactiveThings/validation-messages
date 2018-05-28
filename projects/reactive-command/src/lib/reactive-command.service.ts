// tslint:disable:max-line-length
// tslint:disable-next-line:import-blacklist
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { Subscribable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { PartialObserver } from 'rxjs';
import { toSubscriber } from 'rxjs/internal/util/toSubscriber';

// non-generic reactive command functionality
export interface CommandExecutionInfo {

    canExecute: Observable<boolean>;

    isExecuting: Observable<boolean>;

    thrownExceptions: Observable<any>;
}

export interface Command<TParam, TResult> extends CommandExecutionInfo, Subscribable<TResult> {
    execute(parameter?: TParam): Observable<TResult>;

    executeAsync(parameter?: TParam) : Promise<TResult>;
}

enum ExecutionDemarcation {
    Begin,
    Result,
    End
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
        return new ExecutionInfo(ExecutionDemarcation.Result, result);
    }

    public static CreateEnd<TResult>(): ExecutionInfo<TResult> {
        return new ExecutionInfo(ExecutionDemarcation.End);
    }
}

export class ReactiveCommand<TParam, TResult> implements Command<TParam, TResult> {
    private _execute: (param: TParam) => Observable<TResult>;

    private _isExecuting: Observable<boolean>;
    private _canExecute: Observable<boolean>;
    private _results: Observable<TResult | undefined>;
    private _exceptions: Subject<any>;
    private _canExecuteSubscription: Subscription;
    private _executionInfo: Subject<ExecutionInfo<TResult>>;

    constructor(_execute: (param: TParam) => Observable<TResult>, _canExecute: Observable<boolean>) {
        if (!_execute) {
            throw new Error('execute is not defined');
        }

        if (!_canExecute) {
            throw new Error('can execute is not defined');
        }
        this._execute = _execute;
        this._executionInfo = new Subject<ExecutionInfo<TResult>>();
        this._exceptions = new Subject<any>();
        this._exceptions.subscribe(err => {
            console.error(err);
        });
        this._isExecuting = this
            ._executionInfo
            .scan((acc, next) => {
                  if (next.Demarcation == ExecutionDemarcation.Begin) {
                      return acc + 1;
                  }

                  if (next.Demarcation == ExecutionDemarcation.End) {
                      return acc - 1;
                  }

                  return acc;
              },0)
            .map(inFlightCount => inFlightCount > 0)
            .startWith(false)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this._canExecute = _canExecute
            .catch(ex => {
                this._exceptions.next(ex);
                return Observable.of(false);
            })
            .startWith(false)
            .combineLatest(this._isExecuting, (canEx, isEx) => canEx && !isEx)
            .distinctUntilChanged()
            .publishReplay(1)
            .refCount();

        this._results = this
            ._executionInfo
            .filter(x => x.Demarcation === ExecutionDemarcation.Result)
            .map(x => x.Result);

        this._canExecuteSubscription = this._canExecute.subscribe();
    }

    get canExecute(): Observable<boolean> {
        return this._canExecute;
    }

    get isExecuting(): Observable<boolean> {
        return this._isExecuting;
    }

    get thrownExceptions(): Observable<any> {
        return this._exceptions;
    }

    public subscribe(observerOrNext?: PartialObserver<TResult> | ((value: TResult) => void),
            error?: (error: any) => void,
            complete?: () => void): Subscription {
      return this._results.subscribe(toSubscriber(observerOrNext));
    }

    public execute(parameter?: TParam): Observable<TResult> {
        try {
            return Observable
                .defer(
                () => {
                    this._executionInfo.next(ExecutionInfo.CreateBegin<TResult>());
                    return Observable.empty();
                })
                .concat(this._execute(parameter))
                .do(result => this._executionInfo.next(ExecutionInfo.CreateResult(result)))
                .catch(
                ex => {
                    this._exceptions.next(ex);
                    return Observable.throw(ex);
                }).finally(() => this._executionInfo.next(ExecutionInfo.CreateEnd<TResult>()))
                .publishLast()
                .refCount();
        } catch (ex) {
            this._exceptions.next(ex);
            return Observable.throw(ex);
        }
    }

    public executeAsync(parameter?: TParam) : Promise<TResult> {
        return this.execute(parameter).toPromise();
    }

    // todo it is necessary
    // public dispose(): void {
    //     this._executionInfo.unsubscribe();
    //     this._exceptions.unsubscribe();
    //     this._canExecuteSubscription.unsubscribe();
    // }

    
    public static createFromObservable<TParam, TResult>(_execute: (param: TParam) => Observable<TResult>, _canExecute?: Observable<boolean>): Command<TParam, TResult> {
      return new ReactiveCommand<TParam, TResult>(
          _execute,
          _canExecute || Observable.of(true));
    }

    public static createFromPromise<TParam, TResult>(_execute: (param: TParam) => Promise<TResult>, _canExecute?: Observable<boolean>): Command<TParam, TResult> {
      return new ReactiveCommand<TParam, TResult>(
          (param) => Observable.fromPromise(_execute(param)),
          _canExecute || Observable.of(true));
    }

    public static create(_canExecute?: Observable<boolean>): Command<any, any> {
        return ReactiveCommand.createFromObservable<any, any>(
            p => Observable.of(p),
            _canExecute || Observable.of(true));
    }

}
