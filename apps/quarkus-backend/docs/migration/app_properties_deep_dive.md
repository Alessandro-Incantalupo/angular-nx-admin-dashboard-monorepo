# ⚙️ Application Properties & Hibernate Deep Dive

The `application.properties` file in `src/main/resources` is the **Main Control Panel** of your Quarkus application. It tells the app how to connect to the database, how to handle security, and how to name things.

---

## 🌓 1. Environments (Profiles)

In a professional project, you don't use the same settings for coding on your laptop (`%dev`) and running in the real world (`%prod`).

```properties
# Default settings (Fall-back)
quarkus.http.port=8080

# Development specific (Local coding)
%dev.quarkus.http.port=8081
%dev.quarkus.hibernate-orm.log.sql=true
```

- **The `%` symbol**: This tells Quarkus "Only use this if we are in this specific mode."
- **Why it matters**: You can have SQL logging turned on while you're debugging, but it stays silent in production to keep things fast and private.

---

## 🏛️ 2. Hibernate & Naming Strategies

We have decoupled how your Java entities are named from how the Database tables are structured.

- **The Goal**: Keep Java `camelCase` but use professional `snake_case` in SQL.
- **The Config**: Controlled by `quarkus.hibernate-orm.physical-naming-strategy`.
- **🚀 Deep Dive**: For full examples of how your Java code turns into SQL tables, check out the [Database Naming Deep Dive](./database_naming_deep_dive.md).

---

## 🗃️ 3. Datasource & Dev Services

Quarkus has a "Magic" feature called **Dev Services**.

- **How it works**: If you don't tell Quarkus where your database is, it will automatically start a Docker container (like Postgres) for you while you code.
- **Our Config**:
  ```properties
  quarkus.datasource.db-kind=postgresql
  quarkus.datasource.devservices.image-name=postgres:17.2
  ```
- **The Benefit**: You don't need to install Postgres on your computer. Just run the app, and the database "just appears."

---

## 🔐 4. SmallRye JWT Security

We configured how the app verifies users:

```properties
quarkus.smallrye-jwt.enabled=true
mp.jwt.verify.publickey.location=/META-INF/resources/publicKey.pem
mp.jwt.verify.issuer=https://www.jhipster.tech
```

- **Public Key**: This is the "ID Check." The app uses this file to verify that the token the user gives us is authentic and hasn't been forged.
