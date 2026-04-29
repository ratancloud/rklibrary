export interface Inquiry {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  address: string | null;
  shiftNames: string[];
  joiningDate: Date | null;
  message: string | null;
  status: "PENDING" | "CONTACTED" | "CONVERTED" | "CANCELLED";
  createdAt: Date;
}