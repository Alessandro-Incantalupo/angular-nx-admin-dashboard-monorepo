# 📐 ArchUnit Deep Dive: Architecture as Code

**ArchUnit** is a library for checking the architecture of your Java code using any standard Java unit test tool. In our project, it ensures that our structural rules are enforced automatically.

---

## 🏗️ Why ArchUnit?

In most projects, architecture only exists in a PDF or a Senior Developer's head. As the team grows, someone eventually "takes a shortcut" and calls a database class directly from a web controller.

Without ArchUnit, you only find this months later when the code is a "Big Ball of Mud." **With ArchUnit, the build fails the moment you break the rule.**

### ⚖️ Pattern Comparison

| Feature         | Manual Review (Old Way)         | ArchUnit (Our Way)          |
| :-------------- | :------------------------------ | :-------------------------- |
| **Enforcement** | Hope/PR Reviews                 | Automatic (The build fails) |
| **Speed**       | Cycles of feedback (Hours/Days) | Instant (Seconds)           |
| **Consistency** | Human subjectivity              | Strict programmatic logic   |
| **Maintenance** | Knowledge leaks over time       | Rule is documented in code  |

---

## 🛠️ How it works in our Project

Our rules are defined in `ArchTest.java`. Here is a breakdown of our core rule:

```java
noClasses()
    .that().resideInAnyPackage("com.admindashboard.service..")
    .or().resideInAnyPackage("com.admindashboard.domain..")
    .should().dependOnClassesThat().resideInAnyPackage("com.admindashboard.web..")
    .because("Services and domain entities should not depend on web layer")
    .check(importedClasses);
```

### What this prevents:

1. **Circular Dependencies**: You cannot have a Service that depends on a Controller which depends on the same Service.
2. **Leaky Abstractions**: Your business logic (`service`) is pure Java. It doesn't know anything about HTTP, REST, or URLs.
3. **Database Safety**: Domain entities shouldn't care about web-specific validation or mapping.

---

## 🚀 Pro-Tip for Beginners

If you see an `ArchitectureViolationException` during `./gradlew check`:

1. **Don't suppress the test!**
2. **Check your imports**: You likely imported something from a `com.admindashboard.web` package into a Service or Entity.
3. **Refactor**: Move the logic that needs that web-specific info into a Mapper or the Controller itself.
