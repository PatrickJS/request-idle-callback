# Request Idle Callback
requestIdleCallback for Angular 2



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
