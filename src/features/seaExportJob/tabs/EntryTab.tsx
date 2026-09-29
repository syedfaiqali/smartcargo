import Box from "@mui/material/Box";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  FormRow,
  FormField,
  SectionHeader,
} from "../../../components/FormGrid";
import { NumberField } from "../../../components/NumberField";
import { DateField } from "../../../components/DateField";
import { WorkflowSection } from "../../../components/WorkflowSection";
import { SeaExportJob } from "../../../domain/seaExportJob";
import {
  agentRepo,
  currencyRepo,
  foreignAgentRepo,
  jobTypeRepo,
  partyRepo,
  seaPortRepo,
  shippingLineRepo,
  spoRepo,
} from "../../../data/masterDataService";

interface EntryTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const yn = (v: string) => (
  <>
    <MenuItem value="N">N</MenuItem>
    <MenuItem value="Y">Y</MenuItem>
  </>
);

export function EntryTab({ job, editable, onChange }: EntryTabProps) {
  const [openSection, setOpenSection] = useState(1);
  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const shippingLines = shippingLineRepo.list();
  const seaPorts = seaPortRepo.list();
  const spoCodes = spoRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === "CLEARING");
  const deliveryAgents = agentRepo.find((a) => a.kind === "DELIVERY");
  const currencies = currencyRepo.list();
  const jobTypes = jobTypeRepo.list();

  const set = <K extends keyof SeaExportJob>(key: K, value: SeaExportJob[K]) =>
    onChange({ ...job, [key]: value });

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    onChange({ ...job, partyCode, partyName: p?.name ?? "" });
  };

  return (
    <Box>
      <Box>
        {/* LEFT COLUMN — Job identity, parties, routing */}
        <WorkflowSection
          title="Job, Parties & Routing"
          subtitle="Complete the core job and party details first"
          open={openSection === 1}
          onToggle={() => setOpenSection(openSection === 1 ? 0 : 1)}
        >
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Branch"
                fullWidth
                value={job.branch}
                disabled={!editable}
                onChange={(e) => set("branch", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField label="Job No." fullWidth value={job.jobNo} disabled />
            </FormField>
            <FormField md={4}>
              <DateField
                label="Date"
                value={job.date}
                disabled={!editable}
                onChange={(value) => set("date", value)}
              />
            </FormField>
          </FormRow>
          {/* <FormRow> */}
          {/* </FormRow> */}
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Job Type"
                fullWidth
                required
                value={job.jobType}
                disabled={!editable}
                onChange={(e) => set("jobType", e.target.value)}
              >
                <MenuItem value="">Select Job Type</MenuItem>
                {jobTypes.map((type) => (
                  <MenuItem key={type.code} value={type.code}>
                    {type.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <NumberField
                label="Load Program No"
                fullWidth
                value={job.loadProgramNo}
                disabled={!editable}
                onChange={(e) => set("loadProgramNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <NumberField
                label="Consol No"
                fullWidth
                value={job.consolNo}
                disabled={!editable}
                onChange={(e) => set("consolNo", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Consol [Y/N]"
                fullWidth
                value={job.consolYN}
                disabled={!editable}
                onChange={(e) => set("consolYN", e.target.value as "Y" | "N")}
              >
                {yn(job.consolYN)}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Nomination"
                fullWidth
                value={job.nomination}
                disabled={!editable}
                onChange={(e) => set("nomination", e.target.value as "Y" | "N")}
              >
                {yn(job.nomination)}
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Parties</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Party Code"
                required
                fullWidth
                value={job.partyCode}
                disabled={!editable}
                onChange={(e) => setPartyCode(e.target.value)}
              >
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Sub Agent's Party"
                fullWidth
                value={job.subAgentParty}
                disabled={!editable}
                onChange={(e) => set("subAgentParty", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Commodity"
                fullWidth
                value={job.commodity}
                disabled={!editable}
                onChange={(e) => set("commodity", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Foreign Agent"
                fullWidth
                value={job.foreignAgent}
                disabled={!editable}
                onChange={(e) => set("foreignAgent", e.target.value)}
              >
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Shipping Line"
                fullWidth
                value={job.shippingLine}
                disabled={!editable}
                onChange={(e) => set("shippingLine", e.target.value)}
              >
                {shippingLines.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="S/Line Agent"
                fullWidth
                value={job.sLineAgent}
                disabled={!editable}
                onChange={(e) => set("sLineAgent", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Delivery Agent"
                fullWidth
                value={job.deliveryAgent}
                disabled={!editable}
                onChange={(e) => set("deliveryAgent", e.target.value)}
              >
                {deliveryAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <SectionHeader>Routing</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="SPO Code"
                fullWidth
                value={job.spoCode}
                disabled={!editable}
                onChange={(e) => set("spoCode", e.target.value)}
              >
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Port of Load *"
                required
                fullWidth
                value={job.portOfLoad}
                disabled={!editable}
                onChange={(e) => set("portOfLoad", e.target.value)}
              >
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Destination *"
                required
                fullWidth
                value={job.destination}
                disabled={!editable}
                onChange={(e) => set("destination", e.target.value)}
              >
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Wharf"
                fullWidth
                value={job.wharf}
                disabled={!editable}
                onChange={(e) => set("wharf", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Terminal"
                fullWidth
                value={job.terminal}
                disabled={!editable}
                onChange={(e) => set("terminal", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Clearing Agent"
                fullWidth
                value={job.clearingAgent}
                disabled={!editable}
                onChange={(e) => set("clearingAgent", e.target.value)}
              >
                {clearingAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Status"
                fullWidth
                value={job.jobStatus}
                disabled={!editable}
                onChange={(e) => set("jobStatus", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Booking No."
                fullWidth
                value={job.bookingNo}
                disabled={!editable}
                onChange={(e) => set("bookingNo", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Shipment Mode</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="LCL/FCL *"
                required
                fullWidth
                value={job.lclFcl}
                disabled={!editable}
                onChange={(e) => set("lclFcl", e.target.value as "LCL" | "FCL")}
              >
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="M.PP/CC"
                fullWidth
                value={job.mPpCc}
                disabled={!editable}
                onChange={(e) => set("mPpCc", e.target.value as "PP" | "CC")}
              >
                <MenuItem value="PP">PP</MenuItem>
                <MenuItem value="CC">CC</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="CY/CFS"
                fullWidth
                value={job.cyCfs}
                disabled={!editable}
                onChange={(e) => set("cyCfs", e.target.value as "CY" | "CFS")}
              >
                <MenuItem value="CY">CY</MenuItem>
                <MenuItem value="CFS">CFS</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="H.PP/CC"
                fullWidth
                value={job.hPpCc}
                disabled={!editable}
                onChange={(e) => set("hPpCc", e.target.value as "PP" | "CC")}
              >
                <MenuItem value="PP">PP</MenuItem>
                <MenuItem value="CC">CC</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <DateField
                label="CY/CFS Cutt Off"
                value={job.cyCfsCutOff}
                disabled={!editable}
                onChange={(value) => set("cyCfsCutOff", value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="RO No."
                fullWidth
                value={job.roNo}
                disabled={!editable}
                onChange={(e) => set("roNo", e.target.value)}
              />
            </FormField>
          </FormRow>
        </WorkflowSection>

        {/* MIDDLE COLUMN — measurements, docs, milestones */}
        <WorkflowSection
          title="Cargo, Documents & Bill of Lading"
          subtitle="Add shipment quantities, invoices and document references"
          open={openSection === 2}
          onToggle={() => setOpenSection(openSection === 2 ? 0 : 2)}
        >
          <SectionHeader>Cargo Quantity &amp; Currency</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="No. of Packages"
                type="number"
                fullWidth
                value={job.noOfPackages}
                disabled={!editable}
                onChange={(e) => set("noOfPackages", Number(e.target.value))}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Unit"
                fullWidth
                value={job.unit}
                disabled={!editable}
                onChange={(e) => set("unit", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="No. of Pcs (QTY)"
                type="number"
                fullWidth
                value={job.noOfPcsQty}
                disabled={!editable}
                onChange={(e) => set("noOfPcsQty", Number(e.target.value))}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Unit (QTY)"
                fullWidth
                value={job.unitQty}
                disabled={!editable}
                onChange={(e) => set("unitQty", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Currency Code"
                fullWidth
                value={job.currencyCode}
                disabled={!editable}
                onChange={(e) => set("currencyCode", e.target.value)}
              >
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Exchange Rate"
                type="number"
                fullWidth
                value={job.exchangeRate}
                disabled={!editable}
                onChange={(e) => set("exchangeRate", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Grs Weight"
                type="number"
                fullWidth
                value={job.grossWeight}
                disabled={!editable}
                onChange={(e) => set("grossWeight", Number(e.target.value))}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Net Weight"
                type="number"
                fullWidth
                value={job.netWeight}
                disabled={!editable}
                onChange={(e) => set("netWeight", Number(e.target.value))}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Vol.Weight"
                type="number"
                fullWidth
                value={job.volWeight}
                disabled={!editable}
                onChange={(e) => set("volWeight", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="CBM"
                type="number"
                fullWidth
                value={job.cbm}
                disabled={!editable}
                onChange={(e) => set("cbm", Number(e.target.value))}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="CBM Rate"
                type="number"
                fullWidth
                value={job.cbmRate}
                disabled={!editable}
                onChange={(e) => set("cbmRate", Number(e.target.value))}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField
                label="IncoTerm"
                fullWidth
                value={job.incoTerm}
                disabled={!editable}
                onChange={(e) => set("incoTerm", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="HS Code"
                fullWidth
                value={job.hsCode}
                disabled={!editable}
                onChange={(e) => set("hsCode", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Stack Code"
                fullWidth
                value={job.stackCode}
                disabled={!editable}
                onChange={(e) => set("stackCode", e.target.value)}
              />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Run No."
                fullWidth
                value={job.runNo}
                disabled={!editable}
                onChange={(e) => set("runNo", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Shipper Invoice</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Inv. No."
                fullWidth
                value={job.shipperInvoice.invNo}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    invNo: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="Date"
                value={job.shipperInvoice.date}
                disabled={!editable}
                onChange={(value) =>
                  set("shipperInvoice", { ...job.shipperInvoice, date: value })
                }
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Currency Code"
                fullWidth
                value={job.shipperInvoice.currencyCode}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    currencyCode: e.target.value,
                  })
                }
              >
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                value={job.shipperInvoice.amount}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    amount: Number(e.target.value),
                  })
                }
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="P.O. No."
                fullWidth
                value={job.shipperInvoice.poNo}
                disabled={!editable}
                onChange={(e) =>
                  set("shipperInvoice", {
                    ...job.shipperInvoice,
                    poNo: e.target.value,
                  })
                }
              />
            </FormField>
          </FormRow>

          <SectionHeader>Document Milestones</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="CC Date"
                value={job.ccDate}
                disabled={!editable}
                onChange={(value) => set("ccDate", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Form 'E' Date"
                value={job.formEDate}
                disabled={!editable}
                onChange={(value) => set("formEDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="FormE/F.Ins. No.(2)"
                fullWidth
                value={job.formEInsNo2}
                disabled={!editable}
                onChange={(e) => set("formEInsNo2", e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Date"
                value={job.formEInsNo2Date}
                disabled={!editable}
                onChange={(value) => set("formEInsNo2Date", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="FormE/F.Ins. No.(3)"
                fullWidth
                value={job.formEInsNo3}
                disabled={!editable}
                onChange={(e) => set("formEInsNo3", e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Date"
                value={job.formEInsNo3Date}
                disabled={!editable}
                onChange={(value) => set("formEInsNo3Date", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Ship Received Date"
                value={job.shipReceivedDate}
                disabled={!editable}
                onChange={(value) => set("shipReceivedDate", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Cutt Off Date"
                value={job.cuttOffDate}
                disabled={!editable}
                onChange={(value) => set("cuttOffDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="SI File Cutt Off"
                value={job.siFileCuttOff}
                disabled={!editable}
                onChange={(value) => set("siFileCuttOff", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Hand Over to S/L"
                value={job.handOverToSl}
                disabled={!editable}
                onChange={(value) => set("handOverToSl", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Doc. Received"
                value={job.docReceived}
                disabled={!editable}
                onChange={(value) => set("docReceived", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="SI Filed"
                value={job.siFiled}
                disabled={!editable}
                onChange={(value) => set("siFiled", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Doc. Despatch Date"
                value={job.docDespatchDate}
                disabled={!editable}
                onChange={(value) => set("docDespatchDate", value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Shipping Bill / Mate's Receipt</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="S/B No."
                fullWidth
                value={job.sbNo}
                disabled={!editable}
                onChange={(e) => set("sbNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="S/B Place"
                fullWidth
                value={job.sbPlace}
                disabled={!editable}
                onChange={(e) => set("sbPlace", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="S/B Date"
                value={job.sbDate}
                disabled={!editable}
                onChange={(value) => set("sbDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="M.R. No."
                fullWidth
                value={job.mrNo}
                disabled={!editable}
                onChange={(e) => set("mrNo", e.target.value)}
              />
            </FormField>
            <FormField md={4}>
              <DateField
                label="M.R Date"
                value={job.mrDate}
                disabled={!editable}
                onChange={(value) => set("mrDate", value)}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="EGM"
                fullWidth
                value={job.egm}
                disabled={!editable}
                onChange={(e) => set("egm", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Bill of Lading</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="MBL No."
                fullWidth
                value={job.mblNo}
                disabled={!editable}
                onChange={(e) => set("mblNo", e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="MBL Date"
                value={job.mblDate}
                disabled={!editable}
                onChange={(value) => set("mblDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="MBL Received"
                fullWidth
                value={job.mblReceived}
                disabled={!editable}
                onChange={(e) =>
                  set("mblReceived", e.target.value as "Y" | "N")
                }
              >
                {yn(job.mblReceived)}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="HBL Type"
                fullWidth
                value={job.hblType}
                disabled={!editable}
                onChange={(e) => set("hblType", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="HBL No."
                fullWidth
                value={job.hblNo}
                disabled={!editable}
                onChange={(e) => set("hblNo", e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="HBL Date"
                value={job.hblDate}
                disabled={!editable}
                onChange={(value) => set("hblDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Sailing Date"
                value={job.sailingDate}
                disabled={!editable}
                onChange={(value) => set("sailingDate", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="PickUp/Stuffing"
                value={job.pickupStuffing}
                disabled={!editable}
                onChange={(value) => set("pickupStuffing", value)}
              />
            </FormField>
          </FormRow>
        </WorkflowSection>

        {/* RIGHT COLUMN — flags, remarks, linked grids, voyage schedule */}
        <WorkflowSection
          title="Shipment Status, Voyage & History"
          subtitle="Finish shipment flags, milestones and voyage details"
          open={openSection === 3}
          onToggle={() => setOpenSection(openSection === 3 ? 0 : 3)}
        >
          <SectionHeader>Finance &amp; Shipment Flags</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Invoice Req."
                fullWidth
                value={job.invoiceRequired}
                disabled={!editable}
                onChange={(e) =>
                  set("invoiceRequired", e.target.value as "Y" | "N")
                }
              >
                {yn(job.invoiceRequired)}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Local Invoice"
                fullWidth
                value={job.localInvoice}
                disabled={!editable}
                onChange={(e) =>
                  set("localInvoice", e.target.value as "Y" | "N")
                }
              >
                {yn(job.localInvoice)}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Int'l Invoice"
                fullWidth
                value={job.intlInvoice}
                disabled={!editable}
                onChange={(e) =>
                  set("intlInvoice", e.target.value as "Y" | "N")
                }
              >
                {yn(job.intlInvoice)}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Payable To S/L"
                fullWidth
                value={job.payableToSl}
                disabled={!editable}
                onChange={(e) =>
                  set("payableToSl", e.target.value as "Y" | "N")
                }
              >
                {yn(job.payableToSl)}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="Refund From S/L"
                fullWidth
                value={job.refundFromSl}
                disabled={!editable}
                onChange={(e) =>
                  set("refundFromSl", e.target.value as "Y" | "N")
                }
              >
                {yn(job.refundFromSl)}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                select
                label="DD Ship"
                fullWidth
                value={job.ddShip}
                disabled={!editable}
                onChange={(e) => set("ddShip", e.target.value as "Y" | "N")}
              >
                {yn(job.ddShip)}
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Shipment Milestones</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Shipment Delivered"
                fullWidth
                value={job.shipmentDelivered}
                disabled={!editable}
                onChange={(e) =>
                  set("shipmentDelivered", e.target.value as "Y" | "N")
                }
              >
                {yn(job.shipmentDelivered)}
              </TextField>
            </FormField>
            <FormField md={6}>
              <DateField
                label="Delivered Date"
                value={job.deliveredDate}
                disabled={!editable}
                onChange={(value) => set("deliveredDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="Release Message Date"
                value={job.releaseMessageDate}
                disabled={!editable}
                onChange={(value) => set("releaseMessageDate", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Pre-Alert Date"
                value={job.preAlertDate}
                disabled={!editable}
                onChange={(value) => set("preAlertDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                select
                label="Shipment Containerized"
                fullWidth
                value={job.shipmentContainerized}
                disabled={!editable}
                onChange={(e) =>
                  set("shipmentContainerized", e.target.value as "Y" | "N")
                }
              >
                {yn(job.shipmentContainerized)}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Non-Printable Remarks"
                fullWidth
                multiline
                minRows={2}
                value={job.nonPrintableRemarks}
                disabled={!editable}
                onChange={(e) => set("nonPrintableRemarks", e.target.value)}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Voyage Schedule</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="POL ETA"
                value={job.polEta}
                disabled={!editable}
                onChange={(value) => set("polEta", value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="POL ETD"
                value={job.polEtd}
                disabled={!editable}
                onChange={(value) => set("polEtd", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <DateField
                label="ETA At Dest"
                value={job.etaAtDest}
                disabled={!editable}
                onChange={(value) => set("etaAtDest", value)}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Rotation No."
                fullWidth
                value={job.rotationNo}
                disabled={!editable}
                onChange={(e) => set("rotationNo", e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Vessel"
                fullWidth
                value={job.vessel}
                disabled={!editable}
                onChange={(e) => set("vessel", e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Voyage"
                fullWidth
                value={job.voyage}
                disabled={!editable}
                onChange={(e) => set("voyage", e.target.value)}
              />
            </FormField>
          </FormRow>

          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block", mt: 1 }}
          >
            Transshipment Points
          </Typography>
          <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Point</TableCell>
                  <TableCell>Dest. Code</TableCell>
                  <TableCell>ETA</TableCell>
                  <TableCell>ETD</TableCell>
                  <TableCell>Vessel</TableCell>
                  <TableCell>Voyage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.transshipmentPoints.map((tp, i) => (
                  <TableRow key={tp.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.destinationCode}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, destinationCode: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <DateField
                        label="ETA"
                        variant="standard"
                        value={tp.eta}
                        disabled={!editable}
                        onChange={(value) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, eta: value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <DateField
                        label="ETD"
                        variant="standard"
                        value={tp.etd}
                        disabled={!editable}
                        onChange={(value) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, etd: value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.vessel}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, vessel: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={tp.voyage}
                        disabled={!editable}
                        onChange={(e) => {
                          const pts = [...job.transshipmentPoints];
                          pts[i] = { ...tp, voyage: e.target.value };
                          set("transshipmentPoints", pts);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block" }}
          >
            Container Summary
          </Typography>
          <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Container No.</TableCell>
                  <TableCell>Size/Type</TableCell>
                  <TableCell>Seal No.</TableCell>
                  <TableCell>ISO Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.containers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="caption" color="text.secondary">
                        No containers — add on the Container tab.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.containers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.containerNo}</TableCell>
                      <TableCell>{c.sizeType}</TableCell>
                      <TableCell>{c.sealNo}</TableCell>
                      <TableCell>{c.isoCode}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block" }}
          >
            Consol
          </Typography>
          <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>Container No.</TableCell>
                  <TableCell>Vessel</TableCell>
                  <TableCell>Voyage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.consolGrid.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="caption" color="text.secondary">
                        No Consol Job found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.consolGrid.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.jobNo}</TableCell>
                      <TableCell>{c.containerNo}</TableCell>
                      <TableCell>{c.vessel}</TableCell>
                      <TableCell>{c.voyage}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography
            variant="caption"
            sx={{ fontWeight: 700, display: "block" }}
          >
            Job History
          </Typography>
          <Paper variant="outlined" sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>PKR Amount</TableCell>
                  <TableCell>Final</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.jobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="caption" color="text.secondary">
                        No Record found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  job.jobHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.no}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>{h.type}</TableCell>
                      <TableCell>{h.pkrAmount.toFixed(2)}</TableCell>
                      <TableCell>{h.final ? "Y" : "N"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </WorkflowSection>
      </Box>
    </Box>
  );
}
