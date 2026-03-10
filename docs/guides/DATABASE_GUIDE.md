# 🐘 PostgreSQL Database Guide

This guide covers how to connect to the project's PostgreSQL database using the command line.

## 🛠 Prerequisites

To interact with the database, you need the `psql` client installed.

### macOS
Usually included with PostgreSQL installations.
- **Homebrew:** `brew install postgresql`
- **Postgres.app:** Ensure the binary is in your PATH.

> [!IMPORTANT]
> **Version Compatibility:** This project is developed using **PostgreSQL 18**.
> The `start/connect_db.sh` script is optimized to find the matching `psql` client (e.g., from Postgres.app on macOS) to avoid protocol version mismatches.
> If you are installing manually, we strongly recommend installing **PostgreSQL 18** to match the server version.

### Linux
Install via your package manager:
- **Debian/Ubuntu:** `sudo apt update && sudo apt install postgresql-client`
- **CentOS/RHEL:** `sudo yum install postgresql`

---

## 🚀 Quick Connect (Recommended)

We have provided a helper script that automatically reads your credentials from `server/.env` and connects you to the database.

```bash
./start/connect_db.sh
```

---

## 💻 Manual Connection

If you prefer to connect manually, use the following command structure:

```bash
psql -h <hostname> -U <username> -d <database_name>
```

### Flags Explained
- `-h`: Hostname (e.g., `localhost`)
- `-U`: Username (e.g., `postgres` or `raj_slpdb`)
- `-d`: Database name (e.g., `slpdb`)

**Note:** You will be prompted for the password unless it is exported as the `PGPASSWORD` environment variable.

### Alternative: Connection String
You can also use a URI (less secure for history):
```bash
psql postgresql://username:password@hostname:port/database
```

---

## 📜 Cheat Sheet: Common Commands

Once connected to the `psql` session, use these commands:

| Command | Description |
| :--- | :--- |
| `\l` | List all databases |
| `\c <dbname>` | Connect to a different database |
| `\dt` | List tables in the current database |
| `\d <table_name>` | Describe a specific table structure (columns, types) |
| `\q` | Quit the `psql` session |

### Running SQL Queries
You can run standard SQL queries directly. Remember to end with a semicolon `;`.

```sql
SELECT * FROM users;
```
