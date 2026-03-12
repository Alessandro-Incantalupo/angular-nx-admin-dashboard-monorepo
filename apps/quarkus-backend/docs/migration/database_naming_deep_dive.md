# 🗄️ Database Naming Strategy: Java vs. SQL

In a professional project, we want our database to look clean and follow standard SQL conventions (`snake_case`), even if our Java code uses standard `camelCase`.

---

## 🏛️ The Problem: "The Case Clash"

Java and Databases speak two different "languages" when it comes to naming:

| Context                     | Style        | Example                         |
| :-------------------------- | :----------- | :------------------------------ |
| **Java** (Entity)           | `camelCase`  | `userAddress`, `LoginHistory`   |
| **Database** (Table/Column) | `snake_case` | `user_address`, `login_history` |

### Without a Strategy (The "Default" way)

If you don't use a naming strategy, Hibernate might create tables that look like this:

- `SELECT * FROM UserAddress;` (Mixed case is a pain in Postgres!)
- `SELECT UserID FROM USER;` (Inconsistent and hard to read for DBAs.)

---

## ✅ The Solution: JHipster Naming Strategies

We've implemented two custom strategies in your project:

1. `JHipsterCompatiblePhysicalNamingStrategy.java`
2. `JHipsterCompatibleImplicitNamingStrategy.java`

### 1. Physical Strategy (Field -> Column)

This captures every variable name and turns it into professional SQL.

**Java Code:**

```java
@Entity
public class UserRegistration {
    @Id
    public Long id;

    public String emailAddress; // camelCase
    public String oauthToken;   // camelCase
}
```

**Resulting SQL Table:**

```sql
CREATE TABLE user_registration ( -- Automatic snake_case
    id BIGINT,
    email_address VARCHAR(255), -- Automatic snake_case
    oauth_token VARCHAR(255)    -- Automatic snake_case
);
```

### 2. Implicit Strategy (The "Smart" Bridge)

This handles names that aren't explicitly typed out, like Join Tables for many-to-many relationships.

**Scenario**: A `User` has many `Authorities`.

- **Default name**: `User_Authority` (Ugly mix)
- **JHipster name**: `user_authority` (Clean, lower-case, snake_case)

---

## 🚀 Why this matters for you

1. **Developer Experience**: You can write standard Java code without worrying about how it looks in the database.
2. **Postgres Compatibility**: Postgres treated quoted mixed-case names (like `"userAddress"`) as case-sensitive. By using `snake_case`, you avoid countless SQL syntax errors.
3. **Collaboration**: If a database expert looks at your tables, they will see a professional structure that follows industry standards.

---

## 🛠️ How it's configured

In `application.properties`, we point Hibernate to these custom classes:

```properties
quarkus.hibernate-orm.physical-naming-strategy=com.admindashboard.config.hibernate.JHipsterCompatiblePhysicalNamingStrategy
quarkus.hibernate-orm.implicit-naming-strategy=com.admindashboard.config.hibernate.JHipsterCompatibleImplicitNamingStrategy
```
