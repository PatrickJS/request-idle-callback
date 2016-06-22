# Request Idle Callback
requestIdleCallback for Angular 2 used for Progressive Web App

### Why should I use requestIdleCallback?
Scheduling non-essential work yourself is very difficult to do. It’s impossible to figure out exactly how much frame time remains because after `requestAnimationFrame` callbacks execute there are style calculations, layout, paint, and other browser internals that need to run. A home-rolled solution can’t account for any of those. In order to be sure that a user isn’t interacting in some way you would also need to attach listeners to every kind of interaction event `(scroll, touch, click)`, even if you don’t need them for functionality, just so that you can be absolutely sure that the user isn’t interacting. The browser, on the other hand, knows exactly how much time is available at the end of the frame, and if the user is interacting, and so through `requestIdleCallback` we gain an API that allows us to make use of any spare time in the most efficient way possible.

## links
* [Using requestIdleCallback](https://developers.google.com/web/updates/2015/08/using-requestidlecallback)
* [Cooperative Scheduling of Background Tasks](https://www.w3.org/TR/requestidlecallback/)


```typescript
bootstrap(App, [
  ...ANGULARCLASS_IDLE_PROVIDERS  
]);
```

```typescript
import { Idle } from '@angularclass/request-idle-callback';
class App {
  constructor(idle: Idle) {

    idle.requestIdleCallback(() => {
      prefetchComponent() // your api
    });

  }  
}

```


prefetch data/async route after bootstrap via `providePrefetchIdleCallbacks`
```typescript
import { providePrefetchIdleCallbacks } from '@angularclass/request-idle-callback';

function callbackToPrefetch() {
}

var arrayOfCallbacks = [
  callbackToPrefetch
]

bootstrap(App, [
  providePrefetchIdleCallbacks(arrayOfCallbacks) // includes ANGULARCLASS_IDLE_PROVIDERS
]);
```
