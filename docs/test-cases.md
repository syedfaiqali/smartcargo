# SmartCargo — Module-Wise Test Cases

Is document mein SmartCargo (Freight Forwarding ERP) app ke tamam modules ke test cases diye gaye hain. Har module ke liye positive, negative aur edge case scenarios cover kiye gaye hain.

**Legend:** `Pass/Fail` column QA use kare, expected result already diya gaya hai.

---

## 1. Master Data Module (Initial Setup — 23 Pages)

Sab pages `EditableCodeTable` component use karte hain (Airline Codes, Owner Codes, Party Codes, Foreign Agent Codes, Airport Codes, SPO Codes, Currency Codes, Agent Codes, Bank Codes, Payable Type Codes, Shipping Line Codes, Sea Port Codes, Sector Codes, Country Codes, Commodity Codes, Container Types, Sub Agent Parties, Associate Codes, Chargeable Codes, Invoice Charge Codes, Signatory Codes, Job Types, Job Status, Terms and Conditions). Neeche diye test cases har page par apply hote hain.

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| MD-01 | Add record with valid Code | "Add" click karein, Code field mein valid value (e.g. "TST") enter karein, other fields fill karein, check-icon click karein | Naya row table mein add ho jaye |
| MD-02 | Add record with blank Code | "Add" click karein, Code field khali chhorein, save karein | Error message "`<Label>` is required." show ho, save block ho |
| MD-03 | Add record with whitespace-only Code | Code field mein sirf spaces enter karein, save karein | Error show ho, save block ho (trim validation) |
| MD-04 | Add duplicate Code | Ek existing Code (e.g. seed data se "PK") dobara enter karein, save karein | **Known gap:** save ho jayega, koi uniqueness error nahi aayega |
| MD-05 | Cancel Add | "Add" click karein, kuch data enter karein, "X" (cancel) click karein | Row add nahi hoga, list unchanged rahe |
| MD-06 | Edit existing record | Kisi row ka pencil icon click karein, field value change karein, check-icon click karein | Updated value table mein reflect ho |
| MD-07 | Edit — blank Code | Existing record edit karte waqt Code field khali karein, save karein | Error show ho, save block ho |
| MD-08 | Cancel Edit | Edit mode mein value change karein, "X" click karein | Original value restore ho, koi change save na ho |
| MD-09 | Delete record | Trash icon click karein | Record turant delete ho jaye (koi confirmation dialog nahi) |
| MD-10 | Empty state | Sab records delete kar dein | "No records yet — use Add to create one." message show ho |
| MD-11 | Numeric field with non-numeric input (Party Codes → Credit Limit, Currency Codes → Default Ex. Rate) | Number field mein text (e.g. "abc") enter karein | Silently `0` ban jaye, error na aaye |
| MD-12 | Select field (Agent Codes → Kind, Group Codes → Type, Control Codes → Group) | Dropdown open karein | Sirf fixed options list dikhe, free text allow na ho |
| MD-13 | Data persistence | Record add karein, page reload karein | Record `localStorage` se persist ho, list mein maujood rahe |
| MD-14 | Seed data verification | Fresh/cleared storage par app open karein | Har master data page apne default seed records ke sath load ho (e.g. Airline: PK, EK, QR, TK, CX) |
| MD-15 | Control Codes — no Group Codes exist | Group Codes ki list empty kar dein, Control Codes page open karein | Table ke bajaye Alert show ho ("no group codes" warning), table hide ho |
| MD-16 | Control Codes — Group dropdown default | Group Codes list ho, Control Codes mein naya record add karein | Group dropdown default first group code select kare |
| MD-17 | Multiple pages independent data | Airline Codes mein record add karein, Country Codes check karein | Dono ka data independent rahe (alag `localStorage` collection) |

---

## 2. Air Waybill (AWB) Stock

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| AWB-01 | Register single AWB — valid | AWB No., Airline Code, Owner Code fill karein, Save karein | Record successfully save ho |
| AWB-02 | Register single AWB — missing required field | AWB No. ya Airline ya Owner khali chhorein, Save karein | Validation error aaye, save block ho |
| AWB-03 | AWB Used = Y | "AWB Used" ko Y select karein | AWB Date field enable ho jaye |
| AWB-04 | AWB Used = N | "AWB Used" ko N select karein | AWB Date field disabled rahe |
| AWB-05 | Bulk range — valid range | Airline, Starting/Ending AWB No. (e.g. 001–100) enter karein, "Check AWB" click karein | Given/Duplicate/To-Be-Written counts correctly calculate hon |
| AWB-06 | Bulk range — duplicate detection | Aisi range do jisme kuch AWB No. already exist karte hon | Duplicate count sahi reflect ho, sirf non-duplicate likhe jayen |
| AWB-07 | Bulk range — very large range | Range itni badi do ke 100,000+ iterations ho jayen | Cap 100,000 par lage, app crash na ho |
| AWB-08 | Bulk write | "Write N New Record(s)" click karein | Sirf non-duplicate records insert hon |
| AWB-09 | Filter by Airline/Owner/Used/Date range | Filters apply karein, "Show Detail" click karein | Sirf matching records show hon |
| AWB-10 | Stock summary chips | Airline filter select karein | Total/Used/Un-Used chips correct counts dikhayein |
| AWB-11 | Delete AWB record | Detail table mein kisi row ka Delete click karein | Record turant delete ho (no confirmation) |
| AWB-12 | AWB consumption via Job (MAWB) | Job (MAWB) page se ek unused AWB No. assign karein aur save karein | AWB stock mein us AWB ka status "used" ho jaye |
| AWB-13 | AWB already used — assign to another Job | Job (MAWB) mein ek already-used AWB No. assign karne ki koshish karein | Save block ho, error message aaye |
| AWB-14 | AWB release on Job MAWB No. change | Job (MAWB) mein MAWB No. change karein aur save karein | Purana AWB stock mein wapas "unused" ho jaye |

---

## 3. Job (MAWB) / Job (HAWB)

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| JOB-01 | New MAWB Job — auto number | "New" click karein (MAWB kind) | Job No. auto-generate ho (`{branch}-JM-{seq}`) |
| JOB-02 | New HAWB Job — auto number | "New" click karein (HAWB kind) | HAWB No. auto-generate ho (`{branch}-HAWB-{seq}`), Master Job No. select required ho |
| JOB-03 | Save MAWB without MAWB No. | MAWB No. khali chhorein, Save karein | Error aaye, save block ho |
| JOB-04 | Save MAWB with unused AWB No. | Valid, unused AWB No. enter karein, Save karein | Save successful ho, AWB stock consume ho |
| JOB-05 | Save MAWB with already-used AWB No. | Already-used AWB No. enter karein, Save karein | Error aaye jo required screen (AWB Stock) ka naam le, save block ho |
| JOB-06 | Save HAWB without Parent Job No. | Master Job No. select na karein, Save karein | Error aaye, save block ho |
| JOB-07 | Final — required fields missing | MAWB No./Parent Job No. missing rakh kar Final click karein | Finalize block ho, same validation error dikhe |
| JOB-08 | Final — success | Sab required fields fill karein, Final click karein | `status.final = true` ho jaye, Edit/Delete/Final disabled ho jayen |
| JOB-09 | Edit after Final | Finalized job ko Edit karne ki koshish karein | Edit button disabled/blocked ho |
| JOB-10 | Void job | Non-final job ko Void karein | `status.void = true`, Final/Edit disabled ho jayen |
| JOB-11 | Delete Void job | Voided job ko Delete karne ki koshish karein | Delete allowed rahe (verify per business expectation) |
| JOB-12 | Delete MAWB job | Saved MAWB job delete karein | Linked AWB stock entry release ho (wapas unused) |
| JOB-13 | Delete HAWB job | Saved HAWB job delete karein | Parent job ka House AWB grid re-sync ho |
| JOB-14 | Copy Job | Existing job par "Copy" click karein | Naya draft bane naye Job No./HAWB No. ke sath, MAWB No. clear ho, status flags reset hon |
| JOB-15 | Party Code select — autofill | Entry tab mein Party Code select karein | Name/Address/Credit Limit auto-fill ho Party Codes master se |
| JOB-16 | Consignee Code select — autofill | Consignee Code select karein (Foreign Agent Codes se) | Name/Address auto-fill ho |
| JOB-17 | Charges Grid calculation | Rate, Charge Wt, Ex.Rate enter karein | Total = rate × chargeWt, Total PKR = Total × exRate auto-calculate ho |
| JOB-18 | Charges Grid — add/remove line | "Add line" aur "Remove line" test karein | Grid rows correctly add/remove hon, totals recalculate hon |
| JOB-19 | Totals block read-only | Totals block ke fields (Freight, Due Carrier, etc.) edit karne ki koshish karein | Fields read-only/disabled rahen |
| JOB-20 | K.B. tab — Less Commission Y | "Less Commission" ko Y set karein | Hardcoded 0.95 multiplier apply ho KB calculation mein |
| JOB-21 | K.B. Adjustment Date | "K.B. Adjustment" N par set karein | Date field disabled rahe |
| JOB-22 | Delivery Date field | "Delivery Required" N par set karein | Delivery Date field disabled rahe |
| JOB-23 | Detail/Search — filter by Branch | Multiple branches select karein, search karein | Sirf selected branches ke jobs show hon |
| JOB-24 | Detail/Search — Status radio | Har radio option (Final/Un-Final/Void/Un-Void/All) test karein | Sahi filtered results aayen |
| JOB-25 | Bulk Finalize | Multiple rows checkbox select karein, "Final Multiple AWB/HAWB (N)" click karein | Sab selected jobs finalize hon; button sirf ≥1 selection par enabled ho |
| JOB-26 | Open from search results | Kisi row ka "Open" click karein | Job Entry tab mein load ho |
| JOB-27 | Printing tab — Copy Selection | "Tick/Untick All" checkbox test karein | Sab 12 copy types toggle hon, indeterminate state sahi dikhe |
| JOB-28 | Printing tab — PDF/Excel export | Export buttons click karein | **Known gap:** no-op hain, kuch export nahi hota |
| JOB-29 | Numbering after reload | Job create karein, page reload karein, dusra job create karein | Duplicate Job No. na bane (floor persisted records se re-derive ho) |

---

## 4. Local Invoices Entry and Printing

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| LI-01 | New Invoice — auto number | "New" click karein | Invoice No. auto-generate ho (`{branch}-INV-{seq}`) |
| LI-02 | Save without Party Code | Party Code khali chhorein, Save karein | Error: "Party Code is required to save." |
| LI-03 | Final without Party Code | Party Code khali rakh kar Final karein | Error: "...before finalizing." |
| LI-04 | Job reference lookup | House/Master Job No. enter karein | Job Date/AWB No./AWB Date/Ref No. auto-populate hon (`lookupJobRef`) |
| LI-05 | Multi-currency block | Post In PKR = Y set karein | 3 currency/ex-rate pairs sahi calculate hon |
| LI-06 | Total calculation — Gross | Freight lines aur Due Carrier/Agent charges enter karein | Gross = Σfreight + ΣdueCarrier + ΣdueAgent |
| LI-07 | Commission/WHT calculation | Commission % aur WHT % enter karein | Commission = Gross × %, WHT = Gross × % correctly calculate ho |
| LI-08 | KB Amount calculation | Agreed Freight aur Total Freight enter karein | KB Amount = (agreedFreight − totalFreight) × kbRatePercent% |
| LI-09 | Sales Tax calculation | Sales Tax % enter karein | PST = Gross × salesTaxPercent% |
| LI-10 | WHT-Sales-Tax calculation | WHT Sales Tax % enter karein | WHT-Sales-Tax = PST × whtSalesTaxPercent% |
| LI-11 | Invoice Total — full formula | Sab components fill karein | Invoice Total = Gross − Commission − WHT − KB − Discount + PST + PRA Tax + WHT-Sales-Tax |
| LI-12 | Invoice Total — zero/negative discount edge case | Discount = 0 aur negative value test karein | Formula correctly handle kare |
| LI-13 | Final — success | Party Code fill karein, Final karein | Edit/Delete/Final disabled ho jayen |
| LI-14 | Void — after Final block | Voided invoice, Final/Edit disabled hone chahiye | Verify status gating |
| LI-15 | Receipts list read-only | Receipts grid ko edit karne ki koshish karein | Read-only rahe, sirf Voucher finalize se populate ho |
| LI-16 | Printing — Document Type variants | Invoice / Credit Note (Discounts Only) / Sales Tax Invoice / PRA Tax Invoice select karein | Correct print layout/fields reflect hon |

---

## 5. Invoices/Credit Notes To/From Foreign Agents

(4 variants: Invoice To, Credit Note To, Invoice Received, Credit Note Received)

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| FAI-01 | New document — auto number per variant | Har variant ke liye "New" click karein | Sahi prefix ke sath auto number (FAI/FCN/FAR/FCR) |
| FAI-02 | Save without F/Agent Code | F/Agent Code khali chhorein, Save karein | Error: "F/Agent Code is required..." |
| FAI-03 | Label check — Credit Note variants | CREDIT_NOTE_TO/RECEIVED variant open karein | Entry tab field label "Credit Note No." dikhaye |
| FAI-04 | Label quirk — Printing/Search tabs | Credit Note variant ki Printing/Detail tabs check karein | **Known/intentional quirk:** yahan bhi "Invoice No." hi label rahega |
| FAI-05 | Master Job lookup | MAWB Job No. enter karein | Job Year/No./Date auto-populate hon |
| FAI-06 | Allocation Grid population | Master job select karein jiske house jobs hon | Allocation grid house jobs ke Job No./HAWB No./Pcs/Weights/Cost/Party Name se populate ho |
| FAI-07 | Selling & Buying totals | Selling aur Buying charge lines add karein | Total Selling, Total Buying, Difference, Profit % correctly calculate hon |
| FAI-08 | Handling/Service charges total | Handling charge lines add karein | Total Other Charges aur Total Invoice Amount correct hon |
| FAI-09 | Auto Calculate Cost = Y | Toggle Y karein | Auto-calc lines (Year, CN No., Tracking No., etc.) populate hon |
| FAI-10 | Final — success/failure | F/Agent Code se/bina Final test karein | Present hone par success, na hone par block |

---

## 6. Other Charges Payable

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| OCP-01 | New record — auto number | "New" click karein | Credit Note No. auto-generate ho (`{branch}-OCP-{seq}`) |
| OCP-02 | Save without Party | Party/Vendor khali chhorein, Save karein | Error aaye, save block ho |
| OCP-03 | Final without Party or charge line | Party ho lekin koi nonzero charge line na ho, Final karein | Error: "Party and at least one charge amount are required before finalizing." |
| OCP-04 | Final — success | Party + ≥1 nonzero charge line, Final karein | `status.final = true` ho jaye |
| OCP-05 | Master Job lookup | Master Job No. select karein | MAWB No./Job Year/Gross-Charge Weight auto-populate hon |
| OCP-06 | Allocation Grid running totals | Multiple allocation rows add karein | Running totals row correctly sum kare |
| OCP-07 | First charge line locked | Other Charges Grid ki row 0 ko edit/delete karne ki koshish karein | Code/Description locked rahen (edit mode mein bhi), delete disabled rahe |
| OCP-08 | Add/remove additional charge lines | Row 1+ add/delete karein | Normally editable aur deletable hon |
| OCP-09 | Search — filter by Status | Final/Un-Final/All radio test karein | Sahi filtered results (narrower filter set — no date range/branch) |
| OCP-10 | Voucher Clearance grid read-only | Grid edit karne ki koshish karein | Read-only rahe, sirf Payment Voucher finalize se update ho |
| OCP-11 | Attach Bill/Receipt button | Button click karein | **Known gap:** non-functional |

---

## 7. Sea Export Jobs

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| SEA-01 | New job — auto number | "New" click karein | Job No. auto-generate ho (`{branch}-SEA-{seq}`) |
| SEA-02 | Save without Party Code | Party Code khali chhorein, Save karein | Error aaye, save block ho |
| SEA-03 | Final — missing required fields | Job Type/Party/Port of Load/Destination mein se koi ek missing rakh kar Final karein | Finalize block ho |
| SEA-04 | Final — success | Sab 4 required fields fill karein, Final karein | `status.final = true` ho |
| SEA-05 | Void job | Non-final job Void karein | Final/Edit disabled hon |
| SEA-06 | Close job | Finalized job Close karein | `closed = true` ho, Final/Edit/Close disabled hon |
| SEA-07 | Container tab — add container | "NEW" click karein, container details fill karein, save karein | Container `job.containers` array mein append ho, Serial No. auto-increment ho |
| SEA-08 | Container tab — delete | Container row delete karein | Row list se remove ho |
| SEA-09 | Job Charges — GP calculation | Sell aur Buy charge lines enter karein | Total GP = Total Sell − Total Buy |
| SEA-10 | Job Charges — GP Less KB | KB adjustment enter karein | Total GP Less KB = GP − kbAdjustment |
| SEA-11 | Detail/Search — 8-option Status radio | Har status option test karein (Final/Un-Final/Post/Un-Posted/Void/Un-Void/Closed/Un-Closed/All) | Sahi filtered results aayen |
| SEA-12 | Consol tab — candidate job finder | Branch/date-range/consol-marked filters apply karein | Matching candidate jobs list hon |
| SEA-13 | Consol tab — Update action | Consol No. set karein, jobs select karein, "Update" click karein | Selected jobs consol info se stamp hon; button sirf editable+consolNo set hone par active ho |
| SEA-14 | Copy job | Existing sea job Copy karein | Naya Job No., MBL/HBL/Booking No. reset, containers clear, status reset (`closed: false`) |
| SEA-15 | B/L Screen tab fields | Sab B/L fields fill/save karein | Data correctly persist ho `bl` sub-object mein |
| SEA-16 | Instruction Letter tab | Fields fill karein (near-duplicate of B/L) | Independently correctly save hon |

---

## 8. Vouchers (Finance)

### 8.1 Receipt / Payment Voucher

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| VOU-01 | New voucher — auto number | Receipt aur Payment dono ke liye "New" | Voucher No. auto-generate ho (`{branch}-RV/PV-{seq}`) |
| VOU-02 | Save without Party | Party khali chhorein, Save karein | Error aaye, save block ho |
| VOU-03 | Final without any clearing line | Party ho lekin koi line select na ho, Final karein | Error aaye, block ho |
| VOU-04 | Party select — Outstanding load (Receipt) | Party select karein (Receipt kind) | Finalized non-void Local Invoices + INVOICE_TO Foreign Agent Invoices (positive balance) list hon |
| VOU-05 | Party select — Outstanding load (Payment) | Party select karein (Payment kind) | Finalized Other Charges Payable (positive balance) list hon |
| VOU-06 | Applying checkbox | Kisi row ka checkbox check karein | Allocation amount default full outstanding balance ho jaye, editable rahe |
| VOU-07 | Total Allocated | Multiple rows check karein, amounts edit karein | Total Allocated sabka sum ho |
| VOU-08 | Final — cross-module sync | Receipt Voucher finalize karein jo ek Local Invoice ko clear kare | Local Invoice ke `receipts`, related Job ke `usedClearedVouchers` grid mein reference add ho |
| VOU-09 | Final — HAWB re-sync | Voucher ek HAWB-linked invoice clear kare | Parent Job ka House AWB grid bhi re-sync ho |
| VOU-10 | Final — AR/AP Aging impact | Voucher finalize karne ke baad AR/AP Aging report check karein | Balance reduced reflect ho |
| VOU-11 | Search by kind | Receipt aur Payment vouchers separately list karein | Sirf us kind ke vouchers show hon (no other filter UI) |
| VOU-12 | Open voucher | Search result se "Open" click karein | Sources aur allocations saved `clearingLines` se reload hon |

### 8.2 Journal Voucher

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| JV-01 | New voucher — auto number | "New" click karein | Voucher No. auto-generate ho (`{branch}-JV-{seq}`) |
| JV-02 | Save without journal line | Koi line add na karein, Save karein | Error aaye, block ho |
| JV-03 | Add/remove journal line | Lines add/remove karein | Grid correctly update ho |
| JV-04 | Total Debit/Credit live calculation | Debit/Credit values enter karein | Totals live update hon |
| JV-05 | Balanced chip — equal totals | Debit = Credit (> 0) | "Balanced" chip show ho |
| JV-06 | Balanced chip — unequal totals | Debit ≠ Credit | "Not Balanced" chip show ho |
| JV-07 | Balanced chip — both zero | Debit = Credit = 0 | "Not Balanced" (kyunke totalDebit > 0 required) |
| JV-08 | Balanced chip — rounding edge case | Debit/Credit mein 0.005 ka difference | Tolerance < 0.01 ke andar "Balanced" maana jaye |
| JV-09 | Final without balance | Unbalanced state mein Final karein | Error: "Total Debit must equal Total Credit before finalizing." |
| JV-10 | Final — success | Balanced state mein Final karein | `status.final = true` ho |

---

## 9. Finance Reports (Read-only)

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| REP-01 | AR Aging — As Of Date | Date change karein | Report us date ke hisab se recompute ho |
| REP-02 | AR Aging — bucket calculation | Alag alag age ke invoices ke sath check karein | 0-30/31-60/61-90/90+ buckets correct hon |
| REP-03 | AR Aging — cleared docs excluded | Balance ≤ 0 wale documents check karein | Un rows list se excluded hon |
| REP-04 | AP Aging — void check asymmetry | Voided Other Charges Payable ko AP Aging mein check karein | **Known gap:** AP Aging void status check nahi karta (AR karta hai) — verify actual behavior |
| REP-05 | Bank/Cash Ledger — running balance | Multiple Receipt/Payment vouchers finalize karein | Running balance sahi (+Receipt, −Payment) calculate ho, sorted by date ascending |
| REP-06 | Bank/Cash Ledger — summary cards | Ledger open karein | Total Receipts, Total Payments, Net Balance correct hon |
| REP-07 | Job Profitability — Air job | Finalized MAWB job ke sath linked Other Charges Payable ho | Revenue = totalAwbAmount, Cost = sum of linked payables, Margin % correct ho |
| REP-08 | Job Profitability — HAWB cost lookup | HAWB job ka profitability check karein | **Known gap/bug:** cost lookup `mJobNo` match HAWB ke apne jobNo se karta hai, jo meaningful nahi (Other Charges Payable Master jobs se link hote hain) |
| REP-09 | Job Profitability — Sea job | Finalized Sea job check karein | Revenue = totalSellCharges, Cost includes totalBuyCharges |
| REP-10 | Job Profitability — zero revenue | Revenue = 0 wala job check karein | Margin % = "0.0%" show ho (div-by-zero guard) |
| REP-11 | Job Profitability — sort order | Report open karein | Rows profit descending order mein sorted hon |

---

## 10. Letters

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| LET-01 | Covering Letter — type selection | "Cheques To Airline" aur "Sales Report Covering" radio test karein | Selection correctly switch ho |
| LET-02 | Covering Letter — PDF button | "PDF" click karein | Sirf placeholder success message show ho, actual export nahi hota |
| LET-03 | Letter of Issuance — Airline autofill | Airline Code select karein | Airline Name autofill ho, "No. Of AWBs" default unused stock count se populate ho |
| LET-04 | Letter of Issuance — Signatory dropdown | Airline select karne ke baad Signatory Code dropdown open karein | **Known bug:** dropdown enable hoga lekin options list hardcoded empty rahegi (Signatory Codes master data hone ke bawajood) |
| LET-05 | Letter of Issuance — Owner Code dropdown | Owner Code dropdown check karein | Correctly populated options dikhayein (Signatory ke ulat) |
| LET-06 | Letter of Issuance — recipient fixed | Recipient field check karein | Hamesha "THE CARGO MANAGER" read-only dikhe |
| LET-07 | Letter of Issuance — No. Of AWBs editable | Autofill ke baad value manually change karein | Editable rahe |
| LET-08 | PDF/Excel buttons (both letters) | Buttons click karein | **Known gap:** non-functional placeholders |

---

## 11. Home / Dashboard

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| HOME-01 | Active Jobs KPI | Kuch jobs create karein (kuch void bhi) | Count sirf non-void jobs ka ho |
| HOME-02 | Placeholder KPIs | Outstanding Invoices / Income this month / Net this month / Active Employees check karein | **Known gap:** hardcoded "—" dikhayein, implement nahi hue |
| HOME-03 | Recent Freight Jobs table | Multiple Air jobs (MAWB/HAWB) create karein | 6 most-recent (by date) jobs show hon; Sea Export jobs is table mein nahi aayenge |
| HOME-04 | Status chip precedence | Ek job Void aur Final dono ho sakta ho aise scenario check karein | Precedence: Void > Final > Open |
| HOME-05 | Recent Activity panel | Panel check karein | **Known gap:** hamesha empty state dikhaye, koi real activity log nahi |

---

## 12. Navigation & Routing

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| NAV-01 | Sidebar — all enabled links | Har enabled sidebar link (Freight Forwarding, Finance) par click karein | Har link apne sahi page par navigate kare, koi blank/404 na ho |
| NAV-02 | Sidebar — disabled modules | HR, Courier, Sales, Inventory, Logs modules check karein | Non-clickable/disabled state mein dikhein |
| NAV-03 | Breadcrumbs | Kisi bhi page par jayein | Breadcrumb `navConfig.ts` label se match kare |
| NAV-04 | `/finance` root path | Directly `/finance` route par jayein | `ClearingVoucherPage` (kind="RECEIPT") fallback render ho |
| NAV-05 | Direct URL access | Kisi bhi routed path ko directly URL mein type karein | Sahi page load ho, error na aaye |

---

## 13. Cross-Module Integration Tests

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| INT-01 | AWB Stock → Job (MAWB) full cycle | AWB register karein → Job mein assign karein → Job delete karein | AWB stock: unused → used → unused (release) |
| INT-02 | Job (MAWB) → Local Invoice | Job se linked Local Invoice banayein, Job No. reference se lookup karein | Job Date/AWB No./Ref No. correctly auto-populate hon |
| INT-03 | Voucher finalize → Invoice/Payable/Job sync | Receipt Voucher finalize karein Local Invoice ke against | Invoice `receipts`, Job `usedClearedVouchers`, AR Aging balance sab update hon |
| INT-04 | HAWB → Parent Job House AWB grid | HAWB job create/delete/edit karein | Parent MAWB job ka House AWB grid har baar re-sync ho |
| INT-05 | Master Job → Other Charges Payable → Job Profitability | Master job se OCP link karein, finalize karein | Job Profitability report mein cost correctly reflect ho |
| INT-06 | Numbering sequence — no collision after reload | Kisi bhi module mein record banayein, reload karein, phir se record banayein | Document number duplicate na ho (floor persisted records se re-derive) |
| INT-07 | Seed data + fresh storage | Browser storage clear karein, app open karein | Har master data module apne default seed data ke sath dobara populate ho |

---

## Known Gaps / Bugs Identified During Exploration (for QA awareness)

1. **No uniqueness validation** on any master data `code` field — duplicate codes allowed across all 23 pages.
2. **No max-length validation** on any text field in master data.
3. **Letter of Issuance** — Signatory Code dropdown never populates options despite Signatory Codes master data existing.
4. **AP Aging** does not check void status (asymmetric vs AR Aging which does).
5. **Job Profitability (HAWB)** — cost lookup logic may not correctly match Other Charges Payable (which link to Master jobs, not HAWB jobs).
6. **PDF/Excel export buttons** across Job Printing tab, Letters, and other modules are non-functional placeholders.
7. **Home Dashboard** — most KPIs are hardcoded placeholders ("—"), Recent Activity panel is always empty.
8. **Delete actions** across the app have no confirmation dialog — accidental deletes are possible everywhere.
9. **In-code flagged open business questions** (treat as "TBD" test notes, not hard failures): K.B. tab semantics (Job & Sea Export), Document Checklist codes (FEC/APC/IPB/C/M/Encash), Covering Letter report scope.

---

*Generated from full codebase exploration on 2026-09-14. Reference files: `src/features/masterData/EditableCodeTable.tsx`, `src/data/*Service.ts`, `src/domain/*.ts`, `src/layout/navConfig.ts`, `src/App.tsx`.*
