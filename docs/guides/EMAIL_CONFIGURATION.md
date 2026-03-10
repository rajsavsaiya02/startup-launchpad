# Email & Service Configuration Reference

**Account:** `startuplaunchpad@cyberinfospace.com`

> [!IMPORTANT]
> These settings are critical for configuring email clients and backend services.

## 📧 Mail Client Manual Settings

### Secure SSL/TLS Settings (Recommended)
- **Username:** `startuplaunchpad@cyberinfospace.com`
- **Password:** (Use the email account's password)
- **Incoming Server:** `mail.cyberinfospace.com`
    - **IMAP Port:** `993`
    - **POP3 Port:** `995`
- **Outgoing Server:** `mail.cyberinfospace.com`
    - **SMTP Port:** `465`
- **Authentication:** Required for IMAP, POP3, and SMTP.

---

## 📅 Calendar & Contacts (CalDAV / CardDAV)

### Secure SSL/TLS Settings (Recommended)
- **Username:** `startuplaunchpad@cyberinfospace.com`
- **Server:** `https://mail.cyberinfospace.com:2080`
- **Port:** `2080`

**Full URLs:**
- **CalDAV (Calendar):**
  `https://mail.cyberinfospace.com:2080/calendars/startuplaunchpad@cyberinfospace.com/calendar`
- **CardDAV (Address Book):**
  `https://mail.cyberinfospace.com:2080/addressbooks/startuplaunchpad@cyberinfospace.com/addressbook`

### Non-SSL Settings (NOT Recommended)
- **Server:** `http://mail.cyberinfospace.com:2079`
- **Port:** `2079`

**Full URLs:**
- **CalDAV (Calendar):**
  `http://mail.cyberinfospace.com:2079/calendars/startuplaunchpad@cyberinfospace.com/calendar`
- **CardDAV (Address Book):**
  `http://mail.cyberinfospace.com:2079/addressbooks/startuplaunchpad@cyberinfospace.com/addressbook`
