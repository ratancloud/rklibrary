import { formatMemberId } from "./helper";

interface ReceiptData {
  studentName: string;
  memberId: string | number | null;
  floorName: string;
  seatNo: number;
  shiftName: string[];
  daysLeft: number;
  dues: number;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  startDateStr: string;
  endDateStr: string;
}

const formatIndianDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const DIVIDER = "─────────────────────────────";

const buildAlert = (dues: number, daysLeft: number): string => {
  if (dues > 0)
    return `Note: A due balance of Rs. ${dues} is pending. Kindly clear it at the earliest to avoid any service interruption.`;
  if (daysLeft >= 0 && daysLeft <= 3)
    return `Notice: Your subscription is expiring within ${daysLeft} day(s). Please renew promptly to retain your allocated seat.`;
  if (daysLeft < 0)
    return `Notice: Your subscription has expired. Please renew immediately to continue availing library facilities.`;
  return "";
};

export const generateWhatsAppReceipt = ({
  studentName,
  memberId,
  floorName,
  seatNo,
  daysLeft,
  dues,
  totalAmount,
  discount,
  amountPaid,
  startDateStr,
  endDateStr,
  shiftName,
}: ReceiptData): string => {
  const startDate = formatIndianDate(startDateStr);
  const endDate = formatIndianDate(endDateStr);
  const memberIdText = formatMemberId(Number(memberId)) ?? "Pending";
  const daysDisplay = Math.max(0, daysLeft);
  const finalAmount = totalAmount - discount;
  const alert = buildAlert(dues, daysLeft);

  const lines: string[] = [
    `RK LIBRARY`,
    `Subscription Receipt`,
    DIVIDER,
    `Name           : ${studentName}`,
    `Member ID      : ${memberIdText}`,
    `Floor          : ${floorName}`,
    `Seat Number    : #${seatNo}`,
    `Shift          : ${shiftName.join(", ")}`,
    `Start Date     : ${startDate}`,
    `End Date       : ${endDate}`,
    `Days Remaining : ${daysDisplay} days`,
    DIVIDER,
    `PAYMENT SUMMARY`,
    `Total Fee      : Rs. ${totalAmount}`,
    ...(discount > 0 ? [`Discount       : Rs. -${discount}`] : []),
    `Final Amount   : Rs. ${finalAmount}`,
    `Amount Paid    : Rs. ${amountPaid}`,
    `Dues           : Rs. ${dues}`,
    DIVIDER,
    ...(alert ? [alert, DIVIDER] : []),
    `Thank you for choosing RK Library.`,
    ``,
    `Authorized By  : Rajan Prakash (Owner)`,
  ];

  return lines.join("\n");
};

// Function to send WhatsApp message
export const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  let formattedPhone = phoneNumber.replace(/\s+/g, "");
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
};
