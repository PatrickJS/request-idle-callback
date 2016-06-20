import { NgZone, Injectable } from '@angular/core';
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
    ((<any>window).requestIdleCallback || this.polyfillRequestIdleCallback)(callback);
  }

  cancelIdleCallback(handler) {
    ((<any>window).cancelIdleCallback || this.polyfillCancelIdleCallback)(handler);
  }

  polyfillCancelIdleCallback(handler) {
    let {
      unsubscribe,
      timerId
    }: any = this.idleHandlers.get(handler);

    if (unsubscribe) {
      unsubscribe();
    }
    if (timerId) {
      this.ngZone.runOutsideAngular(() => {
        clearTimeout(timerId);
      });
    }
    this.idleHandlers.delete(handler);
  }

  polyfillRequestIdleCallback(callback: IdleCallback, {timeout}: IdleOptions = {timeout: 50}) {
    let dispose = undefined;
    this.ngZone.runOutsideAngular(() => {
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
            },
            null,
            () => this.polyfillCancelIdleCallback(callback)
          );
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
