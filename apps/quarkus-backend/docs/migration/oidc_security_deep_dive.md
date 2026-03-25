# Deep Dive: Modern Authentication (OIDC & OAuth2)

When we move away from "Manual Passwords" (hashing in our own database), we enter the world of **Delegated Identity**. Here is the panoramic view of how the modern world handles security.

---

## 🏗️ 1. Core Terminology

| Term                        | Analogy             | Description                                                                                                 |
| :-------------------------- | :------------------ | :---------------------------------------------------------------------------------------------------------- |
| **AuthN (Authentication)**  | The ID Card         | Proving **WHO** you are. (Login/Password/Biometrics).                                                       |
| **AuthZ (Authorization)**   | The Keycard         | Permissions. **WHAT** can you do? (Roles like `ROLE_ADMIN`).                                                |
| **IdP (Identity Provider)** | The Passport Office | The central authority that stores users and issues "Passports" (Tokens). Examples: Keycloak, Auth0, Google. |
| **Resource Server**         | The VIP Lounge      | Your **Quarkus Backend**. It doesn't ask for IDs; it just checks if the "Passport" it's shown is valid.     |
| **Client**                  | The Traveler        | Your **Angular Frontend**. It asks the IdP for a token and then shows it to the backend.                    |

---

## 🔑 2. The Standard: OIDC (OpenID Connect) vs. OAuth 2.0

OIDC is a layer on top of OAuth 2.0. Think of it as the "Universal Language" for identity.

### What is OAuth 2.0? (The Foundation)

OAuth 2.0 is purely about **Authorization** (Access). It allows a "Client" (your app) to get limited access to a user's data on a "Resource Server" (like a database or an API), without the app ever seeing the user's password.

**The Actors in OAuth 2.0:**

1.  **Resource Owner**: The User (You).
2.  **Client**: Your Angular App.
3.  **Authorization Server**: The IdP (Keycloak).
4.  **Resource Server**: Your Quarkus API.

**The Core Result**: An **Access Token**. This is like a "Keycard" that opens specific doors. It doesn't necessarily say _who_ you are, just that you're allowed in.

### What is OIDC? (The Identity Layer)

OIDC adds **Authentication** to OAuth 2.0. It introduces the **ID Token**.

- **OAuth 2.0** says: "Here is a key that lets you enter the building."
- **OIDC** says: "Here is a key, and by the way, this is the name and email of the person using it."

| Feature          | OAuth 2.0              | OIDC                      |
| :--------------- | :--------------------- | :------------------------ |
| **Primary Goal** | Authorization (Access) | Authentication (Identity) |
| **Main Token**   | Access Token           | ID Token                  |
| **Analogy**      | A key for a car        | A driver's license        |

### How the login flow works (Redirect Method):

1.  User clicks "Login" in Angular.
2.  Angular redirects the browser to the **IdP** (e.g., Keycloak).
3.  User logs in on the IdP's safe page.
4.  IdP sends the user back to Angular with a "Code."
5.  Angular swaps that code for a **JWT (JSON Web Token)**.

---

## 📜 3. What is a JWT?

A JWT is a digitally signed ticket. It contains "Claims":

- `sub`: The unique ID of the user.
- `roles`: What they can do.
- `exp`: When the ticket expires.

Because it is **signed** by the IdP, your Quarkus backend can verify it without ever talking to the IdP. It just checks the signature.

---

## 🏢 4. Why Keycloak vs. Others?

| Provider                   | Pros                                                              | Cons                                                                      |
| :------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **Keycloak** (Open Source) | Free, full control, can run in Docker, high parity with JHipster. | You have to manage the server/database.                                   |
| **Auth0 / Okta** (SaaS)    | Zero server management, incredibly easy setup.                    | Can get expensive at scale, sensitive data lives on their servers.        |
| **Firebase Auth**          | Simple for mobile/web.                                            | Harder to integrate with standard Java backend security compared to OIDC. |

---

## 🎨 5. Can we have a Custom UI?

**Yes.** You have two main paths:

### Path A: Thematic Customization (Recommended)

You customize the login pages **on the Identity Provider side**.

- **Keycloak**: You can upload a "Theme" (HTML/CSS/JS) that looks exactly like your Angular app.
- **Why?**: The browser never sees the user's password; it's safest.

### Path B: Embedded / Headless API

You build the login form **directly in Angular**.

- You send the username/password to your backend, which then talks to the IdP's API.
- **Problem**: This is technically "Less Secure" (it breaks some browser-level guards) and makes things like "Login with Google" very hard to implement manually.

---

## 🚀 Recommendation for this Project

Since you are in a learning/development phase using an NX Monorepo:

1.  **Use Keycloak in Docker**: It keeps everything local and "free."
2.  **Start with "Standard Redirect"**: Get the security foundations solid.
3.  **Theme the UI**: Later, we can make the Keycloak login screen look exactly like your dashboard.
