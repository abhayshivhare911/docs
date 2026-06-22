"use client";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, FilePenIcon, MoreVertical, TrashIcon } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { RemoveDialog } from "@/components/remove-dialog";
import { useState, useRef } from "react";
import { RenameDialog } from "@/components/rename-dialog";

interface DocumentMenuProps {
  documentId: Id<"documents">;
  title: string;
  onNewTab: (id: Id<"documents">) => void;
}

export const DocumentMenu = ({ documentId, title, onNewTab }: DocumentMenuProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.right - 160 + window.scrollX,
      });
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      <Button
        ref={btnRef}
        variant="ghost"
        size="icon"
        className="rounded-full"
        onClick={handleOpen}
      >
        <MoreVertical className="size-4" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
            className="bg-white border border-neutral-200 rounded-md shadow-md p-1 flex flex-col gap-y-0.5 min-w-[160px]"
          >
            <RenameDialog documentId={documentId} initialTitle={title}>
              <button
                className="flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 w-full text-left"
                onClick={(e) => {
                  e.stopPropagation();
                 //setOpen(false);
                }}
              >
                <FilePenIcon  className="size-4" />
                Rename
              </button>
            </RenameDialog>

            <RemoveDialog documentId={documentId}>
              <button
                className="flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 w-full text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  //setOpen(false);
                }}
              >
                <TrashIcon className="size-4" />
                Remove
              </button>
            </RemoveDialog>
            <button
              className="flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 w-full text-left"
              onClick={(e) => {
                e.stopPropagation();
                onNewTab(documentId);
                setOpen(false);
              }}
            >
              <ExternalLinkIcon className="size-4" />
              Open in a new tab
            </button>
          </div>
        </>
      )}
    </div>
  );
};