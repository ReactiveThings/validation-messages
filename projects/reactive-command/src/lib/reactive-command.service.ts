
import { Subject, Subscription ,  Subscribable ,  PartialObserver, EMPTY, throwError, of, from } from 'rxjs';
import { Observable} from 'rxjs-compat';
import { toSubscriber } from 'rxjs/internal/util/toSubscriber';

// non-generic reactive command functionality
export interface CommandExecutionInfo {

    canExecute: Observable<boolean>;

    isExecuting: Observable<boolean>;

    thrownExceptions: Observable<any>;
}

export interface Command<TParam, TResult> extends CommandExecutionInfo, Subscribable<TResult> {
    execute(parameter?: TParam): Observable<TResult>;

    executeAsync(parameter?: TParam): Promise<TResult>;
}

enum ExecutionDemarcation {
    Begin,
    Result,
    End
}

class ExecutionInfo<TResult> {

    constructor(private readonly demarcation: ExecutionDemarcation, private readonly result?: TResult) {
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
    private readonly _execute: (param: TParam) => Observable<TResult>;

    private readonly _isExecuting: Observable<boolean>;
    private readonly _canExecute: Observable<boolean>;
    private readonly _results: Observable<TResult | undefined>;
    private readonly _exceptions: Subject<any>;
    private readonly _canExecuteSubscription: Subscription;
    private readonly _executionInfo: Subject<ExecutionInfo<TResult>>;

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
              if (next.Demarcation === ExecutionDemarcation.Begin) {
                  return acc + 1;
              }

              if (next.Demarcation === ExecutionDemarcation.End) {
                  return acc - 1;
              }
              return acc;
          }, 0)
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

    public static createFromObservable<TParam, TResult>(
      _execute: (param: TParam) => Observable<TResult>,
      _canExecute?: Observable<boolean>): Command<TParam, TResult> {
      return new ReactiveCommand<TParam, TResult>(
          _execute,
          _canExecute || of(true));
    }

    public static createFromPromise<TParam, TResult>(
      _execute: (param: TParam) => Promise<TResult>,
      _canExecute?: Observable<boolean>): Command<TParam, TResult> {
      return new ReactiveCommand<TParam, TResult>(
          (param) => from(_execute(param)),
          _canExecute || of(true));
    }

    public static create(_canExecute?: Observable<boolean>): Command<any, any> {
        return ReactiveCommand.createFromObservable<any, any>(
            p => of(p),
            _canExecute || of(true));
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
                    return EMPTY;
                })
                .concat(this._execute(parameter))
                .do(result => this._executionInfo.next(ExecutionInfo.CreateResult(result)))
                .catch(
                ex => {
                    this._exceptions.next(ex);
                    return throwError(ex);
                }).finally(() => this._executionInfo.next(ExecutionInfo.CreateEnd<TResult>()))
                .publishLast()
                .refCount();
        } catch (ex) {
            this._exceptions.next(ex);
            return throwError(ex);
        }
    }

    public executeAsync(parameter?: TParam): Promise<TResult> {
        return this.execute(parameter).toPromise();
    }

}
