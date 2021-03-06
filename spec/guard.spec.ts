import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable'
import { Injector } from 'angular2/core';

import { Route } from '../lib/route';
import { Middleware } from '../lib/middleware';
import { Guard, createGuard, guardMiddleware } from '../lib/guard';


describe('Guard Middleware', function() {
  let guardRunner: Middleware;
  let injector: Injector;

  function route(route: Route) {
    return Observable.of(route);
  }

  beforeEach(function() {
    injector = Injector.resolveAndCreate([]);
    guardRunner = injector.resolveAndInstantiate(guardMiddleware);
  });

  it('should always return true for routes with no gaurds', function(done) {
    route({ })
      .let(guardRunner)
      .subscribe(value => {
        expect(value).toBe(true);

        done();
      });
  });

  it('should return true for routes with an empty guard array', function(done) {
    route({ guards: [] })
      .let(guardRunner)
      .subscribe(value => {
        expect(value).toBe(true);

        done();
      });
  });

  it('should resolve all guards in the context of the injector', function() {
    spyOn(injector, 'resolveAndInstantiate').and.callThrough();
    const guard = createGuard(() => () => Observable.of(true));

    route({ guards: [ guard ] }).let(guardRunner).subscribe();

    expect(injector.resolveAndInstantiate).toHaveBeenCalledWith(guard);
  });

  it('should provide guards with the route it has matched', function() {
    const testGuard = { run: () => Observable.of(true) };
    spyOn(testGuard, 'run').and.callThrough();
    const guard = createGuard(() => testGuard.run);
    const nextRoute = { guards: [ guard ] };

    route(nextRoute).let(guardRunner).subscribe();

    expect(testGuard.run).toHaveBeenCalledWith(nextRoute);
  });

  it('should return true if all of the guards return true', function(done) {
    const pass = createGuard(() => () => Observable.of(true));

    route({ guards: [ pass ] })
      .let(guardRunner)
      .subscribe(value => {
        expect(value).toBe(true);

        done();
      });
  });

  it('should return false if just one guard returns false', function(done) {
    const pass = createGuard(() => () => Observable.of(true));
    const fail = createGuard(() => () => Observable.of(false));

    route({ guards: [ pass, fail ] })
      .let(guardRunner)
      .subscribe(value => {
        expect(value).toBe(false);

        done();
      });
  });
});
