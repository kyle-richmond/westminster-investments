# Westminster Investments

Westminster Investments is an open-source web application that transforms the UK Parliament Register of Members' Interests into a searchable database of reportable equity interests and corporate relationships.

The project is intended as a research and transparency tool. It does **not** attempt to reconstruct MPs' complete investment portfolios. It only presents interests that are required to be declared under the House of Commons Register of Members' Interests.

---

## Current Features

- Live import from the UK Parliament Register of Members' Interests API
- Automatic synchronisation of MPs and declared interests
- Extraction of reportable shareholding declarations
- Searchable database of MPs
- Searchable database of companies
- Individual MP pages
- Individual company pages showing declared parliamentary shareholders

---

## Technology

- Next.js
- TypeScript
- Supabase
- PostgreSQL
- UK Parliament Interests API

---

## Data

Current database contains approximately:

- 4,100+ declared interests
- 200+ reportable shareholding declarations
- 199 companies with declared parliamentary shareholders

---

## Roadmap

Planned features include:

- Companies House integration
- Listed company detection (LSE, AIM, NYSE, NASDAQ)
- Historical register tracking
- Dashboard statistics
- Advanced search and filtering
- Data export

---

## Important Note

The House of Commons Register requires disclosure only when statutory thresholds are met.

This application should **not** be interpreted as representing an MP's complete investment portfolio or total wealth.

---

## Licence

MIT