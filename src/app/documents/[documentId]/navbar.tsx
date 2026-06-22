"use client";
import Image from "next/image";
import { BsFilePdf } from "react-icons/bs";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  FileIcon, FileJsonIcon, GlobeIcon, FileTextIcon, FilePlusIcon,
  FilePenIcon, TrashIcon, PrinterIcon, Undo2Icon, Redo2Icon,
  TextIcon, BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  RemoveFormattingIcon, ChevronRightIcon,
  Inbox
} from "lucide-react";
import Link from "next/link";
import { DocumentInput } from "./document-input";
import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/use-editor-store";
import { Avatars } from "./avatars";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RenameDialog } from "@/components/rename-dialog";
import { RemoveDialog } from "@/components/remove-dialog";

interface NavbarProps {
  data: Doc<"documents">;
};

// ── Custom Menu primitives ──────────────────────────────────────────

interface MenuItemProps {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
  children?: React.ReactNode; // submenu
}


const MenuItem = ({ label, icon, shortcut, onClick, children }: MenuItemProps) => {
  const [subOpen, setSubOpen] = useState(false);
  const hasChildren = Boolean(children);

  return (
    <div
      className="relative"
      onMouseEnter={() => hasChildren && setSubOpen(true)}
      onMouseLeave={() => hasChildren && setSubOpen(false)}
    >
      <button
        onMouseDown={(e: React.MouseEvent) => {
          e.preventDefault();
          if (!hasChildren && onClick) onClick();
        }}
        className="w-full flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 whitespace-nowrap"
      >
        {icon && <span className="size-4 flex items-center justify-center">{icon}</span>}
        <span className="flex-1 text-left">{label}</span>
        {shortcut && <span className="ml-4 text-xs text-neutral-400">{shortcut}</span>}
        {hasChildren && <ChevronRightIcon className="size-3 ml-2 text-neutral-400" />}
      </button>
      {hasChildren && subOpen && (
        <div
          className="absolute left-full top-0 bg-white border border-neutral-200 rounded-md shadow-lg p-1 flex flex-col gap-y-0.5 min-w-[160px]"
          style={{ zIndex: 99999 }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const MenuSeparator = () => (
  <div className="my-1 h-px bg-neutral-200" />
);

interface NavMenuProps {
  label: string;
  children: React.ReactNode;
}

const NavMenu = ({ label, children }: NavMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="text-sm font-normal py-0.5 px-[7px] rounded-sm hover:bg-muted h-auto"
      >
        {label}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg p-1 flex flex-col gap-y-0.5 min-w-[180px]"
          style={{ zIndex: 99999 }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ── Navbar ──────────────────────────────────────────────────────────

export const Navbar = ({data}: NavbarProps) => {
   const router = useRouter();
   const { editor } = useEditorStore();
   const mutation = useMutation(api.documents.create);

   const onNewDocument = () => {
    mutation({
      title: "Untitled document",
      initialContent: ""
    })
    .catch(() => toast.error("Something went wrong"))
    .then((id) => {
      toast.success("Document created");
      router.push(`/documents/${id}`);
    });
  }
  const insertTable = ({rows,cols}:{rows:number,cols:number})=>{
  editor
  ?.chain()
  .focus()
  .insertTable({rows,cols,withHeaderRow:false})
  .run()
};

const onDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const onSaveJSON = () => {
    if (!editor) return;

    const content = editor.getJSON();
    const blob = new Blob([JSON.stringify(content)], {
      type: "application/json",
    });
    onDownload(blob, `${data.title}.json`)
  };

  const onSaveHTML = () => {
    if (!editor) return;

    const content = editor.getHTML();
    const blob = new Blob([content], {
      type: "text/html",
    });
    onDownload(blob, `${data.title}.html`)
  };

  const onSaveText = () => {
    if (!editor) return;

    const content = editor.getText();
    const blob = new Blob([content], {
      type: "text/plain",
    });
    onDownload(blob, `${data.title}.txt`)
  };

  return (
    <nav className="flex items-center justify-between" style={{ overflow: "visible" }}>
      <div className="flex gap-2 items-center" style={{ overflow: "visible" }}>
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={36} height={36} />
        </Link>
        <div className="flex flex-col" style={{ overflow: "visible" }}>
          <DocumentInput  title={data.title} id={data._id}/>
          <div className="flex items-center gap-x-0.5" style={{ overflow: "visible" }}>

            {/* FILE */}
            <NavMenu label="File">
              <MenuItem
                label="Save"
                icon={<FileIcon className="size-4" />}
              >
                <MenuItem label="JSON" icon={<FileJsonIcon className="size-4" />} onClick={onSaveJSON} />
                <MenuItem label="HTML" icon={<GlobeIcon className="size-4" />} onClick={onSaveHTML} />
                <MenuItem label="PDF" icon={<BsFilePdf className="size-4" />} onClick={()=>window.print()} />
                <MenuItem label="Text" icon={<FileTextIcon className="size-4" />} onClick={onSaveText} />
              </MenuItem>
              <MenuItem label="New Document" icon={<FilePlusIcon className="size-4" />} onClick={onNewDocument} />
              <MenuSeparator />
              <RenameDialog documentId={data._id} initialTitle={data.title}>
  <button
    className="w-full flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 whitespace-nowrap"
    onClick={(e) => e.stopPropagation()}
  >
    <FilePenIcon className="size-4" />
    <span className="flex-1 text-left">Rename</span>
  </button>
</RenameDialog>
              <RemoveDialog documentId={data._id}>
               <button
    className="w-full flex items-center gap-x-2 px-3 py-1.5 text-sm rounded-sm hover:bg-neutral-100 whitespace-nowrap"
    onClick={(e) => e.stopPropagation()}
  >
    <TrashIcon className="size-4" />
    <span className="flex-1 text-left">Remove</span>
  </button>
              </RemoveDialog>
              <MenuSeparator />
              <MenuItem label="Print" icon={<PrinterIcon className="size-4" />} shortcut="⌘P" onClick={() => window.print()} />
            </NavMenu>

            {/* EDIT */}
            <NavMenu label="Edit">
              <MenuItem
                label="Undo"
                icon={<Undo2Icon className="size-4" />}
                shortcut="⌘Z"
                onClick={() => editor?.chain().focus().undo().run()}
              />
              <MenuItem
                label="Redo"
                icon={<Redo2Icon className="size-4" />}
                shortcut="⌘Y"
                onClick={() => editor?.chain().focus().redo().run()}
              />
            </NavMenu>

            {/* INSERT */}
            <NavMenu label="Insert">
              <MenuItem label="Table" icon={<FileIcon className="size-4" />}>
                <MenuItem label="1 x 1" onClick={() => insertTable({ rows: 1, cols: 1 })} />
                <MenuItem label="2 x 2" onClick={() => insertTable({ rows: 2, cols: 2 })} />
                <MenuItem label="3 x 3" onClick={() => insertTable({ rows: 3, cols: 3 })} />
                <MenuItem label="4 x 4" onClick={() => insertTable({ rows: 4, cols: 4 })} />
              </MenuItem>
            </NavMenu>

            {/* FORMAT */}
            <NavMenu label="Format">
              <MenuItem label="Text" icon={<TextIcon className="size-4" />}>
                <MenuItem label="Bold" icon={<BoldIcon className="size-4" />} shortcut="⌘B" onClick={() => editor?.chain().focus().toggleBold().run()} />
                <MenuItem label="Italic" icon={<ItalicIcon className="size-4" />} shortcut="⌘I" onClick={() => editor?.chain().focus().toggleItalic().run()} />
                <MenuItem label="Underline" icon={<UnderlineIcon className="size-4" />} shortcut="⌘U" onClick={() => editor?.chain().focus().toggleUnderline().run()} />
                <MenuItem label="Strikethrough" icon={<StrikethroughIcon className="size-4" />} shortcut="⌘S" onClick={() => editor?.chain().focus().toggleStrike().run()} />
              </MenuItem>
              <MenuItem
                label="Clear formatting"
                icon={<RemoveFormattingIcon className="size-4" />}
                onClick={() => editor?.chain().focus().unsetAllMarks().run()}
              />
            </NavMenu>

          </div>
        </div>
      </div>
      <div className="flex gap-3 items-center pl-6">

                <Avatars/>
                <Inbox/>
                <OrganizationSwitcher
                afterCreateOrganizationUrl="/"
                afterLeaveOrganizationUrl="/"
                afterSelectOrganizationUrl="/"
                afterSelectPersonalUrl="/"
                />
        <UserButton/>
        </div>
    </nav>
  );
};
