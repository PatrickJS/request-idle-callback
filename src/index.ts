import { NgZone, Injectable, ApplicationRef, APP_INITIALIZER, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { async } from 'rxjs/scheduler/async';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/observeOn';

// requestIdleCallback polyfill
export type Deadline     = {didTimeout: boolean, timeRemaining: () => number};
export type IdleCallback = (deadline: Deadline) => void;
export type IdleOptions  = {timeout: number};

@Injectable()
export class Idle {
  idleHandlers = new Map();
  stableObservable$;
  constructor(public ngZone: NgZone) {
    this.stableObservable$ = this.ngZone
      .onStable
      .observeOn(async)
      .publish()
      .refCount();
  }
  requestIdleCallback(callback) {
    if ('requestIdleCallback' in window) {
      window['requestIdleCallback'](callback);
    } else {
      this.polyfillRequestIdleCallback(callback);
    }
  }

  cancelIdleCallback(handler) {
    if ('cancelIdleCallback' in window) {
      window['cancelIdleCallback'](handler);
    } else {
      this.polyfillCancelIdleCallback(handler);
    }
  }

  polyfillCancelIdleCallback(handler) {
    let {unsubscribe, timerId}: any = this.idleHandlers.get(handler);

    if (unsubscribe) {
      unsubscribe();
    }
    if (timerId) {
      this.ngZone.runOutsideAngular(function() {
        clearTimeout(timerId);
      });
    }

    this.idleHandlers.delete(handler);
  }

  polyfillRequestIdleCallback(callback: IdleCallback, {timeout}: IdleOptions = {timeout: 50}) {
    let dispose = undefined;
    // compiling problem
    const _self = this;
    _self.ngZone.runOutsideAngular(() => {
      function cb(): void {
        const start: number = Date.now();
        const deadline: Deadline = {
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        };

        setTimeout(() => {
          deadline.didTimeout = true;
          if (dispose) {
            dispose.unsubscribe();
          }
        }, timeout || 50);

        callback(deadline);
      }

      if (this.ngZone.isStable) {
        let timerId = setTimeout(cb, 10);
        this.idleHandlers.set(callback, {
          timerId
        });
      } else {
        dispose = this.stableObservable$
          .debounceTime(10)
          .take(1)
          .subscribe(
            () => {
              let timerId = setTimeout(cb, 10);
              this.idleHandlers.set(callback, {
                unsubscribe: dispose.unsubscribe,
                timerId
              });
            });
        this.idleHandlers.set(callback, {
          unsubscribe: dispose.unsubscribe
        });
      }

    });

  }
}

export const ANGULARCLASS_IDLE_PROVIDERS = [
  Idle
];

export function setupPrefetchInitializer(injector: Injector, callbacks?: Array<Function>) {
  if (!callbacks || !callbacks.length) {
    return;
  }
  // https://github.com/angular/angular/issues/9101
  // Delay to avoid circular dependency
  setTimeout(() => {
    const appRef = injector.get(ApplicationRef);
    if (appRef.componentTypes.length === 0) {
      appRef.registerBootstrapListener(() => {
        let idle = injector.get(Idle);
        callbacks.forEach((cb) => idle.requestIdleCallback(cb));
      });
    } else {
      let idle = injector.get(Idle);
      callbacks.forEach((cb) => idle.requestIdleCallback(cb));
    }
  }, 0);
  return (): any => null;
}

export function providePrefetchIdleCallbacks(prefetchCallbacks = []) {
  return [
    ...ANGULARCLASS_IDLE_PROVIDERS,
    // Trigger initial navigation
    { provide: APP_INITIALIZER, multi: true, useFactory: (injector) => {
      return setupPrefetchInitializer(injector, prefetchCallbacks);
    }, deps: [Injector] }
  ];
}
