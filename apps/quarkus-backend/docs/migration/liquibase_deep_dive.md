# ⏱️ Deep Dive: Liquibase (Database Versioning)

Liquibase is "Git for your Database." Instead of letting the server "guess" how to update your tables (which is dangerous in production), we now write official **Changelogs**.

---

## 🏛️ How it Works

### 1. The Master Changelog

**File**: [`db.changelog-master.xml`](file:///home/alessandro-incantalupo/Projects/angular/admin-dashboard-nx-monorepo/apps/quarkus-backend/src/main/resources/db/changelog/db.changelog-master.xml)
This is the "Hub." It doesn't contain table info itself; it just lists the other files in the order they should be run. As your project grows, you'll add more links here.

### 2. The ChangeSets

**File**: [`01_initial_schema.xml`](file:///home/alessandro-incantalupo/Projects/angular/admin-dashboard-nx-monorepo/apps/quarkus-backend/src/main/resources/db/changelog/01_initial_schema.xml)
This is a specific "Version" of your database. Each `changeSet` has a unique ID and an author.

- **Initial Schema**: We've recorded the current `ad_user` table structure here.
- **Safety**: Liquibase creates its own table in PostgreSQL called `DATABASECHANGELOG` to keep track of which scripts it has already run. It will **never** run the same script twice!

---

## 🛠️ The "Pro" Workflow

When you want to add a new column (e.g., `phoneNumber`):

1. **Don't** just add it to `User.java`.
2. **Create** a new file: `02_add_phone_to_user.xml`.
3. **Link** it in the Master Changelog.
4. **Boot** the app. Liquibase will see the new file and add the column for you.
5. **Update** `User.java` to match.

---

## 🔍 Why this is Better than "Auto-Update"?

- **Audit Trail**: You can see exactly WHO changed WHAT and WHEN.
- **Rollbacks**: If a database update fails on your production server, Liquibase can often roll it back automatically.
- **Collaboration**: Your teammates get the exact same database structure as you, just by pulling your code and starting the app!

---

### 💡 Pro Tip

If you ever see a "Liquibase Lock" error, it means the app crashed while updating. You can fix it by running a simple SQL command to clear the `DATABASECHANGELOGLOCK` table, but in 2 days, you probably won't encounter that yet!
