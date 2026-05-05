"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title?: string;
  alt?: string;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  title = "Preview",
  alt = "image",
}: Props) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const start = useRef({ x: 0, y: 0 });

  if (!imageUrl) return null;

  // Zoom
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (scale === 1) setScale(2);
    else reset();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) zoomOut();
    else zoomIn();
  };

  // Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setDragging(true);
    start.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - start.current.x,
      y: e.clientY - start.current.y,
    });
  };

  const stopDragging = () => setDragging(false);

  const zoomPercent = Math.round(scale * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] h-[92vh] p-0 bg-background border border-border rounded-xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Image preview dialog. Scroll to zoom, drag to move, or double-click to zoom.
        </DialogDescription>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur">
            <div>
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">
                Scroll to zoom • Drag to move • Double-click to zoom
              </p>
            </div>
          </div>

          {/* Viewer */}
          <div
            className="flex-1 overflow-hidden flex items-center justify-center bg-muted/30"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
              className={`select-none ${
                scale > 1
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-zoom-in"
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: dragging ? "none" : "transform 0.2s ease",
              }}
            >
              <Image
                src={imageUrl}
                alt={alt}
                width={2000}
                height={2000}
                draggable={false}
                className="max-h-[85vh] max-w-full object-contain rounded-md"
                priority
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-border bg-background/80 backdrop-blur">
            <Button
              size="icon"
              variant="outline"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="size-4" />
            </Button>

            <span className="text-sm text-foreground w-14 text-center">
              {zoomPercent}%
            </span>

            <Button
              size="icon"
              variant="outline"
              onClick={zoomIn}
              disabled={scale >= 5}
            >
              <ZoomIn className="size-4" />
            </Button>

            <div className="w-px h-5 bg-border mx-2" />

            <Button size="sm" variant="outline" onClick={reset}>
              <RotateCcw className="size-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
