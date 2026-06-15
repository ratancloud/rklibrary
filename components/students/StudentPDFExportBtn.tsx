"use client";

import { useMemo } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Loader2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentPDF } from "../pdf/StudentPDF";
import { cn } from "@/lib/utils";
import { formatMemberId } from "@/lib/helper";

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
  profileImageUrl: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  createdAt: string;
}

interface Props {
  student: Student;
}

export default function StudentPDFExportBtn({ student }: Props) {
  const pdfDocument = useMemo(() => <StudentPDF student={student} />, [student]);
  const fileName = `${student.name.replace(/\s+/g, "_")}_Profile.pdf`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          title="Export PDF"
          className={cn(
            "p-2 rounded-lg transition-all duration-200 bg-background border border-border shadow-sm hover:shadow-md hover:border-transparent text-xs md:text-sm",
            "flex items-center justify-center",
            "active:scale-95 hover:scale-105",
            "text-indigo-500 hover:bg-indigo-500/10"
          )}
        >
          <FileText className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="px-4 py-3 border-b bg-muted/20 shrink-0">
          <div className="flex flex-row items-center justify-between pr-6 gap-4">
            <div className="flex flex-col space-y-1 text-left">
              <DialogTitle className="text-base md:text-lg">
                Student Record: <span className="text-primary">{student.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Preview and download the official admission document.
              </DialogDescription>
            </div>

            {/* Desktop Download Button - Hidden on mobile */}
            <div className="hidden sm:block shrink-0">
              <PDFDownloadLink
                document={pdfDocument}
                fileName={fileName}
              >
                {({ loading }) => (
                  <Button size="sm" className="gap-2 shadow-sm" disabled={loading}>
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileDown className="size-4" />
                    )}
                    <span>{loading ? "Generating..." : "Download PDF"}</span>
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>
        </DialogHeader>

        {/* Desktop View: Full PDF Viewer */}
        <div className="flex-1 bg-muted/10 hidden sm:block overflow-hidden relative">
          <PDFViewer width="100%" height="100%" className="border-none absolute inset-0">
            {pdfDocument}
          </PDFViewer>
        </div>

        {/* Mobile View: Friendly Fallback UI */}
        <div className="flex-1 flex flex-col items-center p-6 sm:hidden bg-linear-to-b from-muted/10 to-background text-center overflow-y-auto">
          
          <div className="size-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 shadow-inner">
            <FileText className="size-8 text-indigo-500" />
          </div>
          
          <h3 className="font-bold text-xl text-foreground tracking-tight mb-2">
            Document Ready
          </h3>
          <p className="text-sm text-muted-foreground max-w-70 leading-relaxed mb-6">
            Live preview is disabled on mobile for better performance. Review the details below and save the document.
          </p>
          
          {/* Detailed Mobile Card */}
          <div className="w-full max-w-sm bg-card rounded-xl p-5 border border-border shadow-sm text-left space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border/50 pb-2 flex items-center gap-1.5">
                <User className="size-3.5" /> Student Details
              </p>
              
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Name:</span>
                  <span className="font-medium text-foreground truncate">{student.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Member ID:</span>
                  <span className="font-medium text-foreground">{student.memberId ? `${formatMemberId(student.memberId)}` : 'Pending'}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Phone No:</span>
                  <span className="font-medium text-foreground">{student.phoneNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Father&apos;s Name:</span>
                  <span className="font-medium text-foreground truncate">{student.fatherName}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-muted-foreground shrink-0">Gender:</span>
                  <span className="font-medium text-foreground">{student.gender}</span>
                </div>
              </div>
            </div>

            {/* Mobile Download Button - Now inside the card at the bottom */}
            <div className="pt-2 border-t border-border/50">
              <PDFDownloadLink
                document={pdfDocument}
                fileName={fileName}
                className="w-full block"
              >
                {({ loading }) => (
                  <Button 
                    size="default" 
                    className="w-full gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-[0.98]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileDown className="size-4" />
                    )}
                    {loading ? "Generating PDF..." : "Save PDF to Device"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}