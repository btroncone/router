/**
 * Guards are simple services that can protect routes from being traversed. They
 * are implemented using traversal middleware
 *
 * A guard is called when the router begins traversing a route configuration file.
 * It returns `true` or `false` to let the router know if it should consider
 * the route a candidate. Using guards, you can auth protect routes, run data
 * fetching, etc.
 *
 * A limitation of guards is that they are instantiated with the _root_ Injector.
 * For more powerful injection, consider looking at render middleware
 */
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/every';
import { Observable } from 'rxjs/Observable';
import { provide, Provider, OpaqueToken, Injector } from 'angular2/core';

import { createFactoryProvider } from './util';
import { Route } from './route';
import { useTraversalMiddleware } from './match-route';
import { createMiddleware } from './middleware';

export interface Guard {
  (route: Route): Observable<boolean>;
}

export const createGuard = createFactoryProvider<Guard>('@ngrx/router Guard');

export const guardMiddleware = createMiddleware(function(injector: Injector) {
  return (route$: Observable<Route>) => route$
    .mergeMap(route => {
      if( !!route.guards && Array.isArray(route.guards) && route.guards.length > 0 ) {
        const resolved: Guard[] = route.guards
          .map(provider => injector.resolveAndInstantiate(provider));

        return Observable.merge<boolean>(...resolved.map(guard => guard(route)))
          .every(value => !!value);
      }

      return Observable.of(true);
    });
}, [ Injector ]);

export const GUARD_PROVIDERS = [
  useTraversalMiddleware(guardMiddleware)
];
