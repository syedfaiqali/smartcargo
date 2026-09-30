import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';

const clauses = [
  '1. In this contract and the notices appearing hereon, CARRIER includes the air carrier issuing this air waybill and all carriers that undertake to carry the cargo or perform any other services related to the carriage. SPECIAL DRAWING RIGHT (SDR) means a Special Drawing Right as defined by the International Monetary Fund. WARSAW CONVENTION means whichever of the following instruments is applicable to the contract of carriage: the Convention for the Unification of Certain Rules Relating to International Carriage by Air, signed at Warsaw, 12 October 1929; that Convention as amended at The Hague on 28 September 1955; that Convention as amended at The Hague 1955 and by Montreal Protocol No. 1, 2, or 4 (1975); and the Montreal Convention for the Unification of Certain Rules for International Carriage by Air, done at Montreal on 28 May 1999.',
  '2. Carriage is subject to the rules relating to liability established by the Warsaw Convention or the Montreal Convention unless such carriage is not “international carriage” as defined by the applicable Conventions. 2.2 To the extent not in conflict with the foregoing, carriage and other related services performed by each Carrier are subject to: 2.2.1 applicable laws and government regulations; 2.2.2 provisions contained in the air waybill, Carrier\'s conditions of carriage and related rules, regulations and timetables (but not the times of departure and arrival stated herein), and applicable tariffs of such Carrier, which are made part hereof and which may be inspected at any airports or other cargo sales offices from which it operates regular services. When carriage is to/from the USA, the shipper and the consignee are entitled, upon request, to receive a free copy of the Carrier\'s conditions of carriage. The Carrier\'s conditions of carriage include, but are not limited to: 2.2.2.1 limits on the Carrier\'s liability for loss, damage or delay of goods, including fragile or perishable goods; 2.2.2.2 claims restrictions, including time periods within which shippers or consignees must file a claim or bring an action against the Carrier for its acts or omissions, and those of its agents; 2.2.2.3 rights, if any, of the Carrier to change the terms of the contract; 2.2.2.4 rules about Carrier\'s right to refuse to carry; 2.2.2.5 rights of the Carrier and limitations concerning delay or failure to perform service, including schedule changes, substitution of alternate carrier or aircraft and rerouting.',
  '3. The agreed stopping places (which may be altered by Carrier in case of necessity) are those places, except the place of departure and place of destination, set forth on the face hereof or shown in Carrier\'s timetables as scheduled stopping places for the route. Carriage is to be performed hereunder by several successive Carriers if so agreed.',
  '4. For carriage to which the Montreal Convention does not apply, Carrier\'s liability limitation for cargo loss, damage or delayed shall be 19 SDRs per kilogram unless a greater per kilogram monetary limit is provided in any applicable Convention or Carrier\'s tariffs or general conditions of carriage.',
  '5. Except when the Carrier has extended credit to the consignee without the written consent of the shipper, the shipper guarantees payment of all charges for carriage due in accordance with Carrier\'s tariffs, including national law implementing the Warsaw Convention and the Montreal Convention, government regulations, orders and requirements. When no part of the consignment is delivered, a claim with respect to such consignment will be considered even though transportation charges thereon are unpaid.',
  '6. For cargo accepted for carriage, the Warsaw Convention and the Montreal Convention permit shipper to increase the limitation of liability by declaring a higher value for carriage and paying a supplementary charge if required. In carriage to which neither Convention nor the Montreal Convention applies, Carrier shall in accordance with the procedures set forth in its general conditions of carriage and applicable tariffs permit shipper to increase the limitation of liability by declaring a higher value for carriage and paying a supplementary charge if so required.',
  '7. 7.1 In cases of loss of, damage or delay to part of the cargo, the weight to be taken into account in determining Carrier\'s limit of liability shall be only the weight of the package or packages concerned. 7.2 Notwithstanding any other provisions, for foreign air transportation as defined by the U.S. Transportation Code: 7.2.1 in the case of loss of, damage or delay to a shipment, the weight used in determining Carrier\'s limit of liability shall be the weight which is used to determine the charge for carriage of such shipment; and 7.2.2 in the case of loss of, damage or delay to a part of a shipment, the shipment weight in 7.2.1 shall be prorated to the packages covered by the same air waybill whose value is affected by the loss, damage or delay. The weight applicable in the case of loss or damage to one or more articles in a package shall be the weight of the entire package.',
  '8. Any exclusion or limitation of liability applicable to Carrier shall apply to Carrier\'s agents, employees, and representatives and to any person whose aircraft or equipment is used by Carrier for carriage and such person\'s agents, employees and representatives.',
  '9. Carrier undertakes to complete the carriage with reasonable dispatch. Carrier may use alternative carriers, tariffs and government regulations, or modes of transport without notice, but will use due regard to the interests of the shipper. Carrier is not authorized by the shipper to select routing and all intermediate stopping places that it deems appropriate to the carriage of the cargo.',
  '10. Receipt by the person entitled to delivery of the cargo without complaint shall be prima facie evidence that the cargo has been delivered in good condition and in accordance with the contract of carriage. 10.1 In the case of loss of, damage or delay to cargo a written complaint must be made to Carrier by the person entitled to delivery. Such complaint must be made: 10.1.1 in the case of damage to the cargo, immediately after discovery of the damage and at the latest within 14 days from the date of receipt of the cargo; 10.1.2 in the case of delay, within 21 days from the date on which the cargo was placed at the disposal of the person entitled to delivery; 10.1.3 in the case of non-delivery of the cargo, within 120 days from the date of issue of the air waybill or, if an air waybill has not been issued, within 120 days from the date of receipt of the cargo for transportation by the Carrier. 10.2 Such complaint may be made to the Carrier whose air waybill was used, or the first Carrier or to the last Carrier or to the Carrier who performed the carriage during which the loss, damage or delay took place. 10.3 Unless a written complaint is made within the time limits specified in 10.1 no action may be brought against Carrier. 10.4 Any rights to damages against Carrier shall be extinguished unless an action is brought within two years from the date of arrival at the destination, or from the date on which the aircraft ought to have arrived, or from the date on which the carriage stopped.',
  '11. Shipper shall comply with all applicable laws and government regulations relating to the packing, carriage or delivery of the cargo, and shall furnish such information and attach such documents as may be necessary to comply with such laws and regulations. Carrier is not liable to shipper and shipper shall indemnify Carrier for all loss or expense due to shipper\'s failure to comply with this provision.',
  '12. No agent, employee or representative of Carrier has authority to alter, modify or waive any provision of this contract.',
];

/** Compact two-column terms-and-conditions page for the reverse of an air waybill. */
export async function printAirwaybillBackSide(_job: Job) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: 'Air Waybill - Back Side' });
  doc.setFont('helvetica', 'bold').setFontSize(8).text("NOTICE CONCERNING CARRIER'S LIMITATION OF LIABILITY", 105, 16, { align: 'center' });
  const notice = 'If the carriage involves an ultimate destination or stop in a country other than the country of departure, the Montreal Convention or the Warsaw Convention may be applicable to the liability of the Carrier in respect of loss of, damage or delay to cargo. Carrier\'s limitation of liability in accordance with those Conventions shall be as set forth in subparagraph 4 unless a higher value is declared.';
  const noticeLines = doc.setFont('helvetica', 'normal').setFontSize(6.5).splitTextToSize(notice, 174);
  doc.text(noticeLines, 105, 23, { align: 'center', lineHeightFactor: 1.02 });
  doc.setFont('helvetica', 'bold').setFontSize(8).text('CONDITIONS OF CONTRACT', 105, 37, { align: 'center' });

  const columns = [16, 108];
  const startY = 44;
  const bottomY = 286;
  // Use the largest readable size that keeps the complete legal text on one page.
  const fontSize = [6.2, 6, 5.8, 5.6, 5.4, 5.2, 5].find((size) => {
    const positions = [startY, startY];
    clauses.forEach((clause, index) => {
      const column = index < 5 ? 0 : 1;
      const lines = doc.setFont('helvetica', 'normal').setFontSize(size).splitTextToSize(clause, 86) as string[];
      positions[column] += lines.length * (size * .43) + 1.6;
    });
    return Math.max(...positions) <= bottomY;
  }) ?? 5;
  const lineHeight = fontSize * .43;
  const positions = [startY, startY];
  clauses.forEach((clause, index) => {
    // The standard AWB back-side convention places clauses 1–5 in the left
    // column and the remaining clauses alongside them in the right column.
    const column = index < 5 ? 0 : 1;
    const lines = doc.setFont('helvetica', 'normal').setFontSize(fontSize).splitTextToSize(clause, 86) as string[];
    doc.text(lines, columns[column], positions[column], { lineHeightFactor: 1.03 });
    positions[column] += lines.length * lineHeight + 1.6;
  });
  window.open(doc.output('bloburl'), '_blank');
}
