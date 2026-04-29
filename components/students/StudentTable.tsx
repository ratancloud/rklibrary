"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";
import {
  Trash2,
  Edit2,
  Loader2,
  Search,
  InboxIcon,
  Phone,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  LucideIcon,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import EditStudentDialog from "./EditStudentDialog";
import AddStudentDialog from "./AddStudentDialog";
import { formatMemberId } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { sendWhatsAppMessage } from "@/lib/sendMsg";
import { WhatsappIcon } from "../icons/SocialIcons";

interface ReceiptData {
  studentName: string;
  memberId: string | null;
  daysLeft: number;
  dues: number;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  startDateStr: string;
  endDateStr: string;
}

type SubscriptionStatus = "EXPIRED" | "EXPIRING_SOON" | "ACTIVE";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatIndianDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const getSubscriptionStatus = (daysLeft: number): SubscriptionStatus => {
  if (daysLeft < 0) return "EXPIRED";
  if (daysLeft <= 3) return "EXPIRING_SOON";
  return "ACTIVE";
};

const STATUS_DISPLAY: Record<SubscriptionStatus, string> = {
  EXPIRED: "EXPIRED",
  EXPIRING_SOON: "EXPIRING SOON",
  ACTIVE: "ACTIVE",
};

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

const generateWhatsAppReceipt = ({
  studentName,
  memberId,
  daysLeft,
  dues,
  totalAmount,
  discount,
  amountPaid,
  startDateStr,
  endDateStr,
}: ReceiptData): string => {
  const startDate = formatIndianDate(startDateStr);
  const endDate = formatIndianDate(endDateStr);
  const memberIdText = memberId ?? "Pending";
  const status = getSubscriptionStatus(daysLeft);
  const statusText = STATUS_DISPLAY[status];
  const daysDisplay = Math.max(0, daysLeft);
  const finalAmount = totalAmount - discount;
  const alert = buildAlert(dues, daysLeft);

  const lines: string[] = [
    `MAA LIBRARY`,
    `Official Subscription Receipt`,
    DIVIDER,
    `Name           : ${studentName}`,
    `Member ID      : ${memberIdText}`,
    `Status         : ${statusText}`,
    `Start Date     : ${startDate}`,
    `End Date       : ${endDate}`,
    `Days Remaining : ${daysDisplay} days`,
    DIVIDER,
    `PAYMENT SUMMARY`,
    `Total Fee      : Rs. ${totalAmount}`,
    ...(discount > 0 ? [`Discount       : Rs. -${discount}`] : []),
    `Final Amount   : Rs. ${finalAmount}`,
    `Amount Paid    : Rs. ${amountPaid}`,
    `Outstanding    : Rs. ${dues}`,
    DIVIDER,
    ...(alert ? [alert, DIVIDER] : []),
    `Thank you for choosing Maa Library.`,
    ``,
    `Authorized By  : Yogendra Kumar (Owner)`,
  ];

  return lines.join("\n");
};

// Define the type based on your Prisma Schema
interface Subscription {
  id: string;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface Student {
  id: string;
  memberId: string | null;
  name: string;
  gender: string;
  phoneNumber: string;
  lockerNumber: number | null;
  address: string | null;
  subscriptions: Subscription[];
}

export default function StudentTable() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "none"
  >("all");
  const [loading, setLoading] = useState(true);

  // Action States
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students");
      const result = await response.json();
      if (result.success) setStudents(result.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const searchLower = searchTerm.toLowerCase();
      
      // FIXED: Added .toString() to s.memberId before calling .toLowerCase()
      const matchesSearch =
        s.name.toLowerCase().includes(searchLower) ||
        s.phoneNumber.includes(searchTerm) ||
        (s.memberId && s.memberId.toString().toLowerCase().includes(searchLower)) ||
        (s.lockerNumber && s.lockerNumber.toString() === searchTerm);

      if (!matchesSearch) return false;

      // Apply status filter
      if (statusFilter === "all") return true;

      const latestSub = s.subscriptions[0];
      if (!latestSub) return statusFilter === "none";

      const daysLeft = differenceInDays(
        new Date(latestSub.endDate),
        new Date(),
      );
      const isExpired = latestSub.status !== "ACTIVE" || daysLeft < 0;

      if (statusFilter === "active") return !isExpired;
      if (statusFilter === "expired") return isExpired;
      if (statusFilter === "none") return false;

      return true;
    });
  }, [students, searchTerm, statusFilter]);

  const getSubStatus = (subs: Subscription[]) => {
    if (!subs || subs.length === 0)
      return {
        label: "No Sub",
        color: "bg-muted text-muted-foreground border-border",
      };

    // Assuming the API returns the most recent subscription first
    const latestSub = subs[0];
    const daysLeft = differenceInDays(new Date(latestSub.endDate), new Date());

    if (latestSub.status !== "ACTIVE" || daysLeft < 0) {
      return {
        label: `Expired ${Math.abs(daysLeft)} days ago`,
        color: "bg-destructive/10 text-destructive border-destructive/20",
      };
    }

    if (daysLeft <= 3) {
      return {
        label: `Expires in ${daysLeft} days`,
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      };
    }

    return {
      label: `${daysLeft} days active`,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    };
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => {
      const sub = s.subscriptions[0];
      if (!sub) return false;
      const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
      return sub.status === "ACTIVE" && daysLeft >= 0;
    }).length;
    const expired = students.filter((s) => {
      const sub = s.subscriptions[0];
      if (!sub) return false;
      const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
      return sub.status !== "ACTIVE" || daysLeft < 0;
    }).length;
    const noSub = total - active - expired;
    return { total, active, expired, noSub };
  }, [students]);

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/students/${studentToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents(students.filter((s) => s.id !== studentToDelete));
        toast.success("Student deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete student:", error);
      toast.error("Failed to delete student");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Stats Section */}
      <div className="p-6 border-b border-border bg-linear-to-r from-muted/30 to-transparent">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Total Students"
            value={stats.total}
            color="bg-blue-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={stats.active}
            color="bg-emerald-500"
          />
          <StatCard
            icon={AlertCircle}
            label="Expired"
            value={stats.expired}
            color="bg-destructive"
          />
          <StatCard
            icon={Clock}
            label="No Subscription"
            value={stats.noSub}
            color="bg-amber-500"
          />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 border-b border-border space-y-4 bg-muted/10">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search by name, ID, phone, or locker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 w-full bg-background border border-border rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl w-full sm:w-auto"
          >
            <Plus className="size-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none']">
          {[
            { id: "all", label: "All", icon: null },
            { id: "active", label: "Active", icon: CheckCircle2 },
            { id: "expired", label: "Expired", icon: AlertTriangle },
            { id: "none", label: "No Subscription", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-lg whitespace-nowrap transition-all border font-medium flex items-center gap-2",
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.icon && <tab.icon className="size-4" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <Loader2 className="animate-spin text-primary size-10" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Syncing students...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="size-16 rounded-3xl bg-muted/50 border border-border flex items-center justify-center mb-4">
              <InboxIcon className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No students found
            </h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              Try adjusting your search terms.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground h-12 pl-6 w-16">
                  #
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Member ID
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Student
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Contact
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Locker
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Subscription
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12 w-24 text-center">
                  Dues
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, idx) => {
                const subStatus = getSubStatus(student.subscriptions);
                return (
                  <TableRow
                    key={student.id}
                    className="border-border hover:bg-muted/50 transition-colors group"
                  >
                    <TableCell className="pl-6 font-medium text-muted-foreground text-xs">
                      {idx + 1}
                    </TableCell>

                    {/* Clickable Member ID */}
                    <TableCell>
                      {student.memberId ? (
                        <Link
                          href={`/student/${student.id}`}
                          className="font-mono text-sm font-bold text-primary hover:underline"
                        >
                          {formatMemberId(Number(student.memberId))}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">
                          Pending
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm">
                          {getInitials(student.name)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground capitalize">
                            {student.name}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {student.gender}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone size={14} className="text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {student.phoneNumber}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {student.lockerNumber ? (
                        <div className="flex items-center gap-1.5 text-foreground bg-muted w-max px-2.5 py-1 rounded-md border border-border">
                          <KeyRound
                            size={12}
                            className="text-muted-foreground"
                          />
                          <span className="font-mono text-sm font-bold">
                            {student.lockerNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={cn(
                          "px-2.5 py-1 rounded-full font-bold border shadow-none",
                          subStatus.color,
                        )}
                      >
                        {subStatus.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      {student.subscriptions[0]
                        ? `Rs. ${(student.subscriptions[0].totalAmount - (student.subscriptions[0].discount || 0)) - student.subscriptions[0].amountPaid}`
                        : "-"}
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* WhatsApp Message Button */}
                        <Button
                          type="button"
                          title="Send WhatsApp Message"
                          className="p-2 rounded-lg transition-colors bg-background border shadow-sm hover:border-transparent text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                          onClick={() => {
                            const latestSub = student.subscriptions[0];
                            if (latestSub) {
                              const daysLeft = differenceInDays(
                                new Date(latestSub.endDate),
                                new Date(),
                              );
                              const finalAmount = latestSub.totalAmount - (latestSub.discount || 0);
                              const dues = finalAmount - latestSub.amountPaid;

                              const message = generateWhatsAppReceipt({
                                studentName: student.name,
                                memberId: student.memberId,
                                daysLeft,
                                dues,
                                totalAmount: latestSub.totalAmount,
                                discount: latestSub.discount || 0,
                                amountPaid: latestSub.amountPaid,
                                startDateStr: latestSub.startDate,
                                endDateStr: latestSub.endDate,
                              });

                              sendWhatsAppMessage(student.phoneNumber, message);
                            } else {
                              toast.error(
                                "No subscription found for this student",
                              );
                            }
                          }}
                        >
                          <WhatsappIcon />
                        </Button>

                        {/* Renew Subscription Button */}
                        <ActionBtn
                          icon={RefreshCw}
                          color="text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                          onClick={() =>
                            router.push(
                              `/renew/${student.subscriptions[0]?.id}`,
                            )
                          }
                          title="Renew Subscription"
                        />

                        {/* Edit Button */}
                        <ActionBtn
                          icon={Edit2}
                          color="text-blue-500 hover:bg-blue-500/10"
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEditDialog(true);
                          }}
                          title="Edit Student"
                        />

                        {/* Delete Button */}
                        <ActionBtn
                          icon={Trash2}
                          color="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setStudentToDelete(student.id);
                            setShowDeleteDialog(true);
                          }}
                          title="Delete"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      {selectedStudent && (
        <EditStudentDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          student={selectedStudent}
          onSuccess={fetchStudents}
        />
      )}

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchStudents}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete this student? All their
              subscription history and associated records will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              {deleting ? "Deleting..." : "Delete Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ActionBtnProps {
  icon: LucideIcon;
  color: string;
  onClick: () => void;
  title: string;
}

function ActionBtn({ icon: Icon, color, onClick, title }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-colors bg-background border border-border shadow-sm hover:border-transparent",
        color,
      )}
    >
      <Icon size={16} />
    </button>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted/30 transition-colors">
      <div className={cn("p-2.5 rounded-lg text-white", color)}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
