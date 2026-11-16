import type { JSONContent } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { IconButton } from '../../ui/IconButton'
import styles from './NoteEditor.module.css'

interface NoteEditorProps {
  content: JSONContent
  onChange: (content: JSONContent) => void
  /** Nombre accesible del área de texto. */
  label: string
}

const TOOLS = [
  { name: 'bold', icon: 'format_bold', label: 'Negrita' },
  { name: 'italic', icon: 'format_italic', label: 'Cursiva' },
  { name: 'bulletList', icon: 'format_list_bulleted', label: 'Lista con viñetas' },
  { name: 'orderedList', icon: 'format_list_numbered', label: 'Lista numerada' },
  { name: 'blockquote', icon: 'format_quote', label: 'Cita' },
] as const

type ToolName = (typeof TOOLS)[number]['name']

/** Editor de texto enriquecido del apunte. Guarda JSON, nunca HTML. */
export function NoteEditor({ content, onChange, label }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        link: false,
        horizontalRule: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: styles.prose ?? '',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  })

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      Object.fromEntries(
        TOOLS.map((tool) => [tool.name, current?.isActive(tool.name) ?? false]),
      ) as Record<ToolName, boolean>,
  })

  const run = (tool: ToolName) => {
    if (!editor) return
    const chain = editor.chain().focus()
    const commands = {
      bold: () => chain.toggleBold(),
      italic: () => chain.toggleItalic(),
      bulletList: () => chain.toggleBulletList(),
      orderedList: () => chain.toggleOrderedList(),
      blockquote: () => chain.toggleBlockquote(),
    }
    commands[tool]().run()
  }

  return (
    <div className={styles.editor}>
      <div role="toolbar" aria-label="Formato del apunte" className={styles.toolbar}>
        {TOOLS.map((tool) => (
          <IconButton
            key={tool.name}
            icon={tool.icon}
            label={tool.label}
            aria-pressed={active?.[tool.name] ?? false}
            className={active?.[tool.name] ? styles.activeTool : undefined}
            onClick={() => run(tool.name)}
          />
        ))}
      </div>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  )
}
