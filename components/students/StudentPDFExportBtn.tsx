"use client";

import { useMemo, useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { File, FileDown, FileText, Layers, Loader2, User } from "lucide-react";
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
  const [mode, setMode] = useState<'single' | 'multiple'>('single');
  const pdfDocument = useMemo(() => <StudentPDF student={student} mode={mode} />, [student, mode]);
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

            {/* Desktop Layout Toggles */}
            <div className="hidden sm:flex bg-muted rounded-lg p-1 border border-border">
              <button
                onClick={() => setMode('single')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                  mode === 'single' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <File className="size-3.5" /> 1-Page
              </button>
              <button
                onClick={() => setMode('multiple')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all",
                  mode === 'multiple' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="size-3.5" /> 3-Page
              </button>
            </div>

            <div className="hidden sm:block shrink-0">
              <PDFDownloadLink document={pdfDocument} fileName={fileName}>
                {({ loading }) => (
                  <Button size="sm" className="gap-2 shadow-sm" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
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
            Live preview is disabled on mobile for better performance. Select your layout and save below.
          </p>
          
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
              </div>
            </div>

            {/* Mobile Layout Toggle */}
            <div className="bg-muted rounded-lg p-1 border border-border flex w-full">
              <button
                onClick={() => setMode('single')}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-md flex justify-center items-center gap-1.5 transition-all",
                  mode === 'single' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <File className="size-4" /> Single Page
              </button>
              <button
                onClick={() => setMode('multiple')}
                className={cn(
                  "flex-1 py-2 text-xs font-medium rounded-md flex justify-center items-center gap-1.5 transition-all",
                  mode === 'multiple' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <Layers className="size-4" /> Multi Page
              </button>
            </div>

            <div className="pt-2 border-t border-border/50">
              <PDFDownloadLink document={pdfDocument} fileName={fileName} className="w-full block">
                {({ loading }) => (
                  <Button 
                    size="default" 
                    className="w-full gap-2 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-[0.98]" 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
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