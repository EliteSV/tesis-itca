import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bold, Italic, List, ListOrdered, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe aquí...',
  className,
  maxLength,
  error,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanedContent = html.replace(/<p><\/p>/g, '').trim();
      
      if (maxLength) {
        const textLength = cleanedContent.replace(/<[^>]*>/g, '').length;
        if (textLength > maxLength) {
          return;
        }
      }
      
      onChange(cleanedContent || '');
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2 text-sm',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  const textLength = value ? value.replace(/<[^>]*>/g, '').length : 0;

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'rounded-md border border-input bg-transparent shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('bold') && 'bg-accent',
            )}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('italic') && 'bg-accent',
            )}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('underline') && 'bg-accent',
            )}
            title="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('strike') && 'bg-accent',
            )}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('bulletList') && 'bg-accent',
            )}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('orderedList') && 'bg-accent',
            )}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive({ textAlign: 'left' }) && 'bg-accent',
            )}
            title="Alinear izquierda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive({ textAlign: 'center' }) && 'bg-accent',
            )}
            title="Alinear centro"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive({ textAlign: 'right' }) && 'bg-accent',
            )}
            title="Alinear derecha"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt('Ingresa la URL del enlace:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={cn(
              'h-7 w-7 p-0',
              editor.isActive('link') && 'bg-accent',
            )}
            title="Insertar enlace"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Deshacer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Rehacer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor Content */}
        <div className="relative min-h-[150px] max-h-[400px] overflow-y-auto">
          <EditorContent
            editor={editor}
            className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:prose-sm [&_.ProseMirror]:prose-headings:font-semibold [&_.ProseMirror]:prose-p:my-2 [&_.ProseMirror]:prose-ul:my-2 [&_.ProseMirror]:prose-ol:my-2"
          />
          {!value && editor.isEmpty && (
            <div className="absolute top-2 left-3 pointer-events-none text-muted-foreground text-sm">
              {placeholder}
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-muted-foreground mt-1">
          {textLength}/{maxLength} caracteres
        </p>
      )}
    </div>
  );
}
