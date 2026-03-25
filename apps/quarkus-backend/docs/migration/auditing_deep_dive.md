# 🕵️ Auditing & User Domain Deep Dive (Level 3)

In this phase, we've moved your "User" from a simple demo object to a professional, auditable entity that follows JHipster's high-security standards.

---

## 🏛️ 1. Why do we need Auditing?

In a production application, you can't just change data without leaving a "Paper Trail." If a user's role is upgraded to `ADMIN`, you need to know:

- **Who** authorized the change? (`lastModifiedBy`)
- **When** did it happen? (`lastModifiedDate`)
- **When** was this user first created? (`createdDate`)

This is essential for security audits, debugging, and general accountability.

---

## 🛠️ 2. The Professional Implementation

Instead of manually setting dates every time you save a user, we use **JPA Lifecycle Callbacks**.

### 🧩 The Entity Hooks (`User.java`)

We use `@PrePersist` and `@PreUpdate` annotations. Think of these as "Event Listeners" that trigger automatically right before your data hits the database.

```java
@PrePersist
public void prePersist() {
    this.createdDate = Instant.now();
    this.lastModifiedDate = this.createdDate;
}

@PreUpdate
public void preUpdate() {
    this.lastModifiedDate = Instant.now();
}
```

- **`created_by`**: Currently set via the Service layer during creation.
- **`created_date`**: Automatically set once, never changes.
- **`last_modified_date`**: Automatically updates every time the user record is modified.

---

## 🎭 3. Authority vs. Role Enum

We've evolved the security system from a simple `Role` enum to a dedicated `Authority` entity.

### The Old Way (Enum):

```java
public enum Role { ADMIN, USER }
```

- **Problem**: Adding a new role requires changing code, re-compiling, and re-deploying the entire app.

### The Pro Way (Entity):

```java
@Entity
public class Authority extends PanacheEntityBase {
    @Id
    public String name;
}
```

- **Benefit**: You can add a `ROLE_MANAGER` or `ROLE_SUPPORT` directly in the database (via Liquibase or SQL).
- **Flexibility**: A user can now have **multiple** authorities (Many-to-Many), allowing for granular permissions.

---

## 🚀 4. Business Logic Layer (`UserService`)

We've introduced a **Service Layer**. This is the "Brain" of your operations.

### Enforcing Rules

Before a user is saved, the service now checks for:

1. **Unique Email**: Throws `EmailAlreadyUsedException` (RFC 7807).
2. **Unique Name**: Throws `LoginAlreadyUsedException`.

This ensures that your database remains "Clean" and your API remains "Helpful" to the frontend.

---

> [!TIP]
> **Learning Path**: As you move toward **Phase 4: JWT Security**, this `Authority` system will be the backbone that decides which buttons a user can see in your Angular dashboard!
