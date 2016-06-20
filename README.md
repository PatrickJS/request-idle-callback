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
