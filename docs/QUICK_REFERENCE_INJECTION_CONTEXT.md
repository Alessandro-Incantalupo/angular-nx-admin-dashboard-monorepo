# Angular Injection Context Quick Reference

> **TL;DR**: Only use `inject()` in class fields, constructors, or factory functions. Never in lifecycle hooks or callbacks!

## ✅ Valid Injection Contexts

| Location | Example |
|----------|---------|
| **Class Fields** | `private service = inject(MyService)` |
| **Constructor** | `constructor() { this.service = inject(MyService) }` |
| **Factory Functions** | `factory: () => inject(HttpClient)` |
| **Functional Guards** | `export const guard: CanActivateFn = () => inject(Service)` |
| **Functional Interceptors** | `export const interceptor: HttpInterceptorFn = () => inject(Service)` |
| **Signal Store** | `withMethods((state, service = inject(MyService)) => ...)` |

## ❌ Invalid Injection Contexts

| Location | Why It Fails |
|----------|-------------|
| **Lifecycle Hooks** | `ngOnInit() { inject(Service) }` - Too late! |
| **Event Handlers** | `onClick() { inject(Service) }` - Not during construction |
| **Async Callbacks** | `setTimeout(() => inject(Service))` - Lost context |
| **Regular Functions** | `function helper() { inject(Service) }` - No injector available |

## Common Error & Fix

### Error:
```
❌ NullInjectorError: inject() must be called from an injection context
```

### Most Common Fix:
```typescript
// ❌ Wrong - in lifecycle hook
ngOnInit() {
  const service = inject(MyService);
}

// ✅ Correct - in class field
private readonly service = inject(MyService);
```

## Best Practices

1. **Inject Early, Use Later** - Always inject in class fields
2. **Use `readonly`** - Prevent accidental reassignment
3. **Prefer `inject()` over constructor injection** - More modern and flexible
4. **Document dependencies** - Add comments explaining why each service is injected

## Full Documentation

See [ANGULAR_INJECTION_CONTEXT.md](./ANGULAR_INJECTION_CONTEXT.md) for complete details, examples, and debugging tips.
