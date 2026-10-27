'use client'

import React, { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Bold,
  Italic,
  Strikethrough,
  UnderlineIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  UnlinkIcon,
  ImageIcon,
  Loader2,
  Table as TableIcon,
  ChevronDown,
  Columns,
  Rows,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  editorRef?: MutableRefObject<Editor | null>
  onUploadImage?: (file: File) => Promise<string>
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing your content...',
  className,
  editable = true,
  editorRef,
  onUploadImage,
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-600 dark:text-emerald-400 underline cursor-pointer',
        },
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-3 border border-border shadow-xs',
        },
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-3 border border-border text-xs rounded-lg',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class:
            'border border-border bg-muted/50 p-2 text-left font-semibold text-foreground text-xs',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2 text-foreground text-xs align-top',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      lastEmittedRef.current = editor.getHTML()
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4 [&_img]:max-w-full [&_img]:rounded-lg',
          className,
        ),
      },
    },
  })

  // Expose editor instance for cursor-aware inserts from the parent toolbar.
  const lastEmittedRef = React.useRef<string>(content)
  useEffect(() => {
    if (editorRef) editorRef.current = editor
    return () => {
      if (editorRef) editorRef.current = null
    }
  }, [editor, editorRef])

  // Sync external content changes (token inserts, loaded drafts) into the
  // editor. Typing echoes back through onChange, so skip sync when the new
  // prop matches what the editor just emitted.
  useEffect(() => {
    if (!editor) return
    if (content === lastEmittedRef.current) return
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
    lastEmittedRef.current = content
  }, [editor, content])

  const addLink = () => {
    if (!editor) return
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const removeLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }

  const handleImageButtonClick = () => {
    if (!editor) return
    if (onUploadImage && fileInputRef.current) {
      fileInputRef.current.click()
    } else {
      const url = window.prompt('Enter Image URL:')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor || !onUploadImage) return
    try {
      setIsUploadingImage(true)
      const url = await onUploadImage(file)
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-muted')}
            title="Bold"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-muted')}
            title="Italic"
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-muted')}
            title="Underline"
          >
            <UnderlineIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('strike') && 'bg-muted')}
            title="Strikethrough"
          >
            <Strikethrough className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('code') && 'bg-muted')}
            title="Inline Code"
          >
            <Code className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn('h-8 w-8 p-0', editor.isActive('heading', { level: 3 }) && 'bg-muted')}
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('bulletList') && 'bg-muted')}
            title="Bullet List"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn('h-8 w-8 p-0', editor.isActive('orderedList') && 'bg-muted')}
            title="Numbered List"
          >
            <ListOrdered className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Block Formatting / Callout Box */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              'h-8 w-8 p-0',
              editor.isActive('blockquote') && 'bg-muted text-emerald-600 dark:text-emerald-400',
            )}
            title="Callout Box"
          >
            <Quote className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Table Tools */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2 gap-1 text-xs cursor-pointer',
                  editor.isActive('table') &&
                    'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30',
                )}
                title="Table Tools"
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline text-[11px]">Table</span>
                <ChevronDown className="size-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 text-xs">
              {!editor.isActive('table') ? (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
                        .run()
                    }
                    className="cursor-pointer gap-2"
                  >
                    <TableIcon className="size-3.5 text-emerald-500" />
                    <span>Insert 2 × 3 Card Table</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 4, cols: 3, withHeaderRow: true })
                        .run()
                    }
                    className="cursor-pointer gap-2"
                  >
                    <TableIcon className="size-3.5 text-emerald-500" />
                    <span>Insert 3 × 4 Grid Table</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="cursor-pointer gap-2"
                  >
                    <Rows className="size-3.5" />
                    <span>Add Row Above</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="cursor-pointer gap-2"
                  >
                    <Rows className="size-3.5" />
                    <span>Add Row Below</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className="cursor-pointer gap-2"
                  >
                    <Columns className="size-3.5" />
                    <span>Add Column Left</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="cursor-pointer gap-2"
                  >
                    <Columns className="size-3.5" />
                    <span>Add Column Right</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Row</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Column</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Table</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Table Actions when cursor is inside a table */}
          {editor.isActive('table') && (
            <div className="flex items-center gap-0.5 bg-emerald-500/10 p-0.5 rounded border border-emerald-500/20">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="h-7 px-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                title="Add Row Below"
              >
                +Row
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="h-7 px-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                title="Add Column Right"
              >
                +Col
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="h-7 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
                title="Delete Current Row"
              >
                -Row
              </Button>
            </div>
          )}

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Links */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={cn('h-8 w-8 p-0', editor.isActive('link') && 'bg-muted')}
            title="Add Link"
          >
            <LinkIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeLink}
            disabled={!editor.isActive('link')}
            className="h-8 w-8 p-0"
            title="Remove Link"
          >
            <UnlinkIcon className="size-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Image Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleImageButtonClick}
            disabled={isUploadingImage}
            className="h-8 w-8 p-0"
            title={onUploadImage ? 'Upload Image' : 'Insert Image URL'}
          >
            {isUploadingImage ? (
              <Loader2 className="size-4 animate-spin text-emerald-500" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo"
          >
            <Undo className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo"
          >
            <Redo className="size-4" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}
