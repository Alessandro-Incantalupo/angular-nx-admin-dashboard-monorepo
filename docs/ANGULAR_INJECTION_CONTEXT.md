# Angular Injection Context: A Comprehensive Guide

## Table of Contents
1. [What is Injection Context?](#what-is-injection-context)
2. [Why Does Injection Context Exist?](#why-does-injection-context-exist)
3. [How Injection Context Works](#how-injection-context-works)
4. [Common Errors and Solutions](#common-errors-and-solutions)
5. [Valid Injection Context Locations](#valid-injection-context-locations)
6. [Best Practices](#best-practices)
7. [Real-World Examples from This Codebase](#real-world-examples-from-this-codebase)

---

## What is Injection Context?

**Injection Context** is Angular's system for determining *where* and *when* dependency injection can occur. The `inject()` function can only be called within specific "injection contexts" where Angular knows how to resolve dependencies.

Think of it as Angular saying: *"I can only provide dependencies when I'm in the middle of constructing components, services, or other injectable items."*

### The `inject()` Function

```typescript
import { inject } from '@angular/core';

// Modern way to inject dependencies (Angular 14+)
const myService = inject(MyService);
```

This replaces the older constructor-based injection:

```typescript
// Old way (still valid but more verbose)
constructor(private myService: MyService) {}
```

---

## Why Does Injection Context Exist?

Angular's dependency injection system needs to know:
1. **What injector to use** - Which set of providers is available?
2. **What component/service is requesting** - For debugging and dependency graphs
3. **When to create instances** - Singleton vs. per-component instances

Without injection context, Angular cannot safely determine which dependencies to provide or how to manage their lifecycle.

### Key Reasons:
- **Safety**: Prevents dependencies from being requested at runtime when providers aren't available
- **Performance**: Ensures dependency resolution happens during the construction phase
- **Clarity**: Makes dependency relationships explicit and traceable
- **Lifecycle Management**: Ties dependency creation to component/service lifecycle

---

## How Injection Context Works

Angular maintains an **injection context** during specific lifecycle phases:

```typescript
// Angular's internal pseudo-code
class AngularInjectionContext {
  private currentInjector: Injector | null = null;
  
  setContext(injector: Injector) {
    this.currentInjector = injector;
  }
  
  clearContext() {
    this.currentInjector = null;
  }
  
  inject<T>(token: Type<T>): T {
    if (!this.currentInjector) {
      throw new Error('inject() must be called from an injection context');
    }
    return this.currentInjector.get(token);
  }
}
```

**When Angular creates a component:**
1. Sets the injection context (activates the injector)
2. Calls your component's constructor
3. Initializes class properties (where you can use `inject()`)
4. Clears the injection context
5. Continues with component lifecycle hooks

---

## Common Errors and Solutions

### Error 1: `inject() must be called from an injection context`

**What it means:** You're trying to inject a dependency outside of where Angular allows it.

```typescript
❌ WRONG - Called outside injection context
@Component({...})
export class MyComponent {
  myService: MyService;
  
  ngOnInit() {
    // ERROR: ngOnInit is NOT an injection context
    this.myService = inject(MyService);
  }
}
```

```typescript
✅ CORRECT - Called in class field initializer
@Component({...})
export class MyComponent {
  // This runs during construction - valid injection context
  private readonly myService = inject(MyService);
  
  ngOnInit() {
    // Now you can use this.myService
    this.myService.doSomething();
  }
}
```

### Error 2: Using `inject()` in Async Callbacks

```typescript
❌ WRONG - Called in async callback
@Component({...})
export class MyComponent {
  loadData() {
    setTimeout(() => {
      // ERROR: Async callbacks lose injection context
      const service = inject(MyService);
    }, 1000);
  }
}
```

```typescript
✅ CORRECT - Inject early, use later
@Component({...})
export class MyComponent {
  private readonly myService = inject(MyService);
  
  loadData() {
    setTimeout(() => {
      // Use the already-injected service
      this.myService.doSomething();
    }, 1000);
  }
}
```

### Error 3: Conditional Injection

```typescript
❌ WRONG - Conditional injection
@Component({...})
export class MyComponent {
  constructor() {
    if (someCondition) {
      // ERROR: Conditional injection not allowed
      const service = inject(MyService);
    }
  }
}
```

```typescript
✅ CORRECT - Use optional injection or runInInjectionContext
@Component({...})
export class MyComponent {
  // Option 1: Always inject, conditionally use
  private readonly myService = inject(MyService);
  
  someMethod() {
    if (someCondition) {
      this.myService.doSomething();
    }
  }
  
  // Option 2: Use optional injection
  private readonly optionalService = inject(MyService, { optional: true });
}
```

### Error 4: Injecting in Regular Functions

```typescript
❌ WRONG - Regular function outside injection context
function helperFunction() {
  // ERROR: Regular functions don't have injection context
  const service = inject(MyService);
  return service.getData();
}
```

```typescript
✅ CORRECT - Pass injector or use runInInjectionContext
import { inject, Injector, runInInjectionContext } from '@angular/core';

@Component({...})
export class MyComponent {
  private injector = inject(Injector);
  
  someMethod() {
    // Run function with injection context
    runInInjectionContext(this.injector, () => {
      const service = inject(MyService);
      service.doSomething();
    });
  }
}

// Or pass dependencies as parameters
function helperFunction(service: MyService) {
  return service.getData();
}
```

---

## Valid Injection Context Locations

### ✅ **1. Component/Directive Class Fields**

```typescript
@Component({...})
export class MyComponent {
  // ✅ Valid - runs during construction
  private readonly userService = inject(UserService);
  readonly router = inject(Router);
  
  // ✅ Valid - computed signals using injected services
  currentUser = computed(() => this.userService.getCurrentUser());
}
```

### ✅ **2. Constructor Body**

```typescript
@Component({...})
export class MyComponent {
  private myService: MyService;
  
  constructor() {
    // ✅ Valid - inside constructor
    this.myService = inject(MyService);
  }
}
```

### ✅ **3. Injectable Service Class Fields**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  // ✅ Valid - runs during service construction
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
}
```

### ✅ **4. Factory Functions with `inject()`**

```typescript
// ✅ Valid - provide factory runs in injection context
export const MY_CONFIG = new InjectionToken<Config>('config', {
  factory: () => {
    const http = inject(HttpClient);
    return { apiUrl: 'https://api.example.com' };
  }
});
```

### ✅ **5. Route Guards and Resolvers (Functional)**

```typescript
// ✅ Valid - functional guards run in injection context
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};
```

### ✅ **6. HTTP Interceptors (Functional)**

```typescript
// ✅ Valid - functional interceptors run in injection context
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  
  return next(cloned);
};
```

### ✅ **7. Signal Store Methods**

```typescript
export const UserStore = signalStore(
  withState({ users: [] }),
  withMethods((state) => {
    // ✅ Valid - withMethods runs in injection context
    const userService = inject(UserService);
    
    return {
      loadUsers: rxMethod<void>(
        pipe(
          switchMap(() => userService.getUsers())
        )
      )
    };
  })
);
```

### ❌ **Invalid Locations**

```typescript
@Component({...})
export class MyComponent {
  // ❌ Invalid - lifecycle hooks are NOT injection contexts
  ngOnInit() {
    const service = inject(MyService); // ERROR!
  }
  
  ngAfterViewInit() {
    const service = inject(MyService); // ERROR!
  }
  
  // ❌ Invalid - event handlers
  onClick() {
    const service = inject(MyService); // ERROR!
  }
  
  // ❌ Invalid - async callbacks
  async loadData() {
    await somePromise();
    const service = inject(MyService); // ERROR!
  }
}
```

---

## Best Practices

### 1. **Inject Early, Use Later**

Always inject dependencies during class construction, not when you need them:

```typescript
✅ GOOD
@Component({...})
export class MyComponent {
  private readonly userService = inject(UserService);
  
  loadUsers() {
    this.userService.getUsers().subscribe(...);
  }
}

❌ BAD
@Component({...})
export class MyComponent {
  loadUsers() {
    const userService = inject(UserService); // Error in most contexts!
  }
}
```

### 2. **Use `readonly` for Injected Dependencies**

```typescript
@Component({...})
export class MyComponent {
  // ✅ Prevents accidental reassignment
  private readonly userService = inject(UserService);
  readonly router = inject(Router);
}
```

### 3. **Prefer `inject()` Over Constructor Injection**

Modern Angular favors the `inject()` function:

```typescript
✅ MODERN - Cleaner, more flexible
@Component({...})
export class MyComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
}

⚠️ OLD - Still valid but verbose
@Component({...})
export class MyComponent {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}
}
```

### 4. **Use `runInInjectionContext` for Dynamic Injection**

When you need to inject dependencies outside the normal context:

```typescript
@Component({...})
export class MyComponent {
  private injector = inject(Injector);
  
  dynamicOperation() {
    runInInjectionContext(this.injector, () => {
      const service = inject(SomeService);
      service.doSomething();
    });
  }
}
```

### 5. **Handle Optional Dependencies**

```typescript
@Component({...})
export class MyComponent {
  // Won't throw if service doesn't exist
  private readonly optionalService = inject(MyService, { optional: true });
  
  ngOnInit() {
    if (this.optionalService) {
      this.optionalService.doSomething();
    }
  }
}
```

### 6. **Document Why Dependencies Are Injected**

```typescript
@Component({...})
export class UserListComponent {
  // For managing user data and operations
  private readonly userStore = inject(UserStore);
  
  // For navigation after user actions
  private readonly router = inject(Router);
  
  // For displaying success/error messages
  private readonly toastService = inject(ToastService);
}
```

---

## Real-World Examples from This Codebase

### Example 1: Service with Multiple Injections

```typescript
// apps/admin-dashboard/src/app/core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  // ✅ Valid injection context - service class field
  private readonly http = inject(HttpClient);
  private readonly createUrlRemote = injectBaseUrl();
  
  // Uses injected dependencies in methods
  login(email: string, password: string) {
    return this.http.post<{ token: string }>(
      this.createUrlRemote('/auth/login'),
      { email, password }
    );
  }
}
```

### Example 2: Signal Store with Injected Service

```typescript
// apps/admin-dashboard/src/app/features/users/state/user.store.ts
export const UsersStore = signalStore(
  withState(initialState),
  // ✅ Valid - withMethods runs in injection context
  withMethods((state, userService = inject(UsersService)) => {
    // userService is available throughout these methods
    const loadUsers = rxMethod<PaginatorState | void>(
      pipe(
        switchMap(({ page = 1, rows = 5 }) => {
          return userService.getUsersWithFilters(
            page, rows, sort?.field, sort?.order
          ).pipe(
            tapResponse({
              next: response => {
                updateState(state, 'Users: Load Success', {
                  users: response.data
                });
              },
              error: err => {
                console.error('Failed to load users', err);
              }
            })
          );
        })
      )
    );
    
    return { loadUsers };
  }),
  
  // ✅ Valid - withHooks runs in injection context
  withHooks(({ loadUsers }) => ({
    onInit: () => {
      loadUsers();
    }
  }))
);
```

### Example 3: Functional Route Guard

```typescript
// apps/admin-dashboard/src/app/core/guards/auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  // ✅ Valid - functional guards run in injection context
  const authStore = inject(AuthStore);
  const router = inject(Router);
  
  const isAuthenticated = authStore.isAuthenticated();
  
  if (!isAuthenticated) {
    return router.createUrlTree(['/login']);
  }
  
  return true;
};
```

### Example 4: HTTP Interceptor

```typescript
// apps/admin-dashboard/src/app/core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Valid - functional interceptors run in injection context
  const auth = inject(AuthService);
  const token = auth.getToken();
  
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }
  
  return next(req);
};
```

### Example 5: Component with Multiple Dependencies

```typescript
// apps/admin-dashboard/src/app/layouts/main-layout/components/header/profile-menu.component.ts
@Component({...})
export class ProfileMenuComponent {
  // ✅ All injected in class fields - valid injection context
  readonly themeStore = inject(ThemeStore);
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);
  
  // Computed values using injected stores
  readonly currentUser = computed(() => this.authStore.user());
  readonly isDarkMode = computed(() => this.themeStore.isDarkMode());
  
  // Methods using injected dependencies
  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
  
  toggleTheme() {
    this.themeStore.toggleTheme();
  }
}
```

---

## Quick Reference: Common Patterns

### Pattern 1: Service Injection in Components

```typescript
@Component({...})
export class MyComponent {
  private readonly myService = inject(MyService);
}
```

### Pattern 2: Multiple Injections

```typescript
@Component({...})
export class MyComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
}
```

### Pattern 3: Optional Injection

```typescript
@Component({...})
export class MyComponent {
  private readonly service = inject(MyService, { optional: true });
}
```

### Pattern 4: Signal Store Injection

```typescript
export const MyStore = signalStore(
  withMethods((state, service = inject(MyService)) => ({
    loadData: () => service.getData()
  }))
);
```

### Pattern 5: Functional Guard

```typescript
export const myGuard: CanActivateFn = () => {
  const service = inject(MyService);
  return service.canActivate();
};
```

---

## Debugging Tips

### When You See "inject() must be called from an injection context"

1. **Check where you're calling `inject()`**
   - Is it in a class field? ✅
   - Is it in a constructor? ✅
   - Is it in a lifecycle hook? ❌
   - Is it in a method/callback? ❌

2. **Move injection to class field**
   ```typescript
   // Change this
   ngOnInit() {
     const service = inject(MyService); // ❌
   }
   
   // To this
   private readonly service = inject(MyService); // ✅
   ```

3. **Use `runInInjectionContext` if needed**
   ```typescript
   private injector = inject(Injector);
   
   someMethod() {
     runInInjectionContext(this.injector, () => {
       const service = inject(MyService);
     });
   }
   ```

---

## Summary

**Key Takeaways:**

1. **What**: Injection context is Angular's system for controlling when/where dependencies can be injected
2. **Why**: Ensures safe, performant, and lifecycle-aware dependency injection
3. **Where**: Class fields, constructors, factory functions, functional guards/interceptors
4. **How**: Use `inject()` during construction phase, not in lifecycle hooks or callbacks
5. **Best Practice**: Inject early (class fields), use later (methods)

**Remember**: If you get an injection context error, you're probably trying to inject too late. Move your `inject()` call to a class field initializer, and you'll be fine! 🎯

---

## Further Reading

- [Angular Official Docs: Dependency Injection](https://angular.dev/guide/di)
- [Angular Official Docs: inject() function](https://angular.dev/api/core/inject)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [NgRx Signal Store](https://ngrx.io/guide/signals)
