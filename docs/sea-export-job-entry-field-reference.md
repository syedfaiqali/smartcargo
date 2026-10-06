# Sea Export Job Entry — Shipment Field Reference

**Screen:** Freight → Transactions Menu (Sea Export) → Jobs Entry and Documents Printing (Sea-Export) → Entry  
**System record:** `SeaExportJob`  
**State owner:** Redux `seaExportJob.currentJob`  
**Reference:** legacy Sea Export Job Entry screen supplied by the business. The live legacy URL is internal/authenticated and could not be read automatically.

This document describes the operational Entry tab only. It is the living ship-related reference; the B/L Screen, Container, Job Charges, Consol, Instruction Letter and Printing tabs will be added as each is completed.

## Workflow order

1. **Job, Parties & Routing:** identify the shipment, commercial parties, route and shipment mode.
2. **Document & B/L workflow:** complete export-document milestones, Shipping Bill/Mate's Receipt and Bill of Lading references.
3. **Cargo & invoice workflow:** capture consol totals, cargo measurements, currency and shipper invoice.
4. **Status & delivery workflow:** set finance flags, shipment milestones, voyage/transshipment details and linked grids.

## Job identity and commercial parties

| Screen label | Redux/model binding | Ship-operation use |
|---|---|---|
| Branch | `branch` | Operating branch that owns the job. |
| Job No. | `jobNo` | Unique Sea Export shipment/job reference. |
| Date | `date` | Job entry date. |
| Job Type* | `jobType` | Required shipment/job classification. |
| Load Program No. | `loadProgramNo` | Link to the vessel/load programme. |
| Consol No. / Consol [Y/N] | `consolNo`, `consolYN` | Consolidation reference and membership flag. |
| Nomination / Quot. Ref No. | `nomination`, `quotRefNo` | Nominated shipment and quotation reference. |
| Credit Limit | `creditLimit` | Party credit-control value. |
| Attachment | `attachmentName` | Supporting quotation/party/shipping document filename. |
| Party Code* / Party Name | `partyCode`, `partyName` | Required customer/shipper party. |
| Sub Agent's Party | `subAgentParty` | Origin/sub-agent commercial party. |
| Commodity | `commodity` | Cargo description/classification. |
| Foreign Agent | `foreignAgent` | Overseas handling agent. |
| Shipping Line / S/Line Agent | `shippingLine`, `sLineAgent` | Ocean carrier and carrier agent. |
| Delivery Agent | `deliveryAgent` | Destination delivery partner. |

## Routing, status and shipment mode

| Screen label | Redux/model binding | Ship-operation use |
|---|---|---|
| SPO Code | `spoCode` | Sales/operational attribution. |
| Port of Load* / Destination* | `portOfLoad`, `destination` | Required POL and destination/POD. |
| Wharf / Terminal / Clearing Agent | `wharf`, `terminal`, `clearingAgent` | Port handling and customs-clearance references. |
| Shipment Status / Shipment Date | `jobStatus`, `shipmentdate` | Current operational stage and its date. |
| Booking No. | `bookingNo` | Shipping-line booking reference. |
| GD No. / GD Date | `gdNo`, `gdDate` | Goods Declaration reference/date. |
| LCL/FCL* | `lclFcl` | Required shipment mode. |
| M.PP/CC / H.PP/CC | `mPpCc`, `hPpCc` | Master/House freight term; each uses the Chargeable Code master. |
| CY/CFS / CY/CFS Cutt Off | `cyCfs`, `cyCfsCutOff` | Container-yard/freight-station handling and cutoff. |
| RO No. | `roNo` | Release/order reference. |

## Export documents and B/L references

| Screen label | Redux/model binding | Ship-operation use |
|---|---|---|
| CC Place / CC Date / CC Time | `ccPlace`, `ccDate`, `ccDateTime` | Customs/cargo-control location and time. |
| Vehicle No. / Vehicle Type | `vehicleNo`, `vehicleType` | Truck reference for cargo movement. |
| Form E selection / Form 'E' Date | `selectFromE`, `formEDate` | Export Form-E selection and date. |
| FormE/F.Ins. No. (2) / Date | `formEInsNo2`, `formEInsNo2Date` | Additional Form-E/insurance reference. |
| FormE/F.Ins. No. (3) / Date | `formEInsNo3`, `formEInsNo3Date` | Additional Form-E/insurance reference. |
| Ship Received Date | `shipReceivedDate` | Date cargo/documents were received. |
| Cutt Off / SI File Cutt Off | `cuttOffDate`, `siFileCuttOff` | Carrier and Shipping Instruction cutoffs. |
| Hand Over to S/L / Time | `handOverToSl`, `handOverToSlTime` | Documents handed to shipping line. |
| Doc. Received / SI Filed / Doc. Despatch Date | `docReceived`, `siFiled`, `docDespatchDate` | Document lifecycle milestones. |
| S/B No. / Place / Date | `sbNo`, `sbPlace`, `sbDate` | Shipping Bill reference. |
| M.R. No. / Date / EGM | `mrNo`, `mrDate`, `egm` | Mate's Receipt and Export General Manifest references. |
| MBL No. / Date / Received | `mblNo`, `mblDate`, `mblReceived` | Master Bill of Lading lifecycle. |
| HBL Type / No. / Date | `hblType`, `hblNo`, `hblDate` | House Bill of Lading classification and reference. |
| Sailing Date / PickUp/Stuffing | `sailingDate`, `pickupStuffing` | Vessel sailing and cargo stuffing/pickup dates. |

## Cargo, consol and shipper invoice

| Screen label | Redux/model binding | Ship-operation use |
|---|---|---|
| Consol Total: CBM, gross/net weight, packages, UOM, shipments | `consolTotal.*` | Consolidated shipment totals. |
| Destination / Last Consol No. | `destination`, `lastConsolNo` | Consol destination display and previous consol reference. |
| Packages / Unit / Pieces (QTY) / QTY Unit | `noOfPackages`, `unit`, `noOfPcsQty`, `unitQty` | Cargo count and units. |
| Currency Code / Exchange Rate | `currencyCode`, `exchangeRate` | Job currency and conversion rate, using the Sea Export currency master. |
| Gross / Net / Vol. Weight / CBM / CBM Rate | `grossWeight`, `netWeight`, `volWeight`, `cbm`, `cbmRate` | Sea freight rating and cargo volume/weight. |
| IncoTerm | `incoTerm` | Trade term, bound to the same Chargeable Code master as M.PP/CC and H.PP/CC. |
| HS Code / Stack Code / Run No. | `hsCode`, `stackCode`, `runNo` | Customs classification and operational references. |
| Shipper Invoice No. / Date / Currency / Amount / P.O. No. | `shipperInvoice.*` | Commercial invoice details for the shipment. |

## Finance, delivery, voyage and linked data

| Screen label | Redux/model binding | Ship-operation use |
|---|---|---|
| Invoice Required / Local Invoice / Int'l Invoice | `invoiceRequired`, `localInvoice`, `intlInvoice` | Downstream billing flags. |
| Payable To S/L / Refund From S/L / DD Ship | `payableToSl`, `refundFromSl`, `ddShip` | Carrier payable/refund and shipment handling flags. |
| Shipment Delivered / Delivered Date | `shipmentDelivered`, `deliveredDate` | Final delivery state. |
| Release Message / Pre-Alert Date / Containerized | `releaseMessageDate`, `preAlertDate`, `shipmentContainerized` | Operational release, pre-alert and container status. |
| Non-Printable Remarks | `nonPrintableRemarks` | Internal notes; excluded from customer printouts. |
| POL ETA/ETD, times and confirmation checks | `polEta`, `polEtaTime`, `polEtaChecked`, `polEtd`, `polEtdTime` | Planned vessel timing at port of loading. |
| ETA at Destination, time and confirmation check | `etaAtDest`, `etaAtDestTime`, `etaAtDestChecked` | Planned arrival at destination. |
| Vessel / Voyage / Rotation No. | `vessel`, `voyage`, `rotationNo` | Primary sailing identity. |
| T/Ship Point 1–4: destination, ETA/ETD, checks, vessel, voyage | `transshipmentPoints[]` | Intermediate port and connecting-vessel schedule. |
| Container Summary grid | `containers[]` | Container, seal, ISO, vehicle and movement summary; detailed on Container tab. |
| Consol grid | `consolGrid[]` | Jobs/containers included in a consol. |
| Job History grid | `jobHistory[]` | Historical financial/operational records. |
| C/N No. / Manual C/N | `creditNoteDetails[]` | Linked credit-note references. |

## Data lifecycle

- All Entry controls update the shared `currentJob` Redux record through the page's `onChange` binding.
- **Save**, **Final**, **Void**, **Close** and **Copy** retain their current repository/business behavior; Redux holds the active UI record before and after those actions.
- The same record is now available to B/L Screen, Container, Job Charges, Consol and Instruction Letter while those tabs are implemented. Printing will be handled after the operational tabs are complete.
