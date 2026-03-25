# 🎭 DTO & Mapping Deep Dive: The "Mask" and the "Truth"

In a professional Java application, we never send our raw Database Entities directly to the frontend. Instead, we use **DTOs** (Data Transfer Objects).

---

## 🏛️ The Concept: Truth vs. Mask

Imagine your application is a theater:

1.  **The Truth (Entity)**: This is the actor backstage. They have a real name, a home address, a social security number, and a salary.
2.  **The Mask (DTO)**: This is the character the audience sees. They have a stage name, a costume, and only say the lines they are supposed to say.

### Why not just use the Actor?

If you let the actor go on stage as themselves:

- They might accidentally tell the audience their private home address (**Security Leak**).
- If the actor gets sick and you replace them, the audience might notice the difference (**Tight Coupling**).
- The audience might see things they aren't supposed to see, like the actor's script or makeup (**Over-exposure**).

---

## 🛠️ How it works in our Project

### 1. The DTO (`UserDTO.java`)

This is a simple Java class that only contain the fields we want to show to the Angular frontend.

```java
public class UserDTO {
    public UUID id;
    public String name;
    public String email;
    public UserStatus status;
    public Set<String> authorities;

    // Auditing
    public String createdBy;
    public Instant createdDate;
    // ...
}
```

### 2. The Mapper (`UserMapper.java`)

We use a tool called **MapStruct**. It's like an automated "Makeup Artist" that copies data from the Entity (The Truth) to the DTO (The Mask).

```java
@Mapper(componentModel = "jakarta")
public interface UserMapper {
    UserDTO toDto(User user);
    User toEntity(UserDTO userDTO);
}
```

---

## 🚀 Why this makes you a "Pro"

1.  **Security**: You can have a `password` field in your database entity, but simply omit it from the DTO. It is now physically impossible to accidentally send the hashed password to the browser.
2.  **Version Safety**: You can change your database column names (The Truth) without breaking the Angular frontend (The Mask), as long as the Mapper still works.
3.  **Performance**: You can send a "Lightweight" version of an object for lists, and a "Heavyweight" version for details, saving bandwidth.
