import { TestBed, inject } from '@angular/core/testing';

import { ReactiveCommand } from './reactive-command.service';
import { Observable } from 'rxjs/internal/Observable';
import { observable } from 'rxjs';

describe('ReactiveCommandService', () => {
  beforeEach(() => {

  });

  it('should be created', async () => {
    var canExecute = Observable.from([true]);
    var command = ReactiveCommand.createFromObservable(obs, canExecute);
    var command1 = ReactiveCommand.createFromPromise(prom, canExecute);
    var command2 = ReactiveCommand.create(canExecute);

    var obser = command.execute();

    
    command1.subscribe(p => console.log(p));

    await command1.executeAsync();


    command.execute();
  });


  function obs(param: string) : Observable<number> {
    return Observable.empty();
  }

  function prom() : Promise<number> {
    return new Promise(() => 1);
  }
});
