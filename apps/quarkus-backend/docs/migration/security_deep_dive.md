# 🔐 Security Scaffolding Deep Dive: JWT & RBAC

Security is no longer a checklist; it's a foundation. We've moved from simple "login" to a stateless **JWT (JSON Web Token)** system with **RBAC (Role-Based Access Control)**.

---

## 🎟️ 1. What is a JWT?

Think of a JWT as a **Digital Wristband** for a music festival:

1.  **Login**: You show your ID (Username/Password).
2.  **Bracelet**: The security guard gives you a wristband (The JWT).
3.  **Access**: As long as you have the wristband, you can enter different stages (API routes). You don't have to show your ID every single time.

### Why is this better?

- **Stateless**: The server doesn't have to "remember" you. It just looks at your wristband and knows it's real because of the **Signature**.
- **Scalable**: If we have 10 servers, all of them can verify your wristband without talking to each other.

---

## 🎖️ 2. Role-Based Access Control (RBAC)

Not everyone with a wristband has the same access. This is where **Authorities** come in.

### `AuthoritiesConstants.java`

We created this file to avoid "Magic Strings" in our code. Instead of typing `"ROLE_ADMIN"` everywhere, we use the constant:

```java
public final class AuthoritiesConstants {
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String USER = "ROLE_USER";
    public static final String ANONYMOUS = "ROLE_ANONYMOUS";
}
```

### Applying Roles

In your code, you now protect methods with simple labels:

```java
@GET
@RolesAllowed(AuthoritiesConstants.ADMIN)
public List<UserDTO> getAllUsers() {
    // Only users with the ADMIN bracelet logic get here!
}
```

---

## 🔑 3. The Public Key (`publicKey.pem`)

This is the most critical file for security. It is essentially our "Forgery Detector."

- When a user sends a token, the server uses this public key to check if the token was actually issued by us.
- If the token was altered by even one character, the "Siganture" won't match, and the app will reject the request.

---

## 🏛️ 3. RBAC vs. 3rd Party Auth (Keycloak)

A common question is: "If I use Keycloak or Auth0, do I still need RBAC code in my backend?"

**The answer is YES.** Here is the split of responsibilities (The Delegation of Duty):

### 🔑 The Identity Provider (Keycloak / Auth0 / Okta)

- **Role**: The "DMV" or "Passport Office".
- **Responsibility**: Authenticating the user. It checks their password, MFA, or Biometrics.
- **Output**: It generates the **JWT**. Inside that JWT, it adds a "Claim" (a field) called `groups` or `roles` that says `["admin", "editor"]`.

### 🛡️ The Backend (Our Quarkus App)

- **Role**: The "Security Guard" at the VIP door.
- **Responsibility**: **Authorization** (RBAC).
- **The Process**:
  1. Our app receives the JWT from Keycloak.
  2. It checks the signature (using the `publicKey.pem`) to make sure Keycloak really signed it.
  3. It looks at the `groups` list inside the token.
  4. If the code says `@RolesAllowed("ADMIN")`, and the token says `"admin"`, the door opens.

---

## 🚀 Why this makes you a "Pro"

1.  **Separation of Concerns**: Keycloak handles the complex stuff (Reset Password, MFA, Social Login), and your code stays clean, focusing only on "Who can do what."
2.  **No Vendor Lock-in**: If you switch from Keycloak to Auth0 tomorrow, your code doesn't change! You just change the Public Key and the Issuer URL in `application.properties`.
3.  **Security at Scale**: Thousands of users can be managed in Keycloak, but your code remains a simple `@RolesAllowed` label.
