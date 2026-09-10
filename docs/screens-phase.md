# SmartCargo — Screens Phase (Screen-by-Screen Documentation)

> Source: `project plan.docx` (58 embedded reference screenshots from the Masum Logistics SmartCargo system) + `project plan diagram.png`. See [`project-plan.md`](./project-plan.md) for the overall process flow and build sequencing. Every screen, tab, field, table, and workflow note from the source document is captured below in full — nothing summarized away.

**Reading order / job lifecycle:** AWB Stock → Job (MAWB) → Job (HAWB) → Local Invoices → Other Charges Payable → Invoices To Foreign Agents → Credit Notes To Foreign Agents → Invoices/Dr. Notes Received From Foreign Agents → Credit Notes Received From Foreign Agents → Covering Letter → Letter of Issuance of Stock → **[Part 2]** Sea Export Jobs.

---

# Part 1 — Transactions Menu (Air Export)

## 1. Air Waybill Stock (Received From Airline)

**Path:** Freight → Transactions Menu (Air Export) → Air Waybill Stock (Received From Airline)

**Purpose:** registers the blank AWB number ranges physically/digitally received from each airline, and tracks their usage status. This is the first step in the Air Export job lifecycle — an AWB number must exist in stock (and be Un-Used) before it can be assigned to a Job (MAWB) Entry. The screen also gives a live count of Total / Used / Un-Used stock per airline.

### 1.1 Toolbar

| Button | Function |
|---|---|
| SEARCH | Look up an existing AWB stock record |
| NEW | Register a newly received AWB number/range |
| DELETE | Remove a selected AWB stock entry |

### 1.2 Header / Entry Fields

| Field | Type | Notes |
|---|---|---|
| Air Waybill No. | Text | The specific AWB number being registered |
| Reciept Date | Date (DD/MM/YYYY) | Date the AWB number/stock was received from the airline |
| Owner Code | Dropdown (lookup) | The branch/entity that owns this AWB stock ("Select Owner Code") — relevant where multiple branches share one airline account |
| AWB Used Y/N | Dropdown | Whether this AWB number has already been used/assigned to a job |
| AWB Date | Date (DD/MM/YYYY) | Date the AWB was actually used, once assigned to a job |

### 1.3 Airline Stock Summary Panel

A live counter box next to the entry form, giving stock levels at a glance for the selected airline:

| Counter | Meaning |
|---|---|
| Total | Total AWB numbers on record for this airline |
| Used | AWB numbers already assigned to a job |
| Un-Used | AWB numbers still available for assignment |

### 1.4 Detail / Filter Section

A search panel to review existing AWB stock records by criteria, before listing them in the grid below:

| Field | Notes |
|---|---|
| Select AirLine Code | Filter by airline |
| Select Owner Code | Filter by owning branch/entity |
| Give Starting Recieved Date / Give Ending Recieved Date | Date range filter on Receipt Date |
| AWB Used Y/N | Filter: Both / Y / N |
| "Show Detail" button | Runs the filter and populates the grid below |

### 1.5 Detail Grid

Lists AWB stock records matching the filter above, with inline search and paging.

| Column | Description |
|---|---|
| Action | Row-level actions (view/edit/delete) |
| AWB No | Air Waybill number |
| Receipt Date | Date received from airline |
| AWB Date | Date used, if applicable |
| AWB Used Y/N | Usage status flag |

### 1.6 "NEW" — Two Entry Modes

Clicking NEW changes the toolbar button to CANCEL and enables the Air Waybill No. field for direct, single-number entry against the header fields already described in 1.2 (Receipt Date, Owner Code, AWB Used Y/N, AWB Date).

A second popup — also opened from NEW — supports registering a whole range of AWB numbers received from the airline in one go, rather than one at a time. It validates the range against existing stock before committing.

| Field | Notes |
|---|---|
| Give Airline Code | Airline the range was received from |
| Give Starting AWB No / Give Ending AWB No | Defines the number range to register, e.g. 001-1000 to 001-1099 |
| Give Reciept Date | Date the range was received |
| Give Owner Code | Branch/entity the stock belongs to |
| "Check AWB" button | Validates the range — flags numbers already in stock as duplicates before writing new records |

Validation summary shown after Check AWB:

| Counter | Meaning |
|---|---|
| Total No. Of AWBs Given | Count of AWB numbers in the entered range |
| Total No. of AWBs Found Duplicate | Count already existing in stock — these are skipped |
| Total No. of AWBs To be Written | Net new records that will actually be created |

### 1.7 Workflow

1. Airline delivers a physical/digital AWB number range.
2. Operator opens **Air Waybill Stock (Received From Airline)** and clicks **NEW**.
3. Either registers a **single AWB No.** directly, or opens the **bulk range popup**, enters Airline Code + start/end AWB No. + Receipt Date + Owner Code, and clicks **Check AWB**.
4. System validates the range, flags duplicates, and reports Total Given / Duplicate / To Be Written counts.
5. Operator confirms — new stock records are written with `AWB Used Y/N = N`.
6. Stock becomes available for consumption by **Job (MAWB) Entry** (Section 2), which flips `AWB Used Y/N` to `Y` and sets `AWB Date` once assigned.

---

## 2. Job (MAWB) Entry and Printing

**Path:** Freight → Transactions Menu (Air Export) → Job (MAWB) Entry and Printing

**Purpose:** this is the central, anchor screen of the entire Air Export process. A single Job record captures shipper/consignee, routing, an assigned MAWB number, freight charges, carrier/agent amounts, and every reference (HAWBs, invoices, credit notes, vouchers) links back to this Job No. It is organized into six tabs — **Entry, Charges, K.B., Remarks, Detail/Search, Printing**.

### 2.1 Tabs

| Tab | Purpose |
|---|---|
| Entry | Main job data entry — the primary screen |
| Charges | Extended charge/costing detail beyond the summary grid shown on Entry |
| K.B. | Rate-reconciliation / broker-commission detail (see 2.10) |
| Remarks | Shipment schedule, milestones, document checklist, free-text notes |
| Detail/Search | Search and list existing jobs |
| Printing | Print the MAWB and related job documents |

### 2.2 Toolbar Actions

| Button | Function |
|---|---|
| SEARCH | Find an existing job |
| TOP / BOTTOM / PREV / NEXT | Navigate between job records (first, last, previous, next) |
| NEW | Start a new job entry |
| EDIT | Edit the currently loaded job |
| DELETE | Delete the currently loaded job |
| FINAL | Lock/finalize the job — prevents further edits and enables downstream actions (invoicing, printing) |
| VOID | Cancel/void the job without deleting it |
| COPY | Duplicate the current job as a starting point for a new one |

### 2.3 Entry Tab — Job Identification Fields

| Field | Notes |
|---|---|
| Branch | Operating branch/office (e.g. KHI = Karachi) |
| Job No. | System-generated job number (two-part: series + sequence) |
| Job Date | Date the job was created |
| Job Type | Type of export job (dropdown) |
| Nomination (Y/N) | Whether the shipment is a nominated (agent-directed) job |
| Quot.Ref.No. | Link to a prior Quotation, if this job was converted from one |
| MAWB No. | Master Air Waybill number assigned to this job — drawn from AWB Stock (Section 1) |
| AWB Date | Date the AWB was issued/used |
| Sale Date | Date of sale |
| Owner | Owning branch/entity ("Select Owner Code") |
| Charge Code / Station | Charge classification code and station |
| IncoTerm | Chargeable/Incoterm code governing who bears which charges |

**PARTY**

| Field | Notes |
|---|---|
| Credit Limit | Credit limit applicable to this customer/party |
| Party Code | Shipper/customer code (lookup) |
| Agent Party | Sub-agent's party code, if applicable |
| Name / Address | Auto-populated from the selected Party Code |

**CONSIGNEE**

| Field | Notes |
|---|---|
| Consolidation (Y/N) | Whether this is a consolidated shipment (multiple HAWBs under one MAWB) |
| Code | Foreign agent code (destination-side consignee/agent) |
| Name / Address | Auto-populated from the selected Code |

**Routing & Shipment Details**

| Field | Notes |
|---|---|
| CC Port | Origin/destination code reference |
| Airport of Departure | Departure airport (lookup) |
| To (×3) / By | Up to three legs of destination airports, each with a "By" (carrier/flight) field — supports transshipment routings |
| Destination | Free-text final destination |
| Account No. / HS Code | Customer account reference and Harmonized System tariff code |
| Flight No. 1 / Flight No. 2 + Date | Flight details for the routing legs |
| Form E No. + Date | Export Form-E reference and date (State Bank of Pakistan export documentation) |
| Shipper Invoice No. + Date | Commercial invoice reference |
| S/B No. + S/B Date | Shipping Bill / customs export declaration number and date |

**Agents & References**

| Field | Notes |
|---|---|
| Clearing Agent | Customs clearing agent code |
| Delivery Agent | Delivery agent code |
| SPO Code | Links to the SPO Codes master (Initial Setup) for commission attribution |
| Run No. / Prefix / RO No. | Operational run/route order reference numbers |

**Shipment**

| Field | Notes |
|---|---|
| Status | Job status (dropdown, e.g. Open/Closed/In Transit) |
| Date | Status date |

### 2.4 Insurance, Handling & Currency

| Field | Notes |
|---|---|
| Insurance | Insurance amount/value |
| Declared Val Carraige | Declared value for carriage |
| Declared Val Customs | Declared value for customs |
| Handling Information | Free-text handling instructions block, printed on the AWB |
| Currency / Ex. Rate / Printable Ex. Rate | Charges currency and its exchange rate(s) — the printable rate may differ from the accounting rate |
| Attached image box | Upload/attachment area (e.g. scanned document or cargo photo) next to Totals |

### 2.5 Charges Grid

The core freight-costing grid. Each row represents a charge line; new lines are added via "NEW" rows at the bottom.

| Column | Notes |
|---|---|
| RCP | Receipt/charge code — identifies the charge head |
| Pcs | Number of pieces |
| Gross Wt. | Gross weight |
| Cl | Class (freight class code) |
| Comdty | Commodity code |
| Charge Wt. | Chargeable weight (higher of gross/volumetric) |
| Rate / Rate PKR | Rate in original currency and in PKR |
| Total / Total PKR | Line total in original currency and in PKR |
| Dimension Wt. | Volumetric/dimensional weight |

### 2.6 Totals

| Field | Notes |
|---|---|
| Freight | Total freight amount (foreign + PKR) |
| Due Carrier | Amount due to the airline/carrier |
| Due Agent | Amount due to/from the agent |
| Total AWB Amount | Sum total on the AWB (highlighted, foreign + PKR) |
| Total K.B. Amount | Total amount tied to the K.B. tab |
| Commission | Commission amount |
| WHT Amount | Withholding tax amount |
| Payable To Airline | Final net payable to the airline (highlighted, foreign + PKR) |

### 2.7 Notes Blocks & Invoice Flag

| Block/Field | Notes |
|---|---|
| Accounting Information / Notify | Free-text accounting notes and notify-party details |
| Said To Contain | Free-text cargo description as declared, printed on the AWB |
| Other Information | General free-text notes block |
| Invoice Required / Local Invoice (Y/N) | Flags whether a local invoice is required for this job |

### 2.8 Linked Records Grids

Read-only/linking grids showing records created against this job from other screens — the relational core of the whole system (job as the anchor record).

| Grid | Columns | Links to |
|---|---|---|
| Local/International Invoices | No., Date, Year, Type, Name, Curr, F/Amount, PKRAmount, Final | Local Invoices Entry / Invoices To Foreign Agents screens |
| USED/CLEARED in Vouchers | (voucher references) | Finance/payment voucher records |
| House Air Waybills | Job No., HAWB No., RUN No. | Job (HAWB) Entry and Printing screen |
| C/N Details | Hawb No., RUN No., C/N No., Manual C/N | Credit Notes To/From Foreign Agents screens |

### 2.9 Charges Tab

The Charges tab is the detailed carrier/agent costing breakdown behind the summary Charges grid and Totals shown on the Entry tab (2.5–2.6). Where Entry captures revenue-side charge lines, this tab breaks out exactly what's due to the carrier and to the agent, charge head by charge head, and reconciles to the same Total AWB Amount / Payable to Airline figures.

Toolbar: a single **EDIT** button — this tab is populated largely from Entry-tab data and Airline master charges (Initial Setup, Airline Codes and Charges), and is opened in edit mode to adjust computed values.

**Due Carrier panel**

| Field | Notes |
|---|---|
| Due Carrier / AMS Charges / HAWB Charges / AWC Charges | Standard carrier charge heads, each with Chargess (PKR) and Charges (PKR) columns |
| Bar Coding / Security Charges / Fuel SurCharge / Scan Charges / CAA Charges | Charge heads with an editable Rate (PKR) and a CW/GW selector (charge basis: chargeable weight vs. gross weight), pulled from the Airline's default Due Carrier Charges but overridable per job |
| Additional charge rows | Blank rows below follow the same Rate / CW-GW / Charges / Charges pattern for any extra carrier charge heads |
| Total Due Carrier | Sum of all Due Carrier charge lines (highlighted) |

A small reference strip restates **Gross Weight, Chargeable Weight, and Rate (PKR / foreign)** for the job — kept visible alongside the carrier charges for cross-checking against Entry-tab weights.

**Due Agent panel**

| Column | Notes |
|---|---|
| DUE AGENT | Charge head description |
| CHARGES (PKR) | Two charges columns — likely foreign-currency and PKR amounts due to/from the agent |
| PRINT on AWB | Checkbox/flag per line controlling whether that charge line is printed on the Airway Bill |
| AWB Fee / AIS Charges | Named charge rows; AIS Charges is flagged "(Local Currency Not Calculated with Ex.Rate)" with Manual Input columns, meaning it must be entered directly in PKR rather than converted |
| Total Due Agent | Sum of all Due Agent charge lines (highlighted) |

**Summary Totals panel**

| Field | Notes |
|---|---|
| CC Scaning Payable (Y/N) | Whether CC scanning charges are payable on this job |
| Total Due Carrier / Total Due Agent | Rolled up from the two panels above |
| Total Freight Amount | Total freight for the job |
| Total AWB Amount | Grand total (highlighted) — reconciles with the Entry tab's Total AWB Amount (2.6) |
| Total K.B. Amount / Commission / WHT Amount | Carried through from Entry tab |
| Payable to Airline | Final net payable (highlighted) — reconciles with Entry tab (2.6) |
| Currency / Calculation Ex. Rate / Printable Ex. Rate | Same currency/rate fields as Entry tab, shown again for this tab's context |

### 2.10 K.B. Tab

K.B. appears to be a rate-reconciliation / broker-commission tab: it compares the agreed freight rate against the actual booked/net rate across up to three commodity lines, computes the difference, and derives a "KB" (likely Known Broker / kickback-style) amount and rate — separate from the standard Commission and WHT already captured on Entry/Charges. It also carries an Other Charges Payable breakdown, an owner-level commission panel, and a Shipper-vs-Invoiced rate comparison. **Exact business meaning of "K.B." should be confirmed with the client/business owner** — it isn't spelled out on-screen.

Toolbar: a single **EDIT** button, consistent with the Charges tab.

**Line-wise Freight (Line No. 1–3)**

| Field | Notes |
|---|---|
| Pcs / Class / Commodity | Per-line piece count, freight class, and commodity code — supports up to 3 commodity/class breakdowns per job |
| Gross Weight / Charge Weight | Weights for that line |
| Rate (foreign / PKR) | Rate applied for that line, in both currencies |
| Total Freight | Freight total for that line (foreign / PKR), highlighted |

**Airline K.B. panel**

| Field | Notes |
|---|---|
| Comm. [Y/N] | Whether commission applies to this line |
| New Commodity | Flag/dropdown — appears as "NEW" placeholder for adding a commodity override on Lines 2–3 |
| Net Rate [Y/N] | Whether the rate entered is a net (post-commission) rate |
| Agreed Rate / Agreed Freight | The rate and freight amount agreed with the airline/customer (foreign / PKR) |
| Freight Difference | Variance between agreed and actual/booked freight |
| Less: Commission [Y/N] | Whether commission is deducted in this line's calculation |
| KB Freight / KB Rate % / KB Amount | The resulting K.B. freight base, rate percentage, and computed amount per line |

Currency / Calculation Ex. Rate / Printable Ex. Rate fields repeat here, consistent with the Entry and Charges tabs.

**Other Charges Payable**

| Field | Notes |
|---|---|
| AWB Fee + blank rows | Miscellaneous payable charge lines, each with foreign and PKR amount columns |
| Total Other Charges Payable | Sum of the above (highlighted) |

**Net Payable Summary**

| Field | Notes |
|---|---|
| Freight / Due Carrier / Due Agent | Rolled up from Entry/Charges tabs |
| Total K.B. Amount | Sum of KB Amount across the three lines |
| Other Payable | From the Other Charges Payable block above |
| Net Payable | Grand total payable after all K.B. adjustments (highlighted) |
| K.B. Adj. Y/N + K.B. Adj. Date | Whether a K.B. adjustment has been applied, and when |
| Inter Line Revenue / Total Deduction | Additional revenue/deduction lines feeding into Net Payable |

**Owner panel**

| Field | Notes |
|---|---|
| Comm. On Net (Y/N) | Whether owner commission is calculated on the net rate |
| Comm. % / WHT % | Owner-level commission and withholding tax percentages, with computed PKR amounts |

**Shipper Agreed and Invoiced Rates** — side-by-side comparison of what was agreed with the shipper versus what was actually invoiced:

| Field | Shipper column | Invoiced column |
|---|---|---|
| Agreed Rate | Rate agreed with shipper | Rate actually invoiced |
| Agreed Freight | Freight agreed with shipper | Freight actually invoiced |
| Freight Difference | — | Variance between the two |

**Printable Remarks** — free-text box for remarks that print on job-related documents, separate from the general Remarks tab.

### 2.11 Remarks Tab

Tracks the operational shipment schedule, milestone timestamps, a document/certificate checklist for both the airline and the party side, and free-text remarks fields for internal and printable use.

Toolbar: a single **EDIT** button, consistent with the other tabs.

**Shipment Schedule grid**

| Column | Notes |
|---|---|
| FLIGHT No. / FLIGHT Date | Up to 6 flight legs can be recorded, each with its own number and date — supports multi-leg/transshipment routings |
| ROUTING | Route description for that leg |
| STATUS | Status dropdown per leg |

**Milestone Dates panel**

| Field | Notes |
|---|---|
| Received On / Arrival Date / Arrival Time | When cargo was received and arrived |
| Forwarded On / Vehicle No. | When forwarded onward, and the vehicle used |
| Delivered [Y/N] | Whether delivery is complete |
| Held Date / Release Date | Dates cargo was held and released, if applicable |
| Pending Shipment [Y/N] | Whether shipment is still pending |
| Handed Over to A/L [Y/N] | Whether cargo has been handed to the airline |
| Received from Shipper [Y/N] | Whether cargo has been received from the shipper |
| Delivery Required [Y/N] / Delivery Date | Whether onward delivery is required, and when |

**Process Milestones (Description / Date / Time)** — each row also has a checkbox, likely marking the milestone as completed/confirmed:

| Milestone | Notes |
|---|---|
| Custom Clearance (Local Hub) | Date/time cargo cleared customs locally |
| Departure (In Transit) | Date/time cargo departed / went in transit |
| Arrival At Destination (Process at Foreign Hub) | Date/time cargo arrived and began processing at the foreign hub |
| Custom Clearance At Destination (Foreign Hub) | Date/time cargo cleared customs at destination |

**Document Checklist — Airline / Party**

Two parallel panels tracking document or certificate status, each item flagged Y/N/P (Yes / No / Pending) — separately for the Airline side and the Party (customer/shipper) side. **The exact meaning of each code (FEC, APC, IPB, C/M, Encash) isn't spelled out on-screen and should be confirmed with the business owner**, but the pattern — a shared checklist tracked independently per party — is clear and worth replicating.

| Item | Airline column | Party column |
|---|---|---|
| FEC [Y/N/P] | Status on airline side | Status on party side |
| APC [Y/N/P] | Status on airline side | Status on party side |
| IPB [Y/N/P] | Status on airline side | Status on party side |
| C/M [Y/N/P] | Status on airline side | Status on party side |
| Encash [Y/N/P] | Status on airline side | Status on party side |

| Extra field | Notes |
|---|---|
| No. Of Copies (Airline panel) | Number of document copies |
| Remarks (Party panel) | Free-text remark tied to the party checklist |

**Remarks & Instructions (right column)**

| Block | Notes |
|---|---|
| Non Printable Remarks | Internal-only free-text notes — not shown on any printed document |
| Printable Remarks / Additional Instruction for Label | Free-text that prints on the shipping label |
| Extra Sheets | Large free-text block, likely for continuation text when other fields run long |
| Label Additional Instructions | Further free-text instructions specific to label printing |

### 2.12 Detail/Search Tab

A dedicated search/filter screen for finding one or more existing jobs, and for bulk-finalizing multiple AWBs in one action — separate from the single-record SEARCH button on the Entry tab toolbar.

**Filter Fields**

| Field | Notes |
|---|---|
| Branch | Multi-select tag field (e.g. "KHI ×") — can filter across one or more branches at once |
| Party Code / Owner / SPO Code | Filter by customer, owning branch/entity, and SPO |
| Airport of Dep. (Origin) / Destination | Filter by route |
| HS Code | Filter by Harmonized System code |
| Give Starting Job No. / Give Ending Job No. | Job number range filter (defaults ending to 999999, i.e. unbounded) |
| Check Date (Yes/No) | Whether to apply the date range filter below at all |
| Give Starting Date / Give Ending Date | Date range, interpreted per the "Date" selector |
| Date (AWB Date / Job Date) | Which date field the range above filters on |
| Give Starting MAWB No. / Give Ending MAWB No. | MAWB number range filter (defaults ending to "ZZZ-ZZZZZZZZ", i.e. unbounded) |
| Form 'E' No. | Filter by Form-E reference |

**Status Filter & Actions**

| Control | Notes |
|---|---|
| SELECT button | Applies the filters above to build the working result set |
| Final / Un-Final / Void / Un-Void / All | Radio filter narrowing results to jobs in that status (mirrors the FINAL/VOID actions on the Entry toolbar) |
| Show Detail | Lists matching jobs in a detail grid (filter-then-"Show Detail" flow) |
| Final Multiple AWB | Bulk-finalizes all AWBs/jobs in the current filtered result set in one action — a batch version of the single-job FINAL button on Entry |

### 2.13 Printing Tab

Controls what document prints and exactly how the Air Waybill is formatted — this is where the printable output of the whole job entry comes together. Given how many toggles it exposes, **the printed AWB layout needs to be fully configurable per client/airline preference, not hard-coded.**

**Toolbar**

| Control | Notes |
|---|---|
| Branch | Branch selector for the print job |
| PDF / Excel icons | Export the selected document as PDF or Excel |

**Document Type (Print radio list)** — selects which document to generate:

- Air Waybill — the primary MAWB document
- Under Taking Letter
- Cargo Manifest
- Label Printing
- Extra Sheet Printing — prints the Extra Sheets text from the Remarks tab (2.11)
- Shipment Pre-Alert
- Outer
- Security Certificate
- AirwayBill - Back Side
- Master Air Waybill Acceptance Statement (Declaration For US-Bound Shipments) — a compliance-specific document for US-destined cargo

**Air Waybill Print Options** — a long list of Yes/No and radio toggles controlling exactly what appears on the printed Air Waybill:

| Option | Values | Notes |
|---|---|---|
| Print Air Waybill In | Local Currency / Foreign Currency | Which currency the AWB is denominated in on print |
| Print Air Waybill No. | Yes/No | |
| Print "As Agreed" | Yes/No | Prints "As Agreed" instead of actual rate, when rates are confidential |
| Print Chargeable Code | Yes/No | |
| Print Party Name at Bottom | Yes/No | |
| Print Agent Party Name at Bottom | Yes/No | |
| Print Weight | Yes/No | |
| Print Company's Name | Yes/No | |
| Print Ex.Rate | Yes/No | |
| Print Stamp | Yes/No | |
| Print Consignee Name/Address | Yes/No | |
| Print [rate basis] | Rate/Kg / Rate/Kg + Amount / Amount | How the charge line is expressed on print |
| Print In Issuing Carrier Box | Issuing Carrier / Notify / Print Nothing / Delivery Agent / GSA Name | What text populates the "Issuing Carrier's Agent" box |
| Print [charge type] | PP / PX | Prepaid vs. another charge-collect designation printed on the AWB |
| Print Shipper's Name/Address | Yes/No | |
| Print Airline Address | Yes/No | |
| Print "MEMBER OF IATA" | Yes/No | |
| Print on | Plain Paper / Pre-Printed AWB | Whether to print the full AWB layout or overlay data onto pre-printed airline stationery |
| Print Bar Code | Yes/No | |
| Print [signature line] | Free text (default: "SIGNED BY THE AGENT ON BEHALF OF CARRIER") | Editable signature/authorization line printed at the bottom of the AWB |

**Copy Selection (right panel)** — checklist controlling which physical copies of the AWB are printed — matches the standard multi-part AWB copy set used in air cargo, extended here with additional carrier and "dummy" copies:

| Copy | Notes |
|---|---|
| Tick/UnTick All Check Boxes | Master toggle for all copies below |
| Original 3 (for Shipper) | |
| Copy 8 (for Agent) | |
| Original 1 (for Issuing Carrier) | |
| Original 2 (for Consignee) | |
| Copy 4 (for Delivery Receipt) | |
| Copy 5 (For Airport of Destination) | |
| Copy 6 / Copy 7 (Extra Copy) | General-purpose spare copies |
| Copy 9 / Copy 10 / Copy 11 (Extra Copy for Carr) | Extra copies specifically for the carrier |
| Dummy | A non-functional/watermarked copy, typically for internal reference or draft checking |

### 2.14 Workflow

1. Confirm an **Un-Used AWB No.** exists in stock (Section 1) for the chosen airline.
2. Open **Job (MAWB) Entry**, click **NEW**; enter Branch, Job Date, Job Type, MAWB No. (from stock), Party/Consignee, Routing, Agents.
3. Enter Insurance/Handling/Currency details and build the **Charges grid**; review Totals (Freight, Due Carrier, Due Agent, Total AWB Amount, Payable To Airline).
4. Switch to **Charges tab** (EDIT) to break out Due Carrier / Due Agent charge heads in detail; confirm reconciliation with Entry-tab totals.
5. If rate reconciliation applies, complete the **K.B. tab** (EDIT): line-wise freight, Agreed vs. Net rate, resulting KB Amount, Net Payable.
6. Complete the **Remarks tab**: shipment schedule, milestone dates, document checklist (Airline/Party), printable/non-printable remarks.
7. Save and **FINAL** the job once verified (or **VOID** to cancel without deleting).
8. Use **Detail/Search** to retrieve jobs later, or **Final Multiple AWB** to bulk-finalize a filtered batch.
9. Use **Printing** to generate the Air Waybill and related documents (Cargo Manifest, Label, Pre-Alert, etc.), choosing currency, layout, and copy set.
10. Downstream: job feeds **House Air Waybills** (Section 3), **Local Invoices** (Section 4), and appears in **USED/CLEARED in Vouchers** once settled in Finance.

---

## 3. Job (HAWB) Entry and Printing

**Path:** Freight → Transactions Menu (Air Export) → Job (HAWB) Entry and Printing

Structurally the same screen as Job (MAWB) Entry and Printing (Section 2) — same tab layout (Entry, Charges, K.B., Remarks, Detail/Search, Printing), same toolbar (SEARCH/TOP/BOTTOM/PREV/NEXT/NEW/EDIT/DELETE/FINAL/VOID/COPY), and the same field groupings (Job Identification, Party, Consignee, Routing, Agents, Shipment, Charges grid, Totals, notes blocks). **Rebuild it as a shared component/template with the MAWB screen** rather than a separate implementation.

**Differences worth calling out specifically:**

- A House job is always created against a parent **Job No. (MAWB)** — the Job Identification section carries an additional link back to the Master job, and the HAWB record appears in the Master's "House Air Waybills" grid (2.8).
- Party/Consignee on the House job are the **actual shipper and actual consignee** for that portion of the consolidated cargo — as opposed to the Master, where Party may be the consolidating agent and Consignee the destination agent.
- **MAWB No.** field is replaced with a **HAWB No.** field, drawn from a HAWB numbering series rather than the Airline's AWB stock (Section 1 stock control is Master-AWB-specific, not applicable per-House).
- Charges on the House job typically reflect what's billed to the actual shipper, while the Master's charges reflect the consolidator-to-airline relationship — so **Due Carrier/Due Agent fields on the Charges and K.B. tabs may not all apply the same way**.
- Printing tab's document list and copy-count defaults may differ (e.g. fewer/different copy types than the Master AWB's 8+ copy set), since a HAWB is typically a single-part document rather than a multi-copy airline form.

> If any of these assumptions turn out wrong once the HAWB screen is reviewed directly, flag it for correction — the structure above is **inferred** from the MAWB screen and general consolidation practice, not from a HAWB screenshot.

---

## 4. Local Invoices Entry and Printing (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Local Invoices Entry and Printing (Air-Export)

**Purpose:** raises the local invoice billed to the shipper/customer for a job — pulling in House and/or Master job references, computing sales tax/WHT/commission on top of freight, and reconciling against the job's own Airway Bill freight figures for KB (rate-difference) purposes. This is the Local Invoice step in the Air Export lifecycle. All three tabs — **Entry, Detail/Search, Printing** — are documented below.

### 4.1 Tabs & Toolbar

| Tab | Purpose |
|---|---|
| Entry | Main invoice data entry |
| Detail/Search | Search and list existing local invoices (pattern consistent with Job MAWB's Detail/Search tab) |
| Printing | Print/export the invoice (pattern consistent with Job MAWB's Printing tab) |

Toolbar: **SEARCH, TOP, BOTTOM, PREV, NEXT, NEW, EDIT, DELETE, FINAL, VOID** — same standard set seen on the Job (MAWB) screen, minus COPY.

### 4.2 Job Identification & Party

| Field | Notes |
|---|---|
| Branch / Invoice No. / Invoice Date | Standard invoice header |
| Job Year / Job Type / CC Port | Job classification carried onto the invoice |
| HOUSE panel (Job No., Job Date, AWB No., AWB Date, PP, Ref No) | Links the invoice to a House Job (HAWB) — auto-pulled once a Job No. is selected |
| MASTER panel (same fields) | Links the invoice to the Master Job (MAWB) — an invoice can reference House, Master, or both |
| Owner Code / Party Code / Agent's Party | Billing party details, same lookups as the Job screen |
| A/Port of Dep / Destination / Spo Code | Route and SPO commission link |
| Form E No. + Date / S/B No. + Date / Shipper Inv.No. + Date | Same export-documentation references as the Job screen |
| Post in PKR Currency (Y/N) | Whether this invoice posts to the ledger in PKR regardless of billing currency |
| Currency ×3 + Ex.Rate | Up to three currency/rate pairs — supports multi-currency invoices |
| Consignee | Free-text consignee line for the invoice |
| Printable Remarks | Free-text, prints on the invoice |
| Bank Detail (Select Bank Code + text) | Bank account details printed on the invoice for payment |

### 4.3 Tax, Commission & Totals

| Field | Notes |
|---|---|
| Sales Tax (%) / PST / Amount | Provincial Sales Tax rate and computed amount |
| PRA / Tax | Punjab Revenue Authority (or similar provincial authority) tax line |
| WHT Sales Tax (%) / Amount | Withholding tax on sales tax |
| Sales Tax Invoice No. / PRA/SRB Tax Inv. No. | Statutory tax invoice references for compliance |
| Total Freight / Total Due Carrier / Total Due Agent | Rolled up from the charge grids (4.4) |
| Gross Invoice Amount | Freight + Due Carrier + Due Agent, before commission/WHT/discount (highlighted) |
| Commission (%) / Commission Amount | Commission on this invoice |
| WHT (%) / WHT Amount | Withholding tax on the invoice |
| Net Rate (Y/N) / Agreed Rate / Agreed Freight / Freight Difference | Same rate-reconciliation pattern as the Job K.B. tab (2.10), applied at invoice level |
| Less: Commission / K.B. Rate (%) / K.B. Amount | K.B. deduction/rate applied to this invoice (highlighted) |
| Total Discount | Any additional discount applied |
| Total Invoice (×3 rows) / Invoice Total | Running invoice total, shown across three rows (likely by currency/component) before the final Invoice Total (highlighted) |
| Print Incentive/Commission/WHT (Y/N) | Whether these components are shown on the printed invoice |
| Receipts panel | Tracks payments received against this invoice |

### 4.4 Due Carrier / Due Agent Charges

Same charge-head structure as the Job (MAWB) Charges tab (2.9): Due Carrier / Bar Coding / Hawb Charges / AMS Charges / AWC Charges / Security Charges / Fuel SurCharge / Scanning Charges / CAA Charges, each with Curr, Rate, CW selector, FCR and PKR amount columns, plus blank rows for extra charge heads, and a Total Due Carrier. The Due Agent grid follows the same pattern (Air Waybill Fee, AIS Amount, plus PCS-based blank rows) with a scrollable list for many charge lines. A **Non-Printable Remarks** box sits below for internal notes.

### 4.5 Invoice Grid

| Column | Notes |
|---|---|
| Pcs / Gross Weight / Cl / Comdty / Ch.Weight | Same shipment-line detail as the Job Charges grid |
| Curr / Rate / Rate PKR | Currency and rate in both foreign and PKR |
| Freight / Freight PKR | Computed line freight in both currencies |

### 4.6 Airway Bill Grid (KB reconciliation)

| Column | Notes |
|---|---|
| Pcs / Gross Weight / Cl / Comdty / Ch.Weight / Rate / Rate PKR / Freight / Freight PKR | The job's actual Airway Bill freight lines, pulled in for comparison |
| Net Net / Net Rate | Net rate fields, mirroring the Job K.B. tab |
| KB % / KB Amount | Rate-difference percentage and resulting KB amount per line |
| Commission Amount / Payable A/L / Exchange Rate | Totals row: commission on the AWB freight, amount payable to the airline, and the exchange rate applied |

### 4.7 Detail/Search Tab

Multi-criteria search and listing screen for existing local invoices, with the same filter-then-list pattern and bulk-finalize action seen on the Job (MAWB) Detail/Search tab (2.12).

**Filter Fields**

| Field | Notes |
|---|---|
| Branch | Multi-select tag field (e.g. "KHI ×") |
| Party Code / A/Port of Dep / Destination / Consignee | Filter by customer, route, and consignee |
| Show Invoices (Final / Un-Final / Posted / Un-Posted / Void / Un-Void / All) | Status filter — adds Posted/Un-Posted (accounting posting status) alongside the Final/Void states seen on the Job screen |
| Check Date (Yes/No) + Starting Date / Ending Date | Optional date-range filter |
| Starting Invoice No. / Ending Invoice No. | Invoice number range (defaults ending to 999999, i.e. unbounded) |
| MAWB Job No. / MAWB No. | Filter by linked Master job |
| HAWB Job No. / HAWB No. | Filter by linked House job |

**Actions**

| Control | Notes |
|---|---|
| Show Detail | Applies filters and lists matching invoices in the grid below |
| Final Multiple Invoices | Bulk-finalizes all invoices in the current filtered result set — the invoice-level equivalent of Job's "Final Multiple AWB" |

**Results Grid** — a wide grid grouping columns under INVOICE, HAWB, MAWB, PARTY, and STATUS headers:

| Group | Columns |
|---|---|
| Action | Row-level actions |
| INVOICE | No., Date, Branch |
| HAWB | No., Job No. |
| MAWB | No., Job No. |
| (ungrouped) | Owner Name, Consignee, Airport of Departure, Destination, Chg. Wt., Invoice Total PKR |
| PARTY | Code, Name |
| STATUS | Final, Post, Void — each independently sortable/filterable |

### 4.8 Printing Tab

Controls invoice document type and print formatting — same pattern as the Job (MAWB) Printing tab (2.13), scaled to invoice-specific options. *Note: the reference screenshot is scrolled to the top and a scroll-down affordance is visible, so there may be additional options below "Print NTN No." not captured here.*

**Toolbar & Document Type**

| Field | Notes |
|---|---|
| Branch | Branch selector for the print job |
| PDF icon | Export as PDF (no Excel option here, unlike the Job screen) |
| Print (document type) | Invoice / Credit Note For Discounts Only / Sales Tax Invoice / PRA Tax Invoice |
| Print Invoice Heading as | Invoice / Sale Tax Invoice — controls the printed title |

**Batch & Layout Options**

| Field | Values | Notes |
|---|---|---|
| Starting Invoice No. / Ending Invoice No. | Number range | Print a batch of invoices in one run, mirroring the range filters on Detail/Search |
| Print On | Letter Pad / Plain Paper | Whether to print on pre-printed company letterhead or plain paper |
| Print In | PKR Currency / Foreign Currency | Which currency the invoice prints in |
| Print [copy type] | Original / Revised / Duplicate / Office Copy / Additional / Corrected | Watermark/label identifying which copy this printout represents |

**Content Toggles (Yes/No)**

| Option | Notes |
|---|---|
| Print Quotation No. on Invoice | Whether the originating quotation reference is shown |
| Print Due Date | Whether a payment due date is printed |
| Print Consignee | Whether consignee details are printed |
| Print SPO Code/Name | Whether SPO details are printed |
| Print Ex. Rate | Whether the exchange rate is printed (defaults Yes) |
| Print Received By | Whether a "received by" line is printed |
| Print Signatorys | Whether signatory line(s) are printed |
| Print NTN No. | Whether the National Tax Number is printed (defaults Yes) — relevant for tax-compliant invoicing |

### 4.9 Workflow

1. Confirm the related **Job (MAWB)/(HAWB)** is entered (Sections 2–3).
2. Open **Local Invoices Entry**, click **NEW**; select House and/or Master Job No. — HOUSE/MASTER panels auto-populate.
3. Confirm Owner/Party/Route/Form-E/S/B references; set currency and exchange rate(s).
4. Enter/verify **Due Carrier / Due Agent charges** (4.4) and the **Invoice grid** (4.5) freight lines.
5. Review the **Airway Bill grid** (4.6) for KB reconciliation against actual AWB freight; confirm KB % / KB Amount.
6. Compute **Sales Tax / PRA / WHT / Commission** (4.3); confirm Gross Invoice Amount → Invoice Total.
7. Save, then **FINAL** the invoice (or **VOID** to cancel).
8. Use **Detail/Search** to retrieve invoices, or **Final Multiple Invoices** to bulk-finalize.
9. Use **Printing** to generate Invoice / Sales Tax Invoice / PRA Tax Invoice / Credit Note For Discounts Only.
10. Downstream: invoice creates **AR** in Finance; cleared later by a **Receipt Voucher**, visible back on the Job's "USED/CLEARED in Vouchers" grid.

---

## 5. Other Charges Payable (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Other Charges Payable (Air-Export)

**Purpose:** records amounts the company owes to third-party vendors for a job — trucking, terminal handling, customs agent fees, and similar costs not billed by the airline itself. This is the accounts-payable counterpart to Local Invoices (Section 4, the receivable/billing side): Local Invoices bills the customer, Other Charges Payable tracks what's owed out. A single payable can span multiple Job/HAWB lines and multiple charge codes.

### 5.1 Toolbar

| Button | Function |
|---|---|
| SEARCH / TOP / BOTTOM / PREV / NEXT | Standard record navigation, consistent with other transaction screens |
| NEW / EDIT / DELETE | Standard record actions |
| FINAL | Locks the payable once confirmed — no VOID/COPY here, unlike Job (MAWB) |

### 5.2 Header Fields

| Field | Notes |
|---|---|
| Branch / Credit Note No. / Year / Date | Standard document header; Credit Note No. suggests this same screen (or a linked one) also issues credit notes against payables |
| Payable Type | Classification of the payable (lookup) |
| Due Date | Payment due date |
| Party | The vendor/party being paid |
| M/Job No. / Job Year / MAWB No. | Links the payable to a specific Master job |
| Gross Weight / Charge Weight | Auto-pulled from the linked job |
| Post in Local Currency (Y/N) | Whether this payable posts in local currency regardless of billing currency |
| Currency-1/2/3 + Ex Rate | Up to three currency/rate pairs, same multi-currency pattern as Local Invoices |
| Bill No. / Bill Date | The vendor's own bill/invoice reference and date |
| Remarks | Free-text notes |

### 5.3 Job/HAWB Allocation Grid

| Column | Notes |
|---|---|
| Job No. / HAWB No. | One payable can be split across multiple House jobs under the linked Master |
| Pcs / Grs.Weight / Ch.Weight | Shipment detail per line, for allocation |
| Cost / Party Name | Cost apportioned to that line and the associated party |
| Total row | Sums Pcs, weights, and Cost across all lines |

### 5.4 Other Charges Grid

| Column | Notes |
|---|---|
| Code / Description | Charge head code and description; first row is pre-labeled "Freight" |
| WT/PC | Charge basis selector — by weight or by piece |
| Curr | Currency for that line |
| QTY / Rate | Quantity and rate applied |
| F/Amount / PKR/Amount | Computed line amount in foreign currency and PKR |
| Grand Total / Total Charges | Rolled-up totals (highlighted) — Total Charges is the final payable amount |

### 5.5 Job History / Credit Note Grid

| Column | Notes |
|---|---|
| No. / Date / Payable Type | Credit note reference, date, and type |
| H/JOB No. | Linked House/Job number |
| Job Party (Code, Name) | Party on the original job |
| Credit Party (Code, Name) | Party the credit is issued to/from |
| Amount | Credit note amount |

### 5.6 Voucher Clearance & Attachment

**USED/CLEARED in Vouchers** mirrors the same panel seen on the Job (MAWB) screen (2.8) — showing which Finance voucher(s) this payable has been settled through. An attachment box (image icon) sits alongside it, likely for uploading the vendor's supporting bill/receipt.

### 5.7 Workflow

1. Vendor (trucker, handler, customs agent) issues a bill for services on a job.
2. Open **Other Charges Payable**, click **NEW**; select Payable Type, Party (vendor), M/Job No./MAWB No.
3. Enter Bill No./Bill Date, currency and exchange rate(s).
4. Allocate cost across one or more **Job/HAWB lines** (5.3).
5. Enter itemized **Other Charges** (5.4) — Code, WT/PC basis, Curr, Qty, Rate → F/Amount/PKR Amount; confirm Total Charges.
6. Save, then **FINAL** the payable.
7. If an adjustment is needed later, a **Credit Note** is raised against the payable (tracked in 5.5 Job History grid).
8. Downstream: payable creates **AP** in Finance; cleared later by a **Payment Voucher**, visible back in the "USED/CLEARED in Vouchers" panel (5.6).

---

## 6. Invoices To Foreign Agents (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Invoices To Foreign Agents (Air-Export)

**Purpose:** creates and finalizes an Air Export invoice for a foreign agent. The Entry screen links the invoice to MAWB/job references, captures the foreign agent, origin/destination, weights and currency, allocates related Job/HAWB lines, records selling and buying charges, calculates the difference/profit-share position, adds handling/service charges, and produces the total invoice amount. Bank details, consignee/reference information and receipts are also maintained on the same screen.

### 6.1 Tabs & Toolbar

| Tab | Purpose |
|---|---|
| Entry | Main foreign-agent invoice entry and costing screen |
| Detail/Search | Search/list existing foreign-agent invoices by branch, foreign agent and date range, with status filters and a bulk finalize action (6.9) |
| Printing | Print/export the foreign-agent invoice, with layout, currency, heading and copy-type options (6.10) |

The Entry toolbar follows the standard transaction pattern used elsewhere in Air Export:

| Button | Function |
|---|---|
| SEARCH | Find an existing foreign-agent invoice |
| TOP / BOTTOM / PREV / NEXT | Navigate to the first, last, previous, or next invoice record |
| NEW | Start a new invoice |
| EDIT | Edit the currently loaded invoice |
| DELETE | Delete the current invoice record |
| FINAL | Finalize/lock the invoice after review |
| VOID | Void the invoice without deleting its record |

### 6.2 Invoice Header & Shipment Reference

| Field | Notes |
|---|---|
| Branch | Operating branch selector (shown as KHI in the reference screen) |
| Invoice No. / Date | Invoice identifier and invoice date |
| MAWB Job No. / Year | Links the invoice to the relevant Master Air Export job and year |
| MAWB No. / MAWB Date | Master Air Waybill number and date associated with the selected job |
| Due Date | Payment due date for the invoice |
| Run No. | Operational run/reference number |
| F/Agent Doc. No. | Foreign-agent document/reference number |
| M.PP/CC | Prepaid/collect selection shown as PP/CC |
| F/Agent Code | Foreign agent lookup ("Select Foreign Agent ...") |
| Origin / Destination | Origin and destination lookups for the shipment |
| Pieces / Gross Weight / Charge Weight | Basic shipment quantity and weight fields used by the invoice |
| Remarks | Free-text remarks for the invoice |

### 6.3 Currency, References, Bank Detail & Receipts

| Field / Block | Notes |
|---|---|
| Post in PKR Currency (Y/N) | Controls whether the transaction is posted in PKR |
| Currency Code | Foreign/billing currency lookup |
| Exchange Rate | Exchange rate used for the invoice |
| REFERENCE / CONSIGNEE | Multi-line block for references and consignee information |
| BANK DETAIL | Bank selection and bank detail text to be associated with/printed on the invoice |
| RECEIPTS | Area for receipt-related information linked to the invoice |

### 6.4 Job / HAWB Allocation Grid

The lower-left grid allocates one or more shipment lines to the foreign-agent invoice and rolls the selected lines into a total.

| Column | Description |
|---|---|
| Job No. | Job reference for the allocated shipment line |
| HAWB No. | House Air Waybill number, where applicable |
| Pcs | Pieces for the allocated line |
| Gr.Weight | Gross weight |
| Ch.Weight | Chargeable weight |
| Cost | Cost amount associated with the line |
| Party Name | Party/customer name connected to the line |
| Total | Bottom-row total across the numeric allocation columns |

### 6.5 Selling & Buying Charges

The upper-right costing area separates revenue (Selling) from cost (Buying), so the invoice can show the commercial margin between the two.

| Column / Total | Notes |
|---|---|
| Code | Charge code/head |
| Description | Charge description |
| Rate | Rate used for the charge line |
| Charges | Charge amount. The screen visually provides two amount cells under the Charges heading |
| Total Selling | Sum of all Selling charge lines |
| Total Buying | Sum of all Buying charge lines |
| Difference | Calculated difference between total selling and total buying |
| Profit Share % | Profit-sharing percentage applied to the calculated difference/margin |

### 6.6 Handling / Service Charges & Invoice Total

A separate charge grid captures handling or service charges in addition to the Selling/Buying section.

| Column / Total | Notes |
|---|---|
| Code | Handling/service charge code |
| Description | Handling/service charge description |
| Rate | Rate for the service charge |
| Charges | Charge amount |
| Total Other Charges | Sum of all handling/service charge lines |
| Total Invoice Amount | Final invoice total shown at the bottom of the right-hand panel |

### 6.7 Auto Calculate Cost

The bottom strip contains an Auto Calculate Cost option and a compact costing grid. Based on the visible labels, it tracks shipment/cost references by year, C/N number, tracking/run number, packages, weight, cost and party name, with a total row. **The exact calculation trigger/business rule is not shown in the supplied screenshot and should be confirmed during implementation.**

| Visible Column | Notes |
|---|---|
| Year | Year reference |
| C/N No. | C/N reference |
| Tracking No. | Tracking reference |
| Run No. | Run reference |
| Pkgs | Package count |
| Weight | Weight used for the cost line |
| Cost | Calculated/entered cost |
| Party Name | Party linked to the cost line |

### 6.8 Workflow

1. Navigate: Freight → Transactions Menu (Air Export) → Invoices To Foreign Agents (Air-Export) → click **NEW**
2. Set Branch, Invoice Date, Due Date, MAWB Job No./Year, MAWB No./Date, Run No. and PP/CC status
3. Select Foreign Agent, Origin and Destination; enter Pieces, Gross Weight, Charge Weight and Remarks
4. Select posting currency option, Currency Code and Exchange Rate; complete Reference/Consignee and Bank Detail as required
5. Add the related Job/HAWB allocation rows and verify Pieces, Weights, Cost and Party Name totals
6. Enter Selling charge lines (Code, Description, Rate, Charges) and verify Total Selling
7. Enter Buying charge lines and verify Total Buying; review Difference and Profit Share %
8. Add Handling / Service Charges and verify Total Other Charges
9. Review the final Total Invoice Amount and any Auto Calculate Cost / receipt information
10. Save the invoice, review it, then use **FINAL** when complete (use **VOID** if the transaction must be cancelled)
11. Use Detail/Search to retrieve existing invoices and Printing to produce the foreign-agent invoice once those tab flows are confirmed

### 6.9 Detail/Search Tab

**Path:** Freight → Transactions Menu (Air Export) → Invoices To Foreign Agents (Air-Export) → Detail/Search

**Purpose:** searches and lists existing foreign-agent invoices by branch, foreign agent and date range, with status filters and a bulk finalize action, before drilling into a result in a detail grid.

**6.9.1 Search Criteria**

| Field | Notes |
|---|---|
| Branch | Branch filter, shown as a removable tag (KHI) rather than a plain dropdown — suggests more than one branch can be selected at once |
| F/Agent Code | Foreign agent lookup ("Select Foreign Agent …."), with a clear (x) control |
| Check Date | Yes/No toggle controlling whether the date range below is applied to the search (shown as Yes) |
| Give Starting Date / Give Ending Date | Date-range filter on the invoice date, each with a calendar picker |

**6.9.2 Status Filter & Actions**

| Control | Notes |
|---|---|
| SELECT | Applies the criteria above to build the working result set |
| Final / Un-Final / Posted / Un-Posted / Void / Un-Void / All | Radio filter narrowing results by invoice status; All is shown selected. Posted/Un-Posted is a status not seen on the Entry toolbar, so posting is evidently tracked separately from Final/Void |
| Show Detail | Runs the filter and populates the grid below |
| Final Multiple Invoices | Bulk-finalizes every invoice in the current filtered result set in one action |

**6.9.3 Result Grid** — lists matching foreign-agent invoices, grouped under banded column headers, with inline search and paging (Show [N] entries / Search box / Showing X to Y of Z entries / Previous-Next):

| Column Group | Columns |
|---|---|
| Action | Row-level actions (view/edit) |
| Invoice | No. / Date / Branch — the invoice's own identifiers |
| Master Air | Job / Air Waybill No. — the linked Master job and MAWB number |
| Foreign Agent | Code / Description — the billed agent |
| Route | Origin / Destination |
| Curr. | Billing currency for the invoice |
| Amounts | Foreign / PKR — invoice amount in the billing currency and its PKR equivalent |
| Status | Final / Post / Void — sortable status flags matching the filter options above |

### 6.10 Printing Tab

**Path:** Freight → Transactions Menu (Air Export) → Invoices To Foreign Agents (Air-Export) → Printing

**Purpose:** prints/exports a single foreign-agent invoice, with layout, currency and heading options and a choice of which physical copy is produced.

**6.10.1 Selection & Output**

| Field / Control | Notes |
|---|---|
| Branch / Invoice No. | Selects the specific invoice to print |
| PDF icon | Generates the printable output as a PDF |

**6.10.2 Print Options**

| Option | Values (default shown) |
|---|---|
| Print On | Letter Pad / Plain Paper — Plain Paper selected |
| Print In | PKR Currency / Foreign Currency — Foreign Currency selected |
| Print Heading As | Invoice / Debit Note — Invoice selected. Debit Note suggests the same layout can double as a debit note against the foreign agent |
| Print Signatorys | Yes/No — No selected, same toggle name/pattern as the Local Invoices Printing tab (4.8) |
| Print | Original / Revised / Duplicate / Office Copy — Original selected. Distinct from the AWB copy checklist on Job (MAWB) Printing (2.13); this is a single-copy-type radio choice rather than a multi-copy checklist |

### 6.11 Implementation Notes

- Reuse the same standard transaction toolbar behavior already implemented for Job and Local Invoice screens (search/navigation/new/edit/delete/final/void).
- Treat Selling, Buying and Handling/Service Charges as repeatable line-item collections with calculated totals.
- Keep Difference, Profit Share %, Total Other Charges and Total Invoice Amount as calculated/read-only outputs unless the business confirms manual override is allowed.
- Link the invoice to the selected MAWB Job and related HAWB allocation rows so the transaction remains traceable from the Job screen.
- Detail/Search supports multi-status filtering (Final/Un-Final/Posted/Un-Posted/Void/Un-Void) and a bulk "Final Multiple Invoices" action; confirm whether Posted/Un-Posted is a status distinct from Final that needs its own handling elsewhere in the module.

---

## 7. Credit Notes To Foreign Agents (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Credit Notes To Foreign Agents (Air-Export)

**Purpose:** raises a credit note against a foreign agent — the adjustment/reversal counterpart to Invoices To Foreign Agents (Section 6). Structurally this is the same screen as Section 6: the same three tabs (Entry, Detail/Search, Printing), the same toolbar, the same Selling/Buying/Difference/Profit Share costing layout, the same Job/HAWB allocation grid, and the same Detail/Search filters and Printing options.

### 7.1 Differences from Invoices To Foreign Agents (Section 6)

| Area | Notes |
|---|---|
| Screen title / breadcrumb | Reads "Credit Notes To Foreign Agents (Air-Export)" throughout, instead of "Invoices To Foreign Agents (Air-Export)" |
| Entry tab document-number field | Labeled "Credit Note No." — the equivalent field on the Invoice screen (6.2) is "Invoice No." |
| Printing tab document-number field | Still labeled "Invoice No." rather than "Credit Note No." — appears to be reused from the Invoice screen without relabeling; **confirm whether this is intentional or an oversight before build** |
| Detail/Search result grid | The first column group is still headed "INVOICE" (No. / Date / Branch), same as 6.9.3 — the same likely-reused-label point applies here |

### 7.2 Fields, Grids & Workflow

All other fields and controls — header fields (Branch, MAWB Job No., Mawb No./Date, Due Date, Run No., F/Agent Doc. No., M.PP/CC, F/Agent Code, Origin, Destination, Pieces, Gross/Charge Weight, Post in PKR Currency, Currency Code, Exchange Rate, Remarks), the Reference/Consignee, Bank Detail and Receipts panels, the Job/HAWB allocation grid and Auto Calculate Cost strip, the Selling/Buying/Difference/Profit Share costing panel, the Handling/Service Charges grid and totals, the Detail/Search criteria and status filters, and the Printing options — **match Sections 6.2 through 6.10 exactly by label and layout.** Refer to those sections for field-by-field detail rather than repeating them here.

---

## 8. Invoices/Dr. Notes Received From Foreign Agents (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Invoices/Dr. Notes Received From Foreign Agents (Air-Export)

**Purpose:** records an invoice or debit note received **FROM** a foreign agent — the incoming/payable-side counterpart to Invoices To Foreign Agents (Section 6), which bills the agent (receivable side). Structurally this is again the same screen as Section 6: the same three tabs (Entry, Detail/Search, Printing), the same toolbar, the same Selling/Buying/Difference/Profit Share costing layout, the same Job/HAWB allocation grid, and the same Detail/Search filters and Printing options.

### 8.1 Differences from Invoices To Foreign Agents (Section 6)

| Area | Notes |
|---|---|
| Screen title / breadcrumb | Breadcrumb reads "Invoices/Dr. Notes Received From Foreign Agents (Air-Export)"; the entry-screen title bar reads "Invoice/DN Received From F/Agent (Air-Export)", instead of "Invoice To Foreign Agent (Air-Export)" |
| Direction | Captures an invoice or debit note issued by the foreign agent to this company (money owed out), rather than an invoice this company raises against the agent (money owed in) as on Section 6 |
| Document-number field | Labeled "Invoice No." consistently across all three tabs (Entry, Detail/Search's INVOICE column group, and Printing) — unlike Credit Notes (Section 7), there is no mismatched "Credit Note No."/"Invoice No." labeling here |

### 8.2 Fields, Grids & Workflow

All other fields and controls — header fields (Branch, MAWB Job No., Mawb No./Date, Due Date, Run No., F/Agent Doc. No., M.PP/CC, F/Agent Code, Origin, Destination, Pieces, Gross/Charge Weight, Post in PKR Currency, Currency Code, Exchange Rate, Remarks), the Reference/Consignee, Bank Detail and Receipts panels, the Job/HAWB allocation grid and Auto Calculate Cost strip, the Selling/Buying/Difference/Profit Share costing panel, the Handling/Service Charges grid and totals, the Detail/Search criteria and status filters, and the Printing options — **match Sections 6.2 through 6.10 exactly by label and layout.** Refer to those sections for field-by-field detail rather than repeating them here.

---

## 9. Credit Notes Received From Foreign Agents (Air-Export)

**Path:** Freight → Transactions Menu (Air Export) → Credit Notes Received From Foreign Agents (Air-Export)

**Purpose:** records a credit note received **FROM** a foreign agent — the incoming/payable-side counterpart to Credit Notes To Foreign Agents (Section 7), in the same way that Invoices/Dr. Notes Received From Foreign Agents (Section 8) is the received-side counterpart to Invoices To Foreign Agents (Section 6). Structurally this is again the same screen: the same three tabs (Entry, Detail/Search, Printing), the same toolbar, the same Selling/Buying/Difference/Profit Share costing layout, the same Job/HAWB allocation grid, and the same Detail/Search filters and Printing options.

### 9.1 Differences from Credit Notes To Foreign Agents (Section 7)

| Area | Notes |
|---|---|
| Screen title / breadcrumb | Reads "Credit Notes Received From Foreign Agents (Air-Export)" / "Credit Notes Received From F/Agent (Air-Export)", instead of "Credit Notes To Foreign Agents (Air-Export)" |
| Direction | Captures a credit note issued by the foreign agent to this company (reducing an amount owed out), rather than a credit note this company raises against the agent (reducing an amount owed in) as on Section 7 |
| Entry tab document-number field | Labeled "Credit Note No.", same as Section 7's Entry tab |
| Printing tab document-number field | Still labeled "Invoice No." rather than "Credit Note No." — the same reused-label point noted on Section 7 (7.1); **confirm before build** |
| Detail/Search result grid | The first column group is still headed "INVOICE" (No. / Date / Branch), same as Sections 6.9.3 and 7.1 — the same likely-reused-label point applies here |

### 9.2 Fields, Grids & Workflow

All other fields and controls — header fields (Branch, MAWB Job No., Mawb No./Date, Due Date, Run No., F/Agent Doc. No., M.PP/CC, F/Agent Code, Origin, Destination, Pieces, Gross/Charge Weight, Post in PKR Currency, Currency Code, Exchange Rate, Remarks), the Reference/Consignee, Bank Detail and Receipts panels, the Job/HAWB allocation grid and Auto Calculate Cost strip, the Selling/Buying/Difference/Profit Share costing panel, the Handling/Service Charges grid and totals, the Detail/Search criteria and status filters, and the Printing options — **match Sections 6.2 through 6.10 exactly by label and layout.** Refer to those sections for field-by-field detail rather than repeating them here.

---

## 10. Letter for Sales Report/Covering Letter

**Path:** Freight → Transactions Menu (Air Export) → Letter for Sales Report/Covering Letter

**Purpose:** generates a printable covering letter to accompany a sales report submission — the Covering Letter step that closes the Air Export job lifecycle (AWB Stock → … → Credit Notes Received From Agents → Covering Letter). Unlike the transaction screens in Sections 1–9, this is a **single-screen report generator** with no Entry/Detail-Search/Printing tab structure and no record-level toolbar (SEARCH/NEW/EDIT/etc.) — it simply selects a letter type and branch, then exports directly to PDF.

### 10.1 Fields & Controls

| Field / Control | Notes |
|---|---|
| Branch | Branch selector for the letter (shown as KHI) |
| Letter For Sales Report Cheques To Airline | Radio option — generates a covering letter for cheques being sent to the airline against the sales report |
| Sales Report Covering Letter | Radio option — generates the general covering letter for the sales report submission itself |
| PDF icon | Generates the selected letter as a PDF |

### 10.2 Open Questions

The screen does not show which sales report or date range the letter is generated for — this may be implicit (e.g. the current/most recent sales report for the branch) or may require a selection not visible in the reference screenshot. **Confirm the scope/period logic behind each letter type before build.**

---

## 11. Letter of Issuance of Stock

**Path:** Freight → Transactions Menu (Air Export) → Letter of Issuance of Stock

**Purpose:** generates a formal letter to an airline confirming/requesting the issuance of AWB stock — the correspondence counterpart to the Air Waybill Stock screen (Section 1), which records the AWB ranges once received. Like the Covering Letter screen (Section 10), this is a **single-screen report generator** rather than a transaction screen: no Entry/Detail-Search/Printing tab structure and no record-level toolbar, just a form that exports directly to PDF or Excel.

### 11.1 Fields & Controls

| Field / Control | Notes |
|---|---|
| Airline Code | Lookup selecting the airline the letter is addressed to |
| Recipient line (unlabeled) | Pre-filled with "THE CARGO MANAGER" — the addressee's title/role, ahead of the Airline Name/Address block below it |
| Airline Name | Free-text airline name for the letterhead, likely auto-fillable from Airline Code |
| Address | Three free-text lines for the airline's mailing address |
| Attention Person | Named contact the letter is directed to, distinct from the generic "THE CARGO MANAGER" line above |
| Letter Date | Date the letter is issued, with a calendar picker; defaults to the current date |
| No. Of AWBs | Count of AWB numbers the letter covers |
| Bearer Of Letter | Name of the person physically carrying/delivering the letter to the airline |
| CNIC | National ID number of the bearer, for the airline's verification/records |
| Signatory Code | Lookup selecting who signs the letter; shown disabled/greyed in the reference screenshot, so its enabling condition is unclear |
| Owner Code | Lookup selecting the branch/entity that owns the AWB stock (same role as Owner Code on the AWB Stock screen, 1.2); also shown disabled here |
| Print On | Letter Pad / Plain Page — Plain Page selected |
| PDF / Excel icons | Exports the letter as PDF or Excel — the only screen documented so far with an Excel export option alongside PDF |

### 11.2 Open Questions

Signatory Code and Owner Code appear disabled in the reference screenshot; **confirm what enables them** (e.g. an Airline Code selection) and whether they are required before the letter can be generated. It's also worth confirming whether this screen reads directly from AWB Stock (Section 1) records — e.g. pulling No. Of AWBs from a selected receipt — or is filled independently.

> This document will be extended further if additional Air Export screens are shared.

---

# Part 2 — Transactions Menu (Sea Export)

**Path:** Freight → Transactions Menu (Sea Export) → Jobs Entry and Documents Printing (Sea-Export)

**Purpose:** manages the operational Sea Export job lifecycle in one multi-tab screen. The reference screens show eight tabs: **Entry, B/L Screen, Container, Job Charges, Detail/Search, Printing, Consol, and Instruction Letter.** The Job No. is the anchor record linking shipment, bill-of-lading, container, costing, consolidation, search/status, and print information.

## 12. Jobs Entry and Documents Printing (Sea-Export)

### 12.1 Entry Tab

The Entry tab is the main operational record. It combines job identification, customer/agent references, shipment routing, cargo measurements, documentation milestones, invoice flags, container summary, consol history, and voyage/transshipment dates.

Confirmed against the reference screenshot: top nav is **Freight · Finance · Reports · Reports (MIS) · Reports (Finance) · Management · Dashboard · My Portal**; breadcrumb is **Freight › Transactions Menu (Sea Export) › Jobs Entry and Documents Printing (Sea-Export)**; tab bar is **Entry · B/L Screen · Container · Job Charges · Detail/Search · Printing · Consol · Instruction Letter**.

| Field / Control | Purpose / Notes |
|---|---|
| Toolbar | SEARCH, TOP, BOTTOM, PREV, NEXT, NEW, EDIT, DELETE, FINAL, CLOSE, VOID and COPY provide the standard job lifecycle actions |
| Branch / Job No. / Date / Job Type | Core job identity. Job Type is mandatory (marked with a red asterisk) |
| Load Program No. / Consol No. / Consol [Y/N] / Nomination | Links the job to load/consolidation processing and records nomination status |
| Party Code / Sub Agent's Party / Commodity | Customer, sub-agent and cargo classification references. Party Code is mandatory |
| Foreign Agent / Shipping Line / S/Line Agent / Delivery Agent | Operational parties used for overseas, carrier and delivery coordination |
| SPO Code / Port of Load / Destination / Wharf / Terminal / Clearing Agent | Commercial attribution and routing/handling references. Port of Load and Destination are mandatory |
| Status / Date / Booking No. | Job status and booking reference |
| CONSOL TOTAL / LAST CONSOL No. | CBM, Gross/Net Weight, No. of Packages, UOM, No. of Shipments summarized for the consol/job, alongside the last consol number |
| LCL/FCL / CY/CFS / CY/CFS Cutt Off / RO No. | Shipment mode and terminal handling controls. LCL/FCL is mandatory; each of LCL/FCL and CY/CFS has its own M.PP/CC and H.PP/CC (Prepaid/Collect) selector |
| No. of Packages / Unit / No. of Pcs (QTY) / Unit (QTY) / Currency Code / Exchange Rate | Cargo quantity, currency and costing inputs |
| Grs Weight / Net Weight / Vol.Weight / CBM / CBM Rate | Weight and volume measurements |
| IncoTerm / HS Code / Stack Code / Run No. | Trade-term, customs and operational references |
| SHIPPER INVOICE | Inv. No., Date, Currency Code, Amount and P.O. No. |
| CC Date / Form 'E' Date + Date / FormE/F.Ins. No.(2) + Date / FormE/F.Ins. No.(3) + Date / Ship Received Date | Export documentation dates and multiple Form-E/Insurance reference lines |
| Cutt Off Date / SI File Cutt Off / Hand Over to S/L / Doc. Received / SI Filed / Doc. Despatch Date | Document milestone block: cutoffs, handover, filing, and dispatch, several with both date and time (HH:MM) |
| S/B No. / S/B Place / S/B Date / M.R. No. / M.R Date / EGM | Shipping Bill and Mate's Receipt references, plus Export General Manifest number |
| MBL No. / MBL Date / MBL Received / HBL Type / HBL No. / HBL Date / Sailing Date / PickUp/Stuffing | Bill-of-lading identifiers and key sailing/stuffing dates |
| Container grid (below header) | Columns: Container No., Size/Type, Seal No., ISO Code, Vehicle No., Vehicle Date, Vehicle ETA, Vehicle ATA — lists containers linked to this job (detail maintained on the Container tab, 12.3) |
| Invoice Required / Local Invoice / Int'l Invoice | Downstream finance flags (Y/N) |
| Shipping Line / Payable To S/L / Refund From S/L | Carrier-payment flags (Y/N) |
| DD Ship | Flag (Y/N) — abbreviation not spelled out on-screen; confirm meaning with business owner |
| Shipment Delivered / Delivered Date / Release Message Date / Pre-Alert Date / Shipment Containerized | Shipment milestone flags and dates |
| NON-PRINTABLE REMARKS | Internal free-text notes box |
| CONSOL grid | Job No., Container No., Size, Vessel, Voyage — "No Consol Job found." shown when empty |
| Job History grid | No, Date, Year, Type, Name, Curr, F/Amount, PKRAmount, Final — "No Record found." shown when empty |
| POL ETA / POL ETD / ETA At Dest (+ HH:MM and checkboxes) / Vessel / Voyage / Rotation No. | Voyage schedule for the primary leg |
| T/Ship Point 1–4 (Enter Destination Code) + ETA / ETD + Vessel / Voyage | Up to four transshipment points, each with its own ETA/ETD and Vessel/Voyage fields |
| C/N Details () / C/N No. / Manual C/N | Credit-note references linked to the job |

### 12.2 B/L Screen Tab

The B/L Screen captures Bill of Lading content and print-oriented shipment text. It is opened in **EDIT** mode and includes party/address blocks, vessel/routing information, freight charge text, marks/numbers, and description of packages and goods.

| Field / Control | Purpose / Notes |
|---|---|
| HBL Type / MBL No. / HBL No. / Doc/Ref. # | Bill-of-lading identification and reference fields |
| Party Code / Agent Party / Address | Shipper/party and agent details used on the B/L |
| Consignee / Notify / Also Notify | Multi-line B/L address and notification blocks |
| Delivery Agent | Destination delivery agent and address lines |
| Form E No. / Date / Vessel / Voyage | Export document and vessel identification |
| Place of Receipt / Loading / Discharge / Delivery | Full B/L movement route |
| Freight Payable At / No. of Orig B/Ls / Country of Origin / Place of Issue / HBL Date | B/L issue and freight terms |
| FOB/CIF / CBM / Gross Weight / Vol. Weight / Net Weight | Commercial basis and cargo measurements |
| Booking No. / Loading Pier / Reference / B/L Released At / MOP | Carrier/booking and release/payment references (MOP — mode/method of payment; confirm exact meaning) |
| Freight Charges Text / Rate / Prepaid / Collect | Printable freight charge lines |
| Marks & Nos. / Description of Packages and Goods | Large printable cargo-description areas |
| SHEET | Continuation/extra-sheet area for B/L content |

### 12.3 Container Tab

The Container tab creates and maintains container-level records linked to the Sea Export job. The **NEW** action enables a new container entry, while the grid below lists existing container records.

| Field / Control | Purpose / Notes |
|---|---|
| Serial No. / Container No. | Container sequence and container identifier |
| Size / ISO Code / Container Types | Container classification |
| Seal No. | Seal/security reference |
| Vehicle Type / Vehicle No. / Vehicle Date | Truck/vehicle information associated with container movement |
| POL ETA / POL ATA / PCD | Port and container movement dates (PCD — confirm exact meaning) |
| Transporter Name / Driver Name / Mobile No. | Transport provider and driver contact information |
| Charges | Container/transport charge amount |
| From (POL) / To (POD) | Container movement origin and destination |
| No. of Pkgs / Unit / CBM / Gross Weight / Net Weight | Container cargo quantity and measurements |
| Container Grid | Lists Action, Serial No., Container No., Size, Container Types, Seal No., PCD, Vehicle No. and Vehicle Date with search/paging |

### 12.4 Job Charges Tab

The Job Charges tab records selling and buying charges for the job and provides the gross-profit summary. The reference screen shows three currency/exchange-rate rows and a large Other Charges grid.

| Field / Control | Purpose / Notes |
|---|---|
| Curr / Ex.Rate | Up to three currencies and exchange rates for charge conversion |
| Party Code / Sub Agent Code / Port of Load / Destination | Context carried from the job for costing |
| Other Charges — Code / Description / Curr | Charge-head identification and currency |
| Sell F/Amount | Selling amount in foreign currency |
| Buy F/Amount | Buying/cost amount in foreign currency |
| Total Charges | Totals at the bottom of the Sell and Buy columns |
| Total G/P Amount | Calculated gross-profit amount |
| Total G/P Less KB | Gross profit after KB-related adjustment, where applicable (same "K.B." concept as Air Export — confirm exact business meaning) |

### 12.5 Detail/Search Tab

This tab provides filtered job retrieval and status-based bulk review. The result grid exposes the key operational fields for matching jobs.

| Field / Control | Purpose / Notes |
|---|---|
| Branch / Party Code / Commodity / Shipping Line / S/Line Agent / SPO Code | Primary entity and commercial filters |
| Origin / Destination / LCL/FCL / HBL Type / Nomination | Routing and shipment-type filters |
| Check Date Yes/No / Starting Date / Ending Date | Controls whether the date range is applied |
| Consol No. / Booking No. / MBL No. / HBL No. / S/B No. / Packages / Vessel / Container No. / Seal No. | Specific shipment-reference filters |
| Status radio buttons | Final, Un-Final, Post, Un-Posted, Void, Un-Void, Closed, Un-Closed or All |
| Show Detail | Runs the selected filters and populates the grid |
| Result Grid | Job No./Date/Branch/Type, Booking No., MBL/HBL No., Commodity, LCL/FCL, Container Nos., Vessel, ETD, PCS, Gross Weight, Party/Agent/SPO, Shipping Line/Agent, Loading/Discharge Place, Ship Invoice No., Form-E No., Consol No. and Final/Void/Closed status |

### 12.6 Printing Tab

The Printing tab selects the Sea Export operational document to generate. PDF and Excel export buttons are available at the upper-right of the screen. The lower panel changes according to the selected print option.

| Field / Control | Purpose / Notes |
|---|---|
| Branch / Job No. | Identifies the job to print |
| Shipment Status Report | Selected in the reference screen; opens options for Letter Pad/Plain Paper, Today's Date, Attention and Note |
| HBL Printing / Cargo Manifest / Extra Sheet | Core shipping-document outputs |
| Release Instructions / Shipment Pre-Alert (Job) | Operational release and pre-alert outputs |
| Stuffing Detail (Single Job) / Instruction Letter / Master B/L Specimen / Outer | Additional job documents |
| Letter of Instruction For Custom Clearing / Forwarder's Cargo Receipt / Surrendering Letter | Customs/forwarder documentation |
| B/L Back Side Printing / Job Charges Sheet / FMC Rate Filing Sheet | B/L and costing/compliance outputs |
| Stuffing Plan (Consol) / Shipment Pre Alert (Consol) / Release Instruction (Consol) | Consolidation-level outputs |
| PDF / Excel | Exports the selected report/document in the chosen format |

### 12.7 Consol Tab

The Consol tab creates or updates a consolidation record and associates eligible Sea Export jobs with it. The left panel filters jobs; the middle and right panels hold consol, carrier, container and sailing details; the grid below is used to select jobs for the consolidation.

| Field / Control | Purpose / Notes |
|---|---|
| Branch / Last Consol No. / LCL-FCL | Consolidation identity and mode |
| Check Date / Starting Date / Ending Date / Consol No. | Filter criteria for finding jobs to consolidate |
| Show Jobs Consol — Marked Yes / Marked No / Both | Controls which jobs are included in the result set |
| Consol No. | Current consolidation number |
| Foreign Agent / Shipping Line / S/Line Agent | Parties associated with the consol |
| Port of Load / Port of Discharge / Wharf / Terminal | Consolidation routing and terminal details |
| MBL No. / Date | Master Bill of Lading reference for the consol |
| Vessel / Voyage / Rotation No. | Voyage identifiers |
| Container No. / Size / Container Types / Seal No. | Consol container details |
| PickUp/Stuffing / Cut Off Date / Sailing Date / POL ETA / POL ETD / ETA At Dest | Key consol shipment dates |
| Show Detail / Update | Loads matching jobs and saves consolidation assignments |
| Job Selection Grid | Consol No., Job No./Date/Branch/Type, MBL/HBL No., LCL/FCL, Container Nos., Vessel, Voyage, ETD, PCS, Gross Weight, Party/Agent/SPO, Shipping Line, Loading Place and Discharge Place |

### 12.8 Instruction Letter Tab

The Instruction Letter tab captures the data required for an instruction-letter document. It closely follows the B/L layout but focuses on shipment instructions and provides an **EDIT** action.

| Field / Control | Purpose / Notes |
|---|---|
| MBL No. / HBL No. / Doc/Ref. # | Shipment and document references |
| Party Code / Agent Party / Address | Party details for the letter |
| Consignee / Notify / Also Notify | Recipient and notification address blocks |
| Delivery Agent | Delivery-agent details |
| Form E No. / Date / Vessel / Voyage | Export and voyage references |
| Place of Receipt / Loading / Discharge / Delivery | Movement route |
| Freight Payable At / No. of Orig B/Ls | Freight term and original B/L count |
| CBM / Gross Weight / Vol. Weight / Net Weight | Cargo measurements |
| Booking No. / Reference / MOP | Booking/reference and payment term |
| Marks & Nos. / Description of Packages and Goods | Large instruction/cargo text areas |
| SHEET | Continuation sheet area for additional instruction content |

### 12.9 Sea Export End-to-End Workflow

1. Open Freight → Transactions Menu (Sea Export) → Jobs Entry and Documents Printing (Sea-Export).
2. Create the job on **Entry**: select branch/job type, parties, routing, shipping line/agents, shipment mode and cargo details.
3. Complete shipment/document milestone dates and finance flags; save the job and use **FINAL/CLOSE** when operationally appropriate.
4. Complete the **B/L Screen** with shipper/consignee/notify details, routing, freight terms, marks and cargo description.
5. Add one or more **Container** records with size/type, seal, vehicle/transporter and weight/CBM details.
6. Enter **Job Charges**: currencies/exchange rates and selling/buying charge lines; review gross profit.
7. For consolidated shipments, use **Consol** to create/update the consol and assign eligible jobs, then record MBL, vessel, container and sailing dates.
8. Use **Instruction Letter** when shipment-specific instruction documentation is required.
9. Use **Detail/Search** to retrieve jobs by party, route, carrier, dates, shipment references and status.
10. Use **Printing** to generate the required job or consol documents and export them to PDF/Excel.

### 12.10 Implementation Notes / Open Questions

The documentation above is based strictly on the supplied Sea Export screenshots. Several fields use internal business abbreviations (for example **DD Ship, MOP, PCD and KB**) whose exact business definitions are not visible on-screen; **these should be confirmed with the business owner** before assigning stricter validation or accounting rules. The visible UI clearly establishes the field placement, tab relationships, job/consol linkage, status controls and print options.

---

## Appendix — Screen ↔ Figure Reference Map

For traceability back to the original reference screenshots embedded in `project plan.docx`:

| Section | Figure(s) | Screen / Tab |
|---|---|---|
| 1 | 1.1, 1.2, 1.3 | Air Waybill Stock (main, single-entry mode, bulk-range popup) |
| 1.7 | 1.2 (workflow) | Air Waybill Stock workflow diagram |
| 2 | 2.1–2.4 | Job (MAWB) Entry tab bar/toolbar + 3 field-group screenshots |
| 2.9 | 2.5 | Job (MAWB) Charges tab |
| 2.10 | 2.6 | Job (MAWB) K.B. tab |
| 2.11 | 2.7 | Job (MAWB) Remarks tab |
| 2.12 | 2.8 | Job (MAWB) Detail/Search tab |
| 2.13 | 2.9 | Job (MAWB) Printing tab |
| 2.14 | 2.5 (workflow) | Job (MAWB) workflow diagram |
| 4 | 4.1–4.6 | Local Invoices Entry: tab bar, header, tax/totals, charges, invoice grid, AWB grid |
| 4.7 | 4.7 | Local Invoices Detail/Search tab |
| 4.8 | 4.9 | Local Invoices Printing tab |
| 4.9 | 4.10 (workflow) | Local Invoices workflow diagram |
| 5 | 5.1–5.6 | Other Charges Payable: header/toolbar, header fields, allocation grid, charges grid, history grid, voucher/attachment |
| 5.7 | 5.7 (workflow) | Other Charges Payable workflow diagram |
| 6 | 6.1 | Invoices To Foreign Agents: Entry tab |
| 6.9 | 6.3 | Invoices To Foreign Agents: Detail/Search tab |
| 6.10 | 6.4 | Invoices To Foreign Agents: Printing tab |
| 7 | 7.1, 7.2, 7.3 | Credit Notes To Foreign Agents: Entry, Detail/Search, Printing |
| 8 | 8.1, 8.2, 8.3 | Invoices/Dr. Notes Received From Foreign Agents: Entry, Detail/Search, Printing |
| 9 | 9.1, 9.2, 9.3 | Credit Notes Received From Foreign Agents: Entry, Detail/Search, Printing |
| 10 | 10.1 | Letter for Sales Report/Covering Letter |
| 11 | 11.1 | Letter of Issuance of Stock |
| 12.1 | 12.1 | Sea Export Jobs: Entry tab |
| 12.2 | 12.2 | Sea Export Jobs: B/L Screen tab |
| 12.3 | 12.3 | Sea Export Jobs: Container tab |
| 12.4 | 12.4 | Sea Export Jobs: Job Charges tab |
| 12.5 | 12.5 | Sea Export Jobs: Detail/Search tab |
| 12.6 | 12.6 | Sea Export Jobs: Printing tab |
| 12.7 | 12.7 | Sea Export Jobs: Consol tab |
| 12.8 | 12.8 | Sea Export Jobs: Instruction Letter tab |

*Original screenshots remain embedded in `project plan.docx` (Word media parts `word/media/*.png` and `word/media/image1.png`–`image22.png`) for pixel-level reference during implementation.*
