"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Search, FileText, X, Home } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MonthPicker from "@/components/MonthPicker";

// Types
interface HistoryRecord {
  id: string;
  libraryId: string;
  studentId: string | null;
  floorName: string;
  seatNo: number;
  shiftName: string[];
  studentName: string;
  studentGender: string;
  studentPhone: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  status: string;
  createdAt: string;
  memberIdFormatted: string;
}

interface HistoryResponse {
  data: HistoryRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// Month helpers
const CURRENT_MONTH_VALUE = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

const MONTH_LABELS: Record<string, string> = {};
(() => {
  const today = new Date();
  for (let i = -12; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    MONTH_LABELS[value] = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
})();

// Status config
const STATUS_CONFIG: Record<
  string,
  { dot: string; text: string; bg: string; border: string; label: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  EXPIRED: {
    label: "Expired",
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
};

const columnHelper = createColumnHelper<HistoryRecord>();

// ── Main Component ────────────────────────────────────────────────────────────
export default function HistoryClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH_VALUE);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchHistory = async (): Promise<HistoryResponse> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      month: selectedMonth,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    });
    const res = await fetch(`/api/history?${params}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "history",
      { page, pageSize, selectedMonth, debouncedSearch, statusFilter },
    ],
    queryFn: fetchHistory,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (isError && error)
      toast.error(
        error instanceof Error ? error.message : "Failed to load history",
      );
  }, [isError, error]);

  const records = data?.data || [];
  const totalRecords = data?.total || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const monthLabel =
    MONTH_LABELS[selectedMonth] ||
    new Date(selectedMonth + "-01").toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "serial",
        header: () => <div className="text-center">#</div>,
        cell: (info) => (
          <div className="text-center text-xs font-mono text-muted-foreground">
            #{(page - 1) * pageSize + info.row.index + 1}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Date",
        cell: (info) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-medium">
              {new Date(info.getValue()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("memberIdFormatted", {
        header: "Member ID",
        cell: (info) => (
          <Link
            href={`/student/${info.row.original.studentId}`}
            className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 font-mono text-xs font-bold text-primary hover:bg-primary/20 transition-all"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("studentName", {
        header: "Student",
        cell: (info) => (
          <div className="flex items-center gap-2.5 min-w-37.5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {info.getValue().charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">
                {info.getValue()}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                {info.row.original.studentGender}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("studentPhone", {
        header: "Mobile",
        cell: (info) => (
          <a
            href={`tel:${info.getValue()}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="font-medium">+91-{info.getValue()}</span>
          </a>
        ),
      }),
      columnHelper.accessor("seatNo", {
        header: "Seat",
        cell: (info) => (
          <div className="flex flex-col gap-1.5 min-w-32.5">
            <span className="text-sm font-semibold">
              {info.row.original.floorName} ·{" "}
              <span className="text-primary">Seat {info.getValue()}</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {info.row.original.shiftName.map((shift) => (
                <span
                  key={shift}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium border"
                >
                  {shift}
                </span>
              ))}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("totalAmount", {
        header: "Price",
        cell: (info) => {
          const total = info.getValue();
          const discount = info.row.original.discount || 0;
          const finalAmount = total - discount;
          return (
            <div className="flex flex-col gap-1.5 min-w-32">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total:</span>
                <span className="text-sm font-semibold">₹{total.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-destructive">Discount:</span>
                  <span className="text-sm font-semibold text-destructive">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-1 border-t flex items-center justify-between">
                <span className="text-xs font-semibold">Final:</span>
                <span className="text-sm font-bold text-primary">₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("amountPaid", {
        header: "Financials",
        cell: (info) => {
          const paid = info.getValue();
          const total = info.row.original.totalAmount;
          const discount = info.row.original.discount || 0;
          const finalAmount = total - discount;
          const due = finalAmount - paid;
          const pct = Math.min(100, Math.round((paid / finalAmount) * 100));
          const full = paid >= finalAmount;
          return (
            <div className="flex flex-col gap-1.5 min-w-27.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold">₹{paid.toLocaleString()}</span>
                <span className="text-muted-foreground">
                  / ₹{finalAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${full ? "bg-emerald-500" : "bg-amber-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {!full && (
                <span className="text-[10px] font-semibold text-destructive">
                  ₹{due.toLocaleString()} due
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("startDate", {
        header: "Duration",
        cell: (info) => (
          <div className="flex flex-col text-xs text-muted-foreground whitespace-nowrap gap-0.5">
            <span className="font-medium text-foreground">
              {new Date(info.getValue()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>
              →{" "}
              {new Date(info.row.original.endDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const cfg = STATUS_CONFIG[info.getValue()] ?? {
            label: info.getValue(),
            dot: "bg-muted-foreground",
            text: "text-muted-foreground",
            bg: "bg-muted",
            border: "border",
          };
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          );
        },
      }),
    ],
    [page, pageSize],
  );

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // ── PDF Export ────────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        export: "true",
      });
      const res = await fetch(`/api/history?${params}`);
      if (!res.ok) throw new Error("Failed to fetch data for PDF");
      const csvText = await res.text();
      const rows = csvText
        .split("\n")
        .map((r) => r.split(",").map((c) => c.replace(/^"|"$/g, "")));
      const doc = new jsPDF("landscape");
      doc.setFontSize(16);
      doc.text(`Maa Library Subscriptions - ${monthLabel}`, 14, 15);
      autoTable(doc, {
        head: [rows[0]],
        body: rows.slice(1),
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [15, 23, 42] },
      });
      doc.save(`history-${selectedMonth}.pdf`);
      toast.success("PDF exported successfully");
    } catch {
      toast.error("PDF Export failed");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center justify-between mt-24 mb-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">
                  <Home className="w-4 h-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary">
                {monthLabel} History
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Month Picker */}
        <MonthPicker
          value={selectedMonth}
          onChange={(v) => {
            setSelectedMonth(v);
            setPage(1);
          }}
        />
      </div>

      {/* Table card */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b flex flex-col xl:flex-row items-center gap-3">
          <div className="relative w-full xl:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search name, phone, floor…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-muted/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full xl:w-37.5 bg-muted/40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>

          <div className="xl:ml-auto flex items-center gap-2 flex-wrap">
            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {statusFilter}
                <button onClick={() => setStatusFilter("ALL")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                &quot;{debouncedSearch}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <Button onClick={handleExportPDF} className="gap-2">
              <FileText size={15} /> Export PDF
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                {table.getHeaderGroups().map((hg) =>
                  hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="border-b">
                    {columns.map((_, ci) => (
                      <TableCell key={ci} className="py-4">
                        <Skeleton className="h-8 w-full rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b hover:bg-muted/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                        <History className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">
                          No records found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your search or filters for {monthLabel}.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {records.length}
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
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm font-semibold px-3 py-1.5 bg-muted rounded-lg border min-w-20 text-center">
              {page} / {Math.max(1, totalPages)}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
