"use client";

import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Eye,
  Edit2,
  Loader2,
  Search,
  Filter,
  InboxIcon,
  Phone,
  Clock,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import InquiryStatusDialog from "./InquiryStatusDialog";
import InquiryDetailsDialog from "./InquiryDetailsDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { cn } from "@/lib/utils";
import { Inquiry } from "@/types/inqueriy";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { WhatsappIcon } from "../icons/SocialIcons";

export default function InquiryTable() {
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);

  useEffect(() => {
    const fetchAllInquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/inquiry");
        const result = await response.json();
        if (result.success) setAllInquiries(result.data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllInquiries();
  }, []);

  const filteredInquiries = useMemo(() => {
    return allInquiries.filter((inquiry) => {
      const matchesSearch =
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.phoneNumber.includes(searchTerm);
      const matchesStatus =
        statusFilter === "ALL" || inquiry.status === statusFilter;
      const matchesShift =
        shiftFilter === "ALL" ||
        inquiry.shiftNames.some((shift) =>
          shift.toLowerCase().includes(shiftFilter.toLowerCase()),
        );
      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [allInquiries, searchTerm, statusFilter, shiftFilter]);

  const openDeleteDialog = (inquiry: Inquiry) => {
    setInquiryToDelete(inquiry);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    try {
      setDeleting(inquiryToDelete.id);
      await fetch(`/api/inquiry/${inquiryToDelete.id}`, { method: "DELETE" });
      setAllInquiries(
        allInquiries.filter((inq) => inq.id !== inquiryToDelete.id),
      );
      setShowDeleteDialog(false);
      setInquiryToDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedInquiry) return;
    try {
      const response = await fetch(`/api/inquiry/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const result = await response.json();
        setAllInquiries(
          allInquiries.map((inq) =>
            inq.id === selectedInquiry.id ? result.data : inq,
          ),
        );
        toast.success("Status updated successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const sendWhatsapp = (phone: string, name: string) => {
    const msg = encodeURIComponent(
      `Hello ${name}, we received your library membership inquiry. We will get back to you soon!`,
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  const statusStyles = {
    PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    CONTACTED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    CONVERTED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Sleek Toolbar */}
      <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-border rounded-xl focus-visible:ring-primary focus-visible:border-transparent transition-all w-full"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 h-11 bg-background border-border rounded-xl font-medium">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-full md:w-40 h-11 bg-background border-border rounded-xl font-medium">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted-foreground" />
                <SelectValue placeholder="Shift" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Shifts</SelectItem>
              <SelectItem value="MORNING">Morning</SelectItem>
              <SelectItem value="AFTERNOON">Afternoon</SelectItem>
              <SelectItem value="EVENING">Evening</SelectItem>
              <SelectItem value="NIGHT">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80 gap-4">
            <Loader2 className="animate-spin text-primary size-10" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
              Syncing inquiries...
            </p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="size-16 rounded-3xl bg-muted/50 border border-border flex items-center justify-center mb-4">
              <InboxIcon className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No inquiries found
            </h3>
            <p className="text-muted-foreground max-w-sm mt-1">
              Try adjusting your filters or search terms to find what
              you&apos;re looking for.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-muted-foreground h-12 pl-6">
                  Student Info
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Contact
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Shifts
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Requested On
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12">
                  Status
                </TableHead>
                <TableHead className="font-bold text-muted-foreground h-12 text-right pr-6">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries.map((inq) => (
                <TableRow
                  key={inq.id}
                  className="border-border hover:bg-muted/50 transition-colors group"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                        {getInitials(inq.name)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{inq.name}</p>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {inq.gender}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone size={14} className="text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {inq.phoneNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap max-w-30">
                      {inq.shiftNames?.map((shift) => (
                        <span
                          key={shift}
                          className="text-[10px] font-bold bg-muted border border-border text-foreground px-2 py-0.5 rounded-md"
                        >
                          {shift.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(inq.createdAt), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Join:{" "}
                      {inq.joiningDate
                        ? format(new Date(inq.joiningDate), "MMM dd")
                        : "TBD"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "px-2.5 py-1 rounded-full font-bold border",
                        statusStyles[inq.status],
                      )}
                    >
                      {inq.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        className="p-2 rounded-lg transition-colors bg-background border border-border shadow-sm hover:border-transparent text-green-500 hover:bg-green-500/10"
                        onClick={() => sendWhatsapp(inq.phoneNumber, inq.name)}
                      >
                       <WhatsappIcon />
                      </Button>
                      <ActionBtn
                        icon={Eye}
                        color="text-blue-500 hover:bg-blue-500/10"
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setShowDetailsDialog(true);
                        }}
                        title="View"
                      />
                      <ActionBtn
                        icon={Edit2}
                        color="text-amber-500 hover:bg-amber-500/10"
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setShowStatusDialog(true);
                        }}
                        title="Status"
                      />
                      <ActionBtn
                        icon={deleting === inq.id ? Loader2 : Trash2}
                        color="text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteDialog(inq)}
                        title="Delete"
                        spin={deleting === inq.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center text-sm text-muted-foreground font-medium">
        Showing {filteredInquiries.length}{" "}
        {filteredInquiries.length === 1 ? "inquiry" : "inquiries"}
      </div>

      {selectedInquiry && (
        <>
          <InquiryStatusDialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
            inquiry={selectedInquiry}
            onStatusChange={handleStatusUpdate}
          />
          <InquiryDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            inquiry={selectedInquiry}
          />
        </>
      )}

      {inquiryToDelete && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          isLoading={deleting === inquiryToDelete.id}
          inquiryName={inquiryToDelete.name}
        />
      )}
    </div>
  );
}

interface ActionBtnProps {
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  title: string;
  spin?: boolean;
}

function ActionBtn({
  icon: Icon,
  color,
  onClick,
  title,
  spin = false,
}: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-colors bg-background border border-border shadow-sm hover:border-transparent",
        color,
      )}
    >
      <Icon size={16} className={spin ? "animate-spin" : ""} />
    </button>
  );
}
