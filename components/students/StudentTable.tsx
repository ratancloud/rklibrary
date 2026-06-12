"use client";
"use no memo";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { differenceInDays, format } from "date-fns";
import {
  Trash2,
  Edit2,
  Loader2,
  Search,
  InboxIcon,
  TrendingUp,
  AlertCircle,
  Phone,
  RefreshCw,
  AlertTriangle,
  LucideIcon,
  Plus,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { generateWhatsAppReceipt, sendWhatsAppMessage } from "@/lib/sendMsg";
import { WhatsappIcon } from "../icons/SocialIcons";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";
import StatCardStudent from "./StatCardStudent";

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface Subscription {
  id: string;
  floorName: string;
  seatNo: number;
  shiftName: string[];
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
  profileImageId: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarFrontId: string | null;
  aadhaarBackUrl: string | null;
  aadhaarBackId: string | null;
  subscriptions: Subscription[];
}
interface StatsCount {
  total: number;
  active: number;
  expired: number;
  none: number;
}

interface PaginatedResponse {
  success: boolean;
  data: Student[];
  total: number;
  page: number;
  pageSize: number;
  stats: StatsCount;
}

export default function StudentTable() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired" | "none"
  >("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch students with server-side parameters
  const fetchStudents = async (): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      status: statusFilter,
      ...(debouncedSearch && { search: debouncedSearch }),
    });
    const response = await fetch(`/api/students?${params}`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
  };

  const { data, isLoading } = useQuery({
    queryKey: ["students", { page, pageSize, debouncedSearch, statusFilter }],
    queryFn: fetchStudents,
    placeholderData: (prev) => prev,
  });

  const students = data?.data || [];
  const stats = data?.stats;
  const totalRecords = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Delete student mutation
  const { mutate: deleteStudent, isPending: deleting } = useMutation({
    mutationFn: async (studentId: string) => {
      const student = students.find((s: Student) => s.id === studentId);
      const imageFileIds: string[] = [];

      if (student) {
        if (student.profileImageId) imageFileIds.push(student.profileImageId);
        if (student.aadhaarFrontId) imageFileIds.push(student.aadhaarFrontId);
        if (student.aadhaarBackId) imageFileIds.push(student.aadhaarBackId);
      }

      const res = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete student");

      if (imageFileIds.length > 0) {
        await fetch("/api/imagekit/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileIds: imageFileIds }),
        }).catch((err) => console.error("Failed to delete images:", err));
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Student deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setShowDeleteDialog(false);
      setStudentToDelete(null);
    },
    onError: () => toast.error("Failed to delete student"),
  });

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
        label: `Expired ${Math.abs(daysLeft) + 1} days ago`,
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

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono">
            {(page - 1) * pageSize + row.index + 1}
          </span>
        ),
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
            <span className="text-muted-foreground text-xs italic">
              Pending
            </span>
          ),
      },
      {
        id: "student",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar
              onClick={() => {
                setPreviewImage(row.original.profileImageUrl);
                setPreviewTitle(row.original.name + "'s Profile Picture");
                setPreviewOpen(true);
              }}
              className="h-8 w-8 border border-border md:h-10 md:w-10 shrink-0 cursor-pointer"
            >
              <AvatarImage
                src={row.original.profileImageUrl || ""}
                alt={row.original.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs md:text-sm uppercase">
                {row.original.name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
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
          const subStatus = getSubStatus(row.original.subscriptions);
          return (
            <div className="text-xs">
              <p className="font-semibold">
                {format(new Date(latestSub.endDate), "dd MMM yy")}
              </p>
              <Badge
                className={cn(
                  "px-1.5 py-0 mt-0.5 text-xs font-bold border shadow-none",
                  subStatus.color,
                )}
              >
                {subStatus.label}
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
          <div className="flex items-center justify-end gap-1 md:gap-2">
            <ActionBtn
              icon={Phone}
              color="text-blue-500 hover:bg-blue-500/10"
              onClick={() =>
                window.open(`tel:${row.original.phoneNumber}`, "_blank")
              }
              title="Call"
            />
            <ActionBtn
              icon={WhatsappIcon}
              color="text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => {
                const latestSub = row.original.subscriptions[0];
                if (latestSub) {
                  const daysLeft = differenceInDays(
                    new Date(latestSub.endDate),
                    new Date(),
                  );
                  const finalAmount =
                    latestSub.totalAmount - (latestSub.discount || 0);
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
                    floorName: latestSub.floorName,
                    seatNo: latestSub.seatNo,
                    shiftName: latestSub.shiftName,
                  });
                  sendWhatsAppMessage(row.original.phoneNumber, message);
                } else {
                  toast.error("No subscription found");
                }
              }}
              title="Send WhatsApp"
            />
            <ActionBtn
              icon={RefreshCw}
              color="text-emerald-500 hover:bg-emerald-500/10"
              onClick={() =>
                router.push(`/renew/${row.original.subscriptions[0]?.id}`)
              }
              title="Renew"
            />
            <ActionBtn
              icon={Edit2}
              color="text-blue-500 hover:bg-blue-500/10"
              onClick={() => router.push(`/student/edit/${row.original.id}`)}
              title="Edit"
            />
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
    ],
    [page, pageSize, router],
  );

  // Create table instance configured for server-side pagination
  const table = useReactTable({
    data: students,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="flex flex-col h-full bg-card gap-2 md:gap-3">
      {/* Stats Section */}
      <div className="p-2 md:p-4 border-b border-border bg-linear-to-r from-primary/5 via-transparent to-secondary/5 backdrop-blur-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
          <StatCardStudent
            icon={TrendingUp}
            label="Total Students"
            value={stats?.total || 0}
            color="from-blue-500 to-blue-600"
          />
          <StatCardStudent
            icon={CheckCircle2}
            label="Active"
            value={stats?.active || 0}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCardStudent
            icon={AlertCircle}
            label="Expired"
            value={stats?.expired || 0}
            color="from-red-500 to-red-600"
          />
          <StatCardStudent
            icon={Clock}
            label="No Sub"
            value={stats?.none || 0}
            color="from-amber-500 to-amber-600"
          />
        </div>
      </div>
      {/* Search & Filters */}
      <div className="p-2 md:p-4 border-b border-border space-y-2.5 md:space-y-3 bg-linear-to-b from-muted/20 via-muted/10 to-transparent">
        <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 items-stretch md:items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder="Search by name, phone, member ID, locker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 md:h-10 w-full text-xs md:text-sm bg-background border-2 border-border rounded-lg md:rounded-lg focus:border-primary transition-all duration-200 shadow-sm focus:shadow-md focus:shadow-primary/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            onClick={() => router.push("/student/create")}
            size="sm"
            className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary rounded-lg h-9 md:h-10 px-4 md:px-6 font-medium text-xs md:text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary/15"
          >
            <Plus className="size-3.5 mr-1.5" />
            <span>Add</span>
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
              onClick={() => {
                setStatusFilter(tab.id as typeof statusFilter);
                setPage(1);
              }}
              className={cn(
                "px-2.5 md:px-4 py-1.5 md:py-1.75 text-[11px] md:text-xs rounded-md md:rounded-lg whitespace-nowrap transition-all duration-200 border font-medium flex items-center gap-1 md:gap-1.5 group relative",
                statusFilter === tab.id
                  ? "bg-linear-to-r from-primary to-primary/90 text-primary-foreground border-primary shadow-md shadow-primary/15"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground",
              )}
            >
              {tab.icon && (
                <tab.icon className="size-3 md:size-3.5 transition-transform group-hover:scale-110" />
              )}
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
          <div className="flex flex-col justify-center items-center gap-3 px-2 overflow-x-auto py-4">
            <div className="w-full animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex gap-2 mb-2 last:mb-0">
                  <div className="h-8 bg-muted rounded w-10" />
                  <div className="h-8 bg-muted rounded w-40" />
                  <div className="h-8 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-30 hidden md:inline-block" />
                  <div className="h-8 bg-muted rounded w-24 hidden md:inline-block" />
                  <div className="h-8 bg-muted rounded w-24 hidden md:inline-block" />
                  <div className="h-8 bg-muted rounded w-50" />
                </div>
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
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
                  <TableRow
                    key={headerGroup.id}
                    className="border-b border-border hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-bold text-primary/70 h-9 md:h-10 px-1.5 md:px-3 text-[10px] md:text-xs whitespace-nowrap uppercase tracking-tight"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                          cell.getContext(),
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

      {/* Backend Pagination Panel */}
      {students.length > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t bg-muted/20">
          <p className="text-xs md:text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {students.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {totalRecords}
            </span>{" "}
            records
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-medium rounded-md px-2.5 py-1.5 h-auto hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <ChevronLeft className="size-4 md:hidden" />
              <span className="hidden md:inline">Previous</span>
            </Button>
            <span className="text-xs md:text-sm font-semibold px-3 py-1.5 bg-muted rounded-lg border min-w-20 text-center">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-xs font-medium rounded-md px-2.5 py-1.5 h-auto hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              <ChevronRight className="size-4 md:hidden" />
              <span className="hidden md:inline">Next</span>
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
              subscription history, records, and associated images will be
              permanently removed.
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
              onClick={() => studentToDelete && deleteStudent(studentToDelete)}
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

      {/* Document Preview Dialog */}
      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        imageUrl={previewImage}
        title={previewTitle}
      />
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────
interface ActionBtnProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
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
        "p-2 rounded-lg transition-all duration-200 bg-background border border-border shadow-sm hover:shadow-md hover:border-transparent text-xs md:text-sm",
        "flex items-center justify-center",
        "active:scale-95 hover:scale-105",
        color,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
