import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCommand } from './reactive-command.service';
import { Observable } from 'rxjs/internal/Observable';
import { observable, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

describe('ReactiveCommandService', () => {
  let testScheduler: TestScheduler;
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      console.log('actual:',actual)
      console.log('expected:', expected)
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


  function obs(param: string) : Observable<number> {
    return Observable.empty();
  }

  function prom() : Promise<number> {
    return new Promise(() => 1);
  }

  it('isExecuting returns true on execute, after executing changes value to false', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const inputMarble =    '------a----|';
      const expectedMarble = 't----------f'
      const input = cold(inputMarble);
      var command = ReactiveCommand.createFromObservable((p) => input);
      command.execute().subscribe();
      expectObservable(command.isExecuting).toBe(expectedMarble,{t: true, f: false});
    });
  });

  it('isExecuting returns false when command is not executing', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const inputMarble =    '-----';
      const expectedMarble = 'f'
      const input = cold(inputMarble);
      var command = ReactiveCommand.createFromObservable((p) => input);

      expectObservable(command.isExecuting).toBe(expectedMarble,{t: true, f: false});
    });
  });

  it('canExecute returns false on execute, after executing changes value to true ', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const inputMarble =    '------a----|';
        const expectedMarble = 'f----------t'
        const input = cold(inputMarble);
        var command = ReactiveCommand.createFromObservable((p) => input);
        command.execute().subscribe();
        expectObservable(command.canExecute).toBe(expectedMarble,{t: true, f: false});
      });
  });

  it('when command is executed canExecute values are ignored. After executing value is taken into consideration', () => {
    testScheduler.run(({ cold, hot, expectObservable }) => {
      const inputMarble =    '------a----|';
      const expectedMarble = 'f----------t'
      const canExecute = hot('f-t-t',{t: true, f: false}).map(p => <boolean>p)
      const input = cold(inputMarble);
      var command = ReactiveCommand.createFromObservable((p) => input, canExecute);
      command.execute().subscribe();
      expectObservable(command.canExecute).toBe(expectedMarble,{t: true, f: false});
    });
});

  it('canExecute returns true by default', () => {
    testScheduler.run(({ cold, expectObservable }) => {

      const expectedMarble = 't'
      var command = ReactiveCommand.createFromObservable((p) => of(true));

      expectObservable(command.canExecute).toBe(expectedMarble,{t: true, f: false});
    });
  });

  it('execute observable returns last value of source observable', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const inputMarble = 'a-b|';
      const expected =    '---(b|)';
      const input = cold(inputMarble,{a: true});
      var command = ReactiveCommand.createFromObservable((p) => input);
      const $execute = command.execute();
      expectObservable($execute).toBe(expected,{a: true});
    });
  });
    it('execute observable returns last value of source observable', () => {
      testScheduler.run(({ cold, expectObservable }) => {
        const inputMarble = '-a-b|';
        const expected =    '-a-b';
        const input = cold(inputMarble,{a: true});
        var command = <ReactiveCommand<{},{}>>ReactiveCommand.createFromObservable((p) => input);
        var c = new Subject();
        command.subscribe(c);
        command.execute().subscribe();
        expectObservable(c).toBe(expected,{a: true});
      });
  });
});
