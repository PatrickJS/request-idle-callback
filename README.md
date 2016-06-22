# Request Idle Callback
requestIdleCallback for Angular 2 used for Progressive Web App

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
