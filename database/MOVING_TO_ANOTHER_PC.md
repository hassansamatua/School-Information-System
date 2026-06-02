# Moving the project to another PC

The app connects to a MySQL/MariaDB database named **`school_information_system`**
(see `src/lib/mysql.ts`). Defaults: host `localhost`, user `root`, port `3306`.
Override via env vars: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

You have two options depending on whether you need the existing data.

---

## Option A — Fresh database (structure only, no data)

Use the consolidated schema file. This creates the database and every table,
already including the changes from `migrations/001_extend_enums.sql`.

On the new PC (with XAMPP/MySQL running), from the project root:

```bash
mysql -u root -p < database/full_schema.sql
```

> WARNING: `full_schema.sql` drops existing tables first. Only run it on a fresh
> or empty database, or when you intend to reset everything.

After this you'll have an empty schema. Create your first admin/users through the
app's registration/seed flow.

---

## Option B — Move WITH your existing data (recommended)

### 1. On the OLD PC — export everything (structure + data)

```bash
mysqldump -u root -p --databases school_information_system > school_backup.sql
```

Copy `school_backup.sql` to the new PC (USB, cloud, etc.).

### 2. On the NEW PC — import it

```bash
mysql -u root -p < school_backup.sql
```

Because `--databases` was used, the dump recreates the `school_information_system`
database and all data automatically.

---

## 3. Copy the project files

Copy the whole project folder EXCEPT generated/installed folders:

- Skip `node_modules/` and `.next/` (they're rebuilt).
- Include your `.env.local` / `.env` (or recreate them — see below).

Then on the new PC:

```bash
npm install
npm run dev
```

## 4. Environment variables

Create `.env.local` in the project root if your MySQL credentials differ from the
defaults:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=school_information_system
DB_PORT=3306
```

## 5. Verify

Open the app and log in. If you used Option A, register/seed an admin first.
If the DB is unreachable, some endpoints fall back to mock data — check the
terminal for `Database test connection failed` messages.
