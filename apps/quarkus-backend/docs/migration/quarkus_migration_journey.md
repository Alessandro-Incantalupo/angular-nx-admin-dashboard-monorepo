# 🚀 Quarkus Migration Journey: Java for Beginners

This document is your roadmap as you dive into your first production Java project. We're moving from a small Node.js API to a high-performance **Quarkus** backend.

---

## 🏗️ What is Quarkus? (The "Supersonic" Java)

If you've never used production Java, think of **Quarkus** as the modern, high-speed evolution of the language.

- **The "Full Stack" Experience**: Unlike standard Java which can be heavy, Quarkus is built to be "Cloud Native." It's incredibly fast to start and uses very little memory.
- **Developer Joy**: It supports "Live Coding" (like HMR in frontend). You change a file, and the server updates instantly—no manual restarts required.
- **Built-in Power**: It comes pre-packaged with everything you need for a professional API (Database connections, Security, JSON handling, and even AI integrations).

---

## 🏛️ Level 1: The Project Root (The "Infrastructure")

At the top level of `apps/quarkus-backend`, we see the "Infrastructure" that makes it a Java/Nx project.

---

### 🔍 Level 1 Deep Dive: The "Pro" Setup

Now that we've seen the basics, here is how we've upgraded the "Infrastructure" to match industry standards (as seen in the JHipster reference):

#### 📄 Level 1a: `gradle.properties` (The Version Master)

- **The Concept**: Instead of hard-coding versions inside your build scripts, we list them here.
- **The Benefit**: It's the **Single Source of Truth**. To update a tool, you change it here, and the entire app follows.

#### 📄 Level 1b: `build.gradle` (The Execution Engine)

- **The Concept**: It defines "Plugins" (The Engine) and "Dependencies" (The Tools).
- **Automation**: This is the file that tells the computer how to compile your Java code, run tests, and package the app for production.
- **🧠 Need more?**: Check out the [Build Gradle Deep Dive](./build_gradle_deep_dive.md) to understand how we manage our tools and libraries.

#### 📄 Level 1c: `application.properties` (The Runtime Control)

- **The Concept**: It uses **Profiles** (indicated by the `%` symbol).
- **Environment Awareness**:
  - **`%dev`**: Settings for "Local Coding" (Port 8081).
  - **`%prod`**: Settings for "The Real World" (Port 8080, specific security).
- **The Result**: The app "senses" its environment and adjusts its behavior automatically.
- **🧠 Need more?**: Check out the [App Properties Deep Dive](./app_properties_deep_dive.md).

#### 📄 Level 1d: `settings.gradle` (The Project Bootloader)

- **The Concept**: Runs **before** any other script. It sets up the Gradle build environment and identifies the project.

---

## 📂 Level 2: The `src` Directory Anatomy (The "Construction")

If Level 1 was the **Blueprints**, Level 2 is the **Actual House**. This is where your code lives.

### 🧩 1. `java/com/admindashboard/` (The Code)

#### 🗃️ `domain/` (The "Truth")

In Java, we call these **Entities**. They represent the **absolute reality** of your data.

- **The Core Concept**: One Java file here = One Table in your Database.
- **"The Truth"**: If you add a `String bio` field to `User.java`, the database will automatically be updated to have a "bio" column. The Java code **dictates** the database structure.

#### 🎭 `service/dto/` (The "Public Mask")

We don't send raw "Truth" (Entities) to the internet. We use **DTOs** (Data Transfer Objects).

- **The Concept**: It's a filter. You might have 20 columns in the DB, but the frontend only needs 3. The DTO defines exactly those 3.
- **Safety**: It prevents accidental leakage of private data (like passwords or internal notes).

#### 🗺️ `service/mapper/` (The "Translator")

How do you turn an Entity into a DTO?

- **Tool**: **MapStruct**.
- **The Concept**: It automatically generates the code to copy data between your internal Entity and your public DTO. It’s like an ultra-fast translator.

#### 🧠 `service/` (The "Brain")

This is where the **Business Logic** lives.

- **The Concept**: Instead of putting logic inside the API (Resource), we put it here.
- **Power**: This layer handles complex tasks like "Sort by newest first" or "Calculate user stats." It's the engine room of your app.
- **🧠 Need more?**: Check out the [Level 2 Deep Dive](./level_2_architecture_deep_dive.md).

#### 📞 `web/rest/` (The "API Doors")

These are called **Resources** or **Controllers**.

- **The Concept**: They are the **Receptionists** of your app. They sit by the "front door" (URLs like `/api/users`) and decide what happens when someone makes a request.
- **Level 2 update**: They no longer touch the database directly; they just ask the **Service (Brain)** to do the work and then return the **DTO (Mask)** to the user.

#### ⚡ `config/` (The "Startup")

These are code files that run **only once** when the server starts up.

- **Example**: `DataInitializer.java` makes sure that when you first open the app, there is already some data in the database for you to see.

---

## 🕵️ State of the Art: Reference Comparison

I've generated a proper **Quarkus JHipster Reference** in `jhipster-quarkus-reference` to see how the pros do it. Here is how it differs from our current "Scaffold":

### 🏗️ Architecture (Level 2)

- **✅ Service Layer**: We now have a `service/` folder so the "Receptionists" (Resources) don't have to do the heavy lifting.
- **✅ DTOs (The Masks)**: We use a `dto/` folder to make sure private database data doesn't accidentally leak to the frontend.
- **✅ Mappers (MapStruct)**: We use automated mapping to keep the code clean and fast.
- **🧠 Need more?**: See the [Basic vs. JHipster Comparison](./architecture_comparison_jhipster.md).
- **❌ Migrations**: We still need **Liquibase** to track database changes officially. This is our target for Level 3!

---

## 🛠️ IDE Integration & Best Practices

To make Java development as smooth as TypeScript, follow these setup steps:

### 1. VS Code Setup

I've already updated your `.vscode/settings.json` to:

- Use **Prettier** for everything EXCEPT Java.
- Use the **Java Language Support** (Red Hat) extension for Java.
- Point the Java formatter to the **Google Java Style** guide.
- **Tip**: Ensure you have the "Extension Pack for Java" installed.

### 2. IntelliJ Setup

If you use IntelliJ:

1. Install the **google-java-format** plugin.
2. Go to `Settings -> Other Settings -> google-java-format Settings`.
3. Enable it and choose `Android Open Source Project (AOSP) style`.

### 3. Spotless Best Practices

- **Pre-commit**: It's already hooked into your Git commits! If you forget to format, `lint-staged` will run `./gradlew spotlessApply` for you.
- **Ratchet**: We use a "Ratchet" from `origin/main`. This means Spotless only formats the files you've actually changed.
