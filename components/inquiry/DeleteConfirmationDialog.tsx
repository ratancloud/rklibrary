"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  inquiryName?: string;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  inquiryName = "this inquiry",
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-full bg-destructive/10">
              <AlertCircle className="size-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg">Delete Inquiry</DialogTitle>
          </div>
          <DialogDescription className="text-foreground font-medium">
            Are you sure you want to delete{" "}
            <span className="font-bold">{inquiryName}</span>&apos;s inquiry?
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          This action cannot be undone. The inquiry and all associated data will be permanently deleted.
        </p>

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="size-4 animate-spin border-2 border-destructive-foreground border-t-transparent rounded-full" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Inquiry
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
