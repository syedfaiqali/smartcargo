# SmartCargo — Project Plan

> Source system referenced throughout: **Masum Logistics — SmartCargo** (freight forwarding / cargo ERP). This plan is derived from `project plan.docx` and `project plan diagram.png` supplied for the rebuild. It captures the end-to-end business process, the module/menu structure of the reference system, and how Operations and Finance/Accounting entries connect to each other.

## 1. Purpose & Scope

The reference system (SmartCargo) is a freight-forwarding operations + accounting platform covering:

- **Air Export** operations (AWB stock, Master/House job entry, local & foreign-agent billing, payables, credit notes, correspondence letters)
- **Sea Export** operations (Job/B/L entry, containers, consolidation, job charges, instruction letters)
- A parallel **Finance/Accounting** track that mirrors every operational transaction (AR/AP creation, tax computation, vouchers, ledger postings, period-end reporting)

The rebuild's job is to reproduce this workflow — screen by screen — as a modern web application, preserving the field-level behavior, the toolbar/state-machine pattern (Final/Void/Post), and the Operations ↔ Finance linkage described below.

Top-level navigation in the reference system: **Freight · Finance · Reports · Reports (MIS) · Reports (Finance) · Management · Dashboard · My Portal**. This plan focuses on the **Freight → Transactions Menu (Air Export / Sea Export)** modules; the field-by-field screen documentation lives in [`screens-phase.md`](./screens-phase.md).

## 2. End-to-End Process Flow

The diagram (`project plan diagram.png`) lays out two parallel tracks — **Operations (Freight)** on the left and **Finance/Accounting** on the right — with dashed arrows showing exactly where an operational transaction creates or affects a financial entry.

### 2.1 Initial Setup (Master Data) — prerequisite for everything

| Operations side | Finance side |
|---|---|
| Airline Codes, Sector/Country/Destination Codes, SPO Codes, Party/Agent Masters, Currency Codes | Chart of Accounts, Bank Codes, Tax Codes (Sales Tax / WHT / PRA), Opening Balances |

All downstream screens look up these masters (airline, party, agent, currency, SPO/commission codes) via dropdown/lookup fields — this must exist before any transaction screens can be exercised end-to-end.

### 2.2 Air Export — Operational Chain

```
Air Waybill Stock Received (from Airline; Letter of Issuance of Stock for onward branch/agent issuance)
        ↓
Job (MAWB) Entry  (Party, Consignee, Routing, Charges, K.B.)
        ↓
Job (HAWB) Entry  (if consolidated — linked to parent MAWB)
        ↓
Local Invoice Entry  (bill the local shipper/customer)  ⇢  AR (local customer) created; Sales Tax/WHT/PRA computed on the invoice
        ↓
Other Charges Payable  (vendor costs: trucking, handling, customs)  ⇢  AP (vendor) created for third-party cost recovery
        ↓
Invoice To Foreign Agent  (bill the destination agent)  ⇢  Foreign AR created; commission & WHT computed
        ↓
Credit Note To Foreign Agent  (adjustment, if needed)  ⇢  Reduces foreign AR balance
        ↓
Invoice/Dr. Note Received From Foreign Agent  (agent bills the company back)  ⇢  Foreign AP created
        ↓
Credit Note Received From Foreign Agent  (adjustment, if needed)  ⇢  Reduces foreign AP balance
        ↓
Letter for Sales Report / Covering Letter  (closes the job's paper trail)
```

### 2.3 Sea Export — Operational Chain

```
Jobs Entry (B/L) — Sea Export  (Entry, B/L Screen, Container, Job Charges tabs)  ⇢  Freight/handling charges mirror Air Export costing structure
        ↓
Consol Tab  (consolidation of multiple shippers under one B/L — parallel to Air's HAWB-under-MAWB)
        ↓
Instruction Letter Tab  (shipping instructions to the carrier/line)
        ↓
Local Invoicing / Payables / Agent Invoicing  (same pattern as Air Export, Sections 4–9 in the screens doc)  ⇢  Same AR/AP/Foreign AR-AP pattern as Air Export
```

Sea Export deliberately reuses the Air Export billing pattern (Local Invoice, Other Charges Payable, Invoice/Credit Note to/from Foreign Agent) rather than introducing new screens — confirm the exact Sea-side billing screens once shared/documented, but plan the data model to share components with Air.

### 2.4 Finance — Settlement & Period-End (applies across both Air and Sea)

```
Receipt Voucher  — customer/agent payment collected against Local Invoice or Foreign Agent Invoice (clears AR)
        ↓
Payment Voucher  — vendor/agent payable settled against Other Charges Payable or Invoice Received (clears AP)
        ↓
Journal Voucher  — Commission Income, WHT Payable/Receivable, SPO commission splits, K.B./rate-difference adjustments posted to GL
        ↓
Every voucher posts back to its source Job/Invoice — visible on-screen as "USED/CLEARED in Vouchers" (seen on Job MAWB, Other Charges Payable, and Invoice screens)
        ↓
Bank/Cash Ledger updated by each Receipt and Payment Voucher
        ↓
Period-End Reports (Finance): AR Aging, AP Aging, Revenue Reconciliation, Bank Reconciliation, Job Profitability
```

**Key architectural implication:** every transaction screen must carry a live, queryable link back to the vouchers that cleared it (the "USED/CLEARED in Vouchers" grid pattern appears repeatedly) — this is not optional cosmetic detail, it's how the system proves reconciliation.

## 3. Module Inventory (Freight → Transactions Menu)

### Part 1 — Air Export (11 screens)

1. Air Waybill Stock (Received From Airline)
2. Job (MAWB) Entry and Printing — the anchor record of the whole Air Export process (6 tabs: Entry, Charges, K.B., Remarks, Detail/Search, Printing)
3. Job (HAWB) Entry and Printing — structurally identical to #2, rebuild as a shared component
4. Local Invoices Entry and Printing (Air-Export)
5. Other Charges Payable (Air-Export)
6. Invoices To Foreign Agents (Air-Export)
7. Credit Notes To Foreign Agents (Air-Export) — structurally identical to #6
8. Invoices/Dr. Notes Received From Foreign Agents (Air-Export) — structurally identical to #6, reversed direction
9. Credit Notes Received From Foreign Agents (Air-Export) — structurally identical to #6, reversed direction
10. Letter for Sales Report/Covering Letter — single-screen report generator (no CRUD toolbar)
11. Letter of Issuance of Stock — single-screen report generator (no CRUD toolbar)

### Part 2 — Sea Export (1 screen, 8 tabs)

12. Jobs Entry and Documents Printing (Sea-Export) — tabs: Entry, B/L Screen, Container, Job Charges, Detail/Search, Printing, Consol, Instruction Letter

Full field-by-field breakdown of all 12 screens is in [`screens-phase.md`](./screens-phase.md).

## 4. Recurring Design Patterns (apply system-wide)

These patterns repeat across nearly every transaction screen and should be built as shared components/conventions rather than re-implemented per screen:

- **Standard toolbar/state machine:** `SEARCH · TOP · BOTTOM · PREV · NEXT · NEW · EDIT · DELETE · FINAL · VOID [· COPY] [· CLOSE]`. FINAL locks a record; VOID cancels without deleting; COPY duplicates as a new-record starting point; CLOSE (Sea Export jobs only) marks full lifecycle completion.
- **Three-tab transaction shape:** `Entry` (data capture) → `Detail/Search` (multi-criteria filter → "Show Detail" → result grid, plus a bulk "Final Multiple …" action) → `Printing` (document type selector + layout/currency/copy toggles + PDF/Excel export).
- **Multi-currency charge lines:** almost every costing grid supports up to 3 currency/exchange-rate pairs, with parallel foreign-currency and PKR columns everywhere money is shown.
- **Due Carrier / Due Agent split:** freight costing consistently separates what's owed to the carrier from what's owed to/from the agent, each with its own charge-head breakdown and subtotal.
- **K.B. (rate-reconciliation) pattern:** compares an agreed rate/freight against actual/invoiced rate, computes a difference and a derived KB amount/percentage. Recurs on Job (MAWB) K.B. tab, Local Invoices, and the Airway Bill reconciliation grid. Exact business meaning of "K.B." should be confirmed with the business owner before finalizing calculation rules.
- **Selling vs. Buying charges (Foreign Agent screens):** Invoices/Credit Notes to/from Foreign Agents separate Selling and Buying charge lines and compute a Difference / Profit Share %.
- **Master ↔ House linkage:** House (HAWB) records always reference a parent Master (MAWB) job; the Master's Entry tab shows a live "House Air Waybills" grid of its children. Sea Export's Consol tab is the equivalent pattern (multiple jobs consolidated under one B/L).
- **Document checklists tracked Y/N/P, per counterparty:** e.g., FEC/APC/IPB/C/M/Encash tracked independently for Airline vs. Party on the Job Remarks tab.
- **Configurable print output:** every Printing tab exposes many Yes/No/radio toggles (currency, copy type, what fields print, letterhead vs. plain paper) — the printed layout must be data-driven/configurable, not hard-coded per document.
- **USED/CLEARED in Vouchers grid:** read-only linkage from a transaction back to the Finance vouchers that settled it — appears on Job (MAWB), Other Charges Payable, and invoice screens.
- **Bulk finalize:** Detail/Search tabs consistently offer a "Final Multiple …" action to bulk-lock all records in the current filtered result set, in addition to single-record FINAL on the Entry toolbar.

## 5. Known Open Questions / Confirm With Business Owner Before Build

- **"K.B." terminology** — exact business definition of Known Broker/kickback-style rate adjustment (Job MAWB K.B. tab, Local Invoice K.B. fields, Sea Export "Total G/P Less KB").
- **Document checklist codes** — FEC, APC, IPB, C/M, Encash (Job Remarks tab) — meaning not spelled out on-screen.
- **Label reuse/oversight** on Credit Notes To/From Foreign Agents: the Printing tab and Detail/Search result grid still show "Invoice No." / "INVOICE" instead of "Credit Note No." — confirm whether intentional (shared template) or a labeling bug to fix in the rebuild.
- **Posted/Un-Posted status** — appears as a Detail/Search filter (Local Invoices, Foreign Agent Invoices, Sea Export Jobs) but has no corresponding toolbar action on Entry (only FINAL/VOID) — confirm what/when sets this flag.
- **Letter for Sales Report/Covering Letter** — unclear which sales report/date range the letter is scoped to; may be implicit (current period) or need an explicit selector.
- **Letter of Issuance of Stock** — Signatory Code and Owner Code appear disabled in the reference screenshot; confirm what enables them and whether they read from AWB Stock records directly.
- **Sea Export abbreviations** — DD Ship, MOP, PCD used without on-screen definition; confirm before applying validation/accounting rules.
- **Sea Export local billing screens** — the plan assumes Sea Export reuses the Air Export Local Invoice / Other Charges Payable / Foreign Agent Invoice pattern; confirm the actual Sea-side screens once available rather than building purely from inference.

## 6. Build Sequencing Recommendation

Given the dependency chain above, implement in this order:

1. **Initial Setup / master data** (Airline, Sector/Country/Destination, SPO, Party/Agent, Currency codes) — nothing else can be tested without these.
2. **Air Waybill Stock** — simplest screen, establishes the stock-consumption pattern reused by Job (MAWB).
3. **Job (MAWB) Entry and Printing** — the anchor record; build its 6 tabs fully before moving on, since nearly every later screen links back to it.
4. **Job (HAWB) Entry and Printing** — as a shared component/template with #3.
5. **Local Invoices Entry and Printing** — first Finance-linked screen (AR + tax computation).
6. **Other Charges Payable** — AP counterpart to #5.
7. **Invoices To Foreign Agents**, then its three structural siblings (Credit Notes To, Invoices/Dr. Notes Received From, Credit Notes Received From) — build #7 fully, then adapt via configuration/shared component for the other three.
8. **Letters** (Sales Report/Covering Letter, Letter of Issuance of Stock) — low-complexity report generators, can slot in anytime after Job/AWB Stock exist.
9. **Sea Export Jobs (all 8 tabs)** — largest single screen; sequence its tabs Entry → B/L Screen → Container → Job Charges → Consol → Instruction Letter → Detail/Search → Printing.
10. **Finance settlement layer** (Receipt/Payment/Journal Vouchers, ledger, period-end reports) — needs #3–#9 in place to have something to reconcile against.

## 7. Source Materials

- `project plan.docx` — full screen-by-screen field documentation (58 embedded reference screenshots from the Masum Logistics SmartCargo system), reproduced in [`screens-phase.md`](./screens-phase.md).
- `project plan diagram.png` — "SmartCargo — End-to-End Process Flow" diagram, summarized in Section 2 above.
