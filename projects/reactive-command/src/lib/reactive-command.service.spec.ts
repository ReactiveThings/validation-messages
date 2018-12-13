import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCommand } from './reactive-command.service';
import { Observable } from 'rxjs/internal/Observable';
import { of, EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

fdescribe('ReactiveCommandService', () => {
  let testScheduler: TestScheduler;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // console.log('actual:', actual);
      // console.log('expected:', expected);
      expect(actual).toEqual(expected);
    });
  });

  // it('test1', async () => {
  //   var canExecute = Observable.from([true]);
  //   var command = ReactiveCommand.createFromObservable(obs, canExecute);
  //   var command1 = ReactiveCommand.createFromPromise(prom, canExecute);
  //   var command2 = ReactiveCommand.create(canExecute);

  //   var obser = command.execute();

  //   command1.subscribe(p => console.log(p));

  //   await command1.executeAsync();


  //   command.execute();
  // });


  function obs(param: string): Observable<number> {
    return EMPTY;
  }

  function prom(): Promise<number> {
    return new Promise(() => 1);
  }
  describe('isExecuting', () => {
    it('when command is not executing then returns false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-----';
        const isExecutingMarble = 'f';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {f: false});
      });
    });

    it('when command is executing returns true, when observable is completed then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '------a----|';
        const isExecutingMarble = 't----------f';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);
        command.execute().subscribe();

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    xit('when command is unsubscribed before observable completes then immediately return false and unsubscribe from source', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const executeMarble     = '------a----|';
        const isExecutingMarble = 't-f';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);
        expectObservable(command.execute(), '^-!');
        expectSubscriptions(execute.subscriptions).toBe('^-!');

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when command is executing returns true, when observable ends with an error then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-----------#';
        const isExecutingMarble = 't----------f';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);
        command.execute().subscribe();

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when execute is unsubscribed before observable emit value then is executing return false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '---a-|';
        const isExecutingMarble = 't-f';

        const command = ReactiveCommand.createFromObservable(() => cold(executeMarble));

        expectObservable(command.execute(), '^-!');

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when first execute is unsubscribed before observable emits then returns false when second command is finished', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '---a-|';
        const isExecutingMarble = 't----f';

        const command = ReactiveCommand.createFromObservable(() => cold(executeMarble));

        expectObservable(command.execute(), '^-!');
        expectObservable(command.execute());

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when all commands has been executed sucessfully then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-a-|';
        const isExecutingMarble = 't---f';

        const command = ReactiveCommand.createFromObservable(() => cold(executeMarble));

        expectObservable(command.execute(), '^').toBe('---(a|)');
        expectObservable(command.execute(), '-^').toBe('----(a|)');

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when all commands has been executed ( first with an error ) then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-#';
        const executeMarble1    = '--a-|';
        const isExecutingMarble = 't---f';
        let i = 0;
        const execute = () => cold(i++ % 2 === 0 ? executeMarble : executeMarble1);
        const command = ReactiveCommand.createFromObservable(execute);

        expectObservable(command.execute()).toBe('-#');
        expectObservable(command.execute()).toBe('----(a|)');

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });

    it('when all commands has been executed ( second with an error ) then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-a-|';
        const executeMarble1    = '-----#';
        const isExecutingMarble = 't----f';
        let i = 0;
        const execute = () => cold(i++ % 2 === 0 ? executeMarble : executeMarble1);
        const command = ReactiveCommand.createFromObservable(execute);

        expectObservable(command.execute()).toBe('---(a|)');
        expectObservable(command.execute()).toBe('-----#');

        expectObservable(command.isExecuting).toBe(isExecutingMarble, {t: true, f: false});
      });
    });
  });

  describe('canExecute', () => {

    it('when command is not executing then returns true', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '-----';
        const canExecuteMarble = 't';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);

        expectObservable(command.canExecute).toBe(canExecuteMarble, {t: true});
      });
    });

    it('when command is executing returns true, when command is finished then emits false', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const executeMarble     = '------a----|';
        const canExecuteMarble = 'f----------t';

        const execute = cold(executeMarble);
        const command = ReactiveCommand.createFromObservable(() => execute);
        command.execute().subscribe();

        expectObservable(command.canExecute).toBe(canExecuteMarble, {t: true, f: false});
      });
    });

    it('when command is not executing then emits same values as input observable', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const canExecuteMarble = 't----f--t';

        const canExecute = cold(canExecuteMarble, {t: true, f: false});
        const command = ReactiveCommand.createFromObservable(() => of(), canExecute);

        expectObservable(command.canExecute).toBe(canExecuteMarble, {t: true, f: false});
      });
    });

    it('when command is not executing and input canExecute observable completes then can execute does not emits complete value', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const canExecuteMarble = 't----f';

        const canExecute = cold('t----f|', {t: true, f: false});
        const command = ReactiveCommand.createFromObservable(() => of(), canExecute);

        expectObservable(command.canExecute).toBe(canExecuteMarble, {t: true, f: false});
      });
    });

    it('when command is executing and input canExecute observable emits true value then value is ignored', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const expectedCanExecuteMarble = 'f--t';
        const inputCanExecuteMarble    = '-t';
        const executeMarble            = '---|';

        const canExecute = cold(inputCanExecuteMarble, {t: true, f: false});
        const command = ReactiveCommand.createFromObservable(() => cold(executeMarble), canExecute);
        expectObservable(command.execute());

        expectObservable(command.canExecute).toBe(expectedCanExecuteMarble, {t: true, f: false});
      });
    });

    it('when command is executing and input canExecute observable emits false then after execution do not emits true', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const expectedCanExecuteMarble = 'f--';
        const inputCanExecuteMarble    = '-f';
        const executeMarble            = '---|';

        const canExecute = cold(inputCanExecuteMarble, {t: true, f: false});
        const command = ReactiveCommand.createFromObservable(() => cold(executeMarble), canExecute);
        expectObservable(command.execute());

        expectObservable(command.canExecute).toBe(expectedCanExecuteMarble, {t: true, f: false});
      });
    });

  });

  it('execute observable returns last value of source observable', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const inputMarble = 'a-b|';
      const expected =    '---(b|)';
      const input = cold(inputMarble, {a: true});
      const command = ReactiveCommand.createFromObservable((p) => input);
      const $execute = command.execute();
      expectObservable($execute).toBe(expected, {a: true});
    });
  });
});
