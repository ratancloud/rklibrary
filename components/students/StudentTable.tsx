"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import {
  Trash2,
  Edit2,
  Loader2,
  Search,
  InboxIcon,
  Phone,
  RefreshCw,
  AlertTriangle,
  LucideIcon,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
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
import { formatMemberId } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { sendWhatsAppMessage } from "@/lib/sendMsg";
import { WhatsappIcon } from "../icons/SocialIcons";
import Image from "next/image";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  memberId: number | null;
  name: string;
  gender: string;
  aadhaarNumber: string | null;
  phoneNumber: string;
  fatherName: string;
  fatherPhone: string;
  temporaryAddress: string | null;
  address: string | null;
  lockerNumber: number | null;
  profileImageUrl: string | null;
  subscriptions: Subscription[];
}

interface ReceiptData {
  studentName: string;
  memberId: string | number | null;
  daysLeft: number;
  dues: number;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  startDateStr: string;
  endDateStr: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  const daysDisplay = Math.max(0, daysLeft);
  const finalAmount = totalAmount - discount;
  const alert = buildAlert(dues, daysLeft);

  const lines: string[] = [
    `RK LIBRARY`,
    `Official Subscription Receipt`,
    DIVIDER,
    `Name           : ${studentName}`,
    `Member ID      : ${memberIdText}`,
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
    `Thank you for choosing RK Library.`,
    ``,
    `Authorized By  : Rajan Prakash (Owner)`,
  ];

  return lines.join("\n");
};

export default function StudentTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "none"
  >("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch students using React Query
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await fetch("/api/students");
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  const students = useMemo(() => studentsData || [], [studentsData]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s: Student) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        s.name.toLowerCase().includes(searchLower) ||
        s.phoneNumber.includes(searchTerm) ||
        (s.memberId && s.memberId.toString().includes(searchTerm)) ||
        (s.lockerNumber && s.lockerNumber.toString() === searchTerm);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;

      const latestSub = s.subscriptions[0];
      if (!latestSub) return statusFilter === "none";

      const daysLeft = differenceInDays(
        new Date(latestSub.endDate),
        new Date()
      );
      const isExpired = latestSub.status !== "ACTIVE" || daysLeft < 0;

      if (statusFilter === "active") return !isExpired;
      if (statusFilter === "expired") return isExpired;
      if (statusFilter === "none") return false;

      return true;
    });
  }, [students, searchTerm, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s: Student) => {
      const sub = s.subscriptions[0];
      if (!sub) return false;
      const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
      return sub.status === "ACTIVE" && daysLeft >= 0;
    }).length;
    const expired = students.filter((s: Student) => {
      const sub = s.subscriptions[0];
      if (!sub) return false;
      const daysLeft = differenceInDays(new Date(sub.endDate), new Date());
      return sub.status !== "ACTIVE" || daysLeft < 0;
    }).length;
    const noSub = total - active - expired;
    return { total, active, expired, noSub };
  }, [students]);

  // Get subscription status with colors
  const getSubStatus = (subs: Subscription[]) => {
    if (!subs || subs.length === 0)
      return {
        label: "No Sub",
        color: "bg-muted text-muted-foreground border-border",
      };

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

  // Delete student
  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/students/${studentToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Student deleted successfully");
        // Refetch students
        window.location.reload();
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

  // Define columns for TanStack Table
  const columns: ColumnDef<Student>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => row.index + 1,
      size: 40,
    },
    {
      id: "memberId",
      header: "Member ID",
      accessorKey: "memberId",
      cell: ({ row }) =>
        row.original.memberId ? (
          <Link
            href={`/student/${row.original.id}`}
            className="font-mono text-xs font-bold text-primary hover:underline"
          >
            {formatMemberId(row.original.memberId)}
          </Link>
        ) : (
          <span className="text-muted-foreground text-xs italic">Pending</span>
        ),
    },
    {
      id: "student",
      header: "Student",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src={row.original.profileImageUrl || "/default-avatar.png"}
            alt={row.original.name}
            width={40}
            height={40}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-border shrink-0"
          />
          <div className="min-w-0">
            <p className="font-bold text-foreground capitalize text-xs md:text-sm truncate">
              {row.original.name}
            </p>
            <p className="text-[8px] md:text-[10px] text-muted-foreground">
              {row.original.gender}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorKey: "phoneNumber",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs">
          <Phone size={12} className="text-muted-foreground" />
          <span>{row.original.phoneNumber}</span>
        </div>
      ),
    },
    {
      id: "aadhar",
      header: "Aadhar",
      accessorKey: "aadhaarNumber",
      cell: ({ row }) =>
        row.original.aadhaarNumber ? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.aadhaarNumber.slice(-4).padStart(12, "*")}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      id: "father",
      header: "Father",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="font-semibold text-foreground truncate">
            {row.original.fatherName}
          </p>
          <p className="text-muted-foreground flex items-center gap-0.5">
            <Phone size={10} />
            {row.original.fatherPhone}
          </p>
        </div>
      ),
    },
    {
      id: "locker",
      header: "Locker",
      accessorKey: "lockerNumber",
      cell: ({ row }) =>
        row.original.lockerNumber ? (
          <Badge variant="secondary" className="text-xs">
            #{row.original.lockerNumber}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      id: "expiry",
      header: "Expiry",
      cell: ({ row }) => {
        const latestSub = row.original.subscriptions[0];
        if (!latestSub)
          return <span className="text-muted-foreground text-xs">-</span>;

        const daysLeft = differenceInDays(
          new Date(latestSub.endDate),
          new Date()
        );
        const subStatus = getSubStatus(row.original.subscriptions);

        return (
          <div className="text-xs">
            <p className="font-semibold">
              {format(new Date(latestSub.endDate), "dd MMM yy")}
            </p>
            <Badge
              className={cn(
                "px-1.5 py-0 mt-0.5 text-xs font-bold border shadow-none",
                subStatus.color
              )}
            >
              {daysLeft < 0
                ? `Expired ${Math.abs(daysLeft)}d`
                : daysLeft <= 3
                  ? `${daysLeft}d left`
                  : `Active`}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "dues",
      header: "Dues",
      cell: ({ row }) => {
        const latestSub = row.original.subscriptions[0];
        if (!latestSub)
          return <span className="text-muted-foreground text-xs">-</span>;

        const finalAmount = latestSub.totalAmount - (latestSub.discount || 0);
        const dues = finalAmount - latestSub.amountPaid;

        return (
          <span className="font-semibold text-amber-600 text-xs">
            ₹{dues}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          {/* SMS */}
          <ActionBtn
            icon={Phone}
            color="text-blue-500 hover:bg-blue-500/10"
            onClick={() => {
              const msg = encodeURIComponent(
                `Hi ${row.original.name}, this is from RK Library.`
              );
              window.open(`sms:${row.original.phoneNumber}?body=${msg}`, "_blank");
            }}
            title="Send SMS"
          />

          {/* WhatsApp */}
          <Button
            type="button"
            title="Send WhatsApp"
            className="p-1.5 rounded-lg transition-colors bg-background border shadow-sm hover:border-transparent text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
            onClick={() => {
              const latestSub = row.original.subscriptions[0];
              if (latestSub) {
                const daysLeft = differenceInDays(
                  new Date(latestSub.endDate),
                  new Date()
                );
                const finalAmount = latestSub.totalAmount - (latestSub.discount || 0);
                const dues = finalAmount - latestSub.amountPaid;

                const message = generateWhatsAppReceipt({
                  studentName: row.original.name,
                  memberId: row.original.memberId,
                  daysLeft,
                  dues,
                  totalAmount: latestSub.totalAmount,
                  discount: latestSub.discount || 0,
                  amountPaid: latestSub.amountPaid,
                  startDateStr: latestSub.startDate,
                  endDateStr: latestSub.endDate,
                });

                sendWhatsAppMessage(row.original.phoneNumber, message);
              } else {
                toast.error("No subscription found");
              }
            }}
          >
            <WhatsappIcon className="size-3.5" />
          </Button>

          {/* Renew */}
          <ActionBtn
            icon={RefreshCw}
            color="text-emerald-500 hover:bg-emerald-500/10"
            onClick={() =>
              router.push(`/renew/${row.original.subscriptions[0]?.id}`)
            }
            title="Renew"
          />

          {/* Edit */}
          <ActionBtn
            icon={Edit2}
            color="text-blue-500 hover:bg-blue-500/10"
            onClick={() => router.push(`/student/edit/${row.original.id}`)}
            title="Edit"
          />

          {/* Delete */}
          <ActionBtn
            icon={Trash2}
            color="text-destructive hover:bg-destructive/10"
            onClick={() => {
              setStudentToDelete(row.original.id);
              setShowDeleteDialog(true);
            }}
            title="Delete"
          />
        </div>
      ),
    },
  ];

  // Create table instance
  const table = useReactTable({
    data: filteredStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex flex-col h-full bg-card gap-2 md:gap-3">
      {/* Stats Section */}
      <div className="p-2 md:p-4 border-b border-border bg-linear-to-r from-primary/5 via-transparent to-secondary/5 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
          <StatCard
            icon={TrendingUp}
            label="Total Students"
            value={stats.total}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            label="Active"
            value={stats.active}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={AlertCircle}
            label="Expired"
            value={stats.expired}
            color="from-red-500 to-red-600"
          />
          <StatCard
            icon={Clock}
            label="No Sub"
            value={stats.noSub}
            color="from-amber-500 to-amber-600"
          />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-2 md:p-4 border-b border-border space-y-2.5 md:space-y-3 bg-linear-to-b from-muted/20 via-muted/10 to-transparent">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 items-stretch md:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder="Search by name, phone, member ID, locker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 md:h-10 w-full text-xs md:text-sm bg-background border-2 border-border rounded-lg md:rounded-lg focus:border-primary transition-all duration-200 shadow-sm focus:shadow-md focus:shadow-primary/10"
            />
          </div>

          <Button
            onClick={() => router.push("/student/create")}
            size="sm"
            className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary rounded-lg h-9 md:h-10 px-4 md:px-6 font-medium text-xs md:text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/15"
          >
            <Plus className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">Add</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:h-0.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-track]:bg-transparent">
          {[
            { id: "all", label: "All", icon: null },
            { id: "active", label: "Active", icon: CheckCircle2 },
            { id: "expired", label: "Expired", icon: AlertTriangle },
            { id: "none", label: "No Sub", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={cn(
                "px-2.5 md:px-4 py-1.5 md:py-1.75 text-[11px] md:text-xs rounded-md md:rounded-lg whitespace-nowrap transition-all duration-200 border font-medium flex items-center gap-1 md:gap-1.5 group relative",
                statusFilter === tab.id
                  ? "bg-linear-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-md shadow-primary/15"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground"
              )}
            >
              {tab.icon && <tab.icon className="size-3 md:size-3.5 transition-transform group-hover:scale-110" />}
              <span>{tab.label}</span>
              {statusFilter === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-white to-transparent opacity-50 rounded-b" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <div className="relative">
              <Loader2 className="animate-spin text-primary size-8" />
              <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full blur-xl" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-medium">
                Loading students...
              </p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="size-14 rounded-full bg-linear-to-br from-muted to-muted/50 border border-border flex items-center justify-center mb-3 shadow-md">
              <InboxIcon className="size-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              No students found
            </h3>
            <p className="text-muted-foreground max-w-sm mt-1 text-xs">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="bg-linear-to-r from-muted/40 via-muted/30 to-muted/40 border-b-2 border-primary/10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-bold text-primary/70 h-9 md:h-10 px-1.5 md:px-3 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-tight"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-primary/5 transition-all duration-200 group hover:shadow-sm"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-1.5 md:px-3 py-2 text-[11px] md:text-xs whitespace-nowrap group-hover:text-foreground transition-colors"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredStudents.length > 0 && (
        <div className="px-2 md:px-4 py-2 border-t border-border bg-linear-to-r from-muted/20 via-muted/10 to-muted/20 flex items-center justify-between text-xs">
          <div className="font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-{Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredStudents.length
            )}</span>
            <span className="text-muted-foreground"> of </span>
            <span className="text-foreground font-semibold">{filteredStudents.length}</span>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-xs font-medium rounded-md px-2.5 py-1 h-auto hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-xs font-medium rounded-md px-2.5 py-1 h-auto hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              →
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to delete this student? All their
              subscription history and records will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
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
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

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
        "p-1 rounded-md transition-colors bg-background border border-border shadow-sm hover:border-transparent text-xs",
        color
      )}
    >
      <Icon size={12} />
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
    <div className="group relative overflow-hidden rounded-lg border border-border bg-linear-to-br from-background to-muted/20 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:shadow-primary/10">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/5 transition-all duration-300" />
      
      <div className="relative flex items-center gap-2 md:gap-3 p-2.5 md:p-3">
        {/* Icon background */}
        <div className={cn(
          "p-1.5 md:p-2 rounded-md text-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md",
          `bg-linear-to-br ${color}`
        )}>
          <Icon className="size-3 md:size-4" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-tight leading-tight">
            {label}
          </p>
          <p className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
