/**
 * MarkdownEditor - A form-integrated markdown editor with floating label
 *
 * Uses @uiw/react-md-editor under the hood with custom styling and auto-height.
 * Integrates with react-hook-form via Controller.
 *
 * Features:
 * - Floating label animation (Material Design style)
 * - Auto-growing height based on content
 * - Custom toolbar with Lucide icons for headings
 * - Dark theme styling via CSS variables
 */
'use client'

import dynamic from 'next/dynamic'
import { useId, useState, useRef } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { motion } from 'motion/react'
import { Heading1, Heading2, Heading3, type LucideIcon } from 'lucide-react'
import { ErrorMessage } from './ErrorMessage'
import { commands, type ICommand } from '@uiw/react-md-editor'
import { useAutoHeight } from '@/shared/hooks'

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const ICON_SIZE = 17
const TOOLBAR_OFFSET = 69

const createHeadingCommand = (level: 1 | 2 | 3, Icon: LucideIcon): ICommand => {
  const hashes = '#'.repeat(level)
  return {
    name: `heading${level}`,
    keyCommand: `heading${level}`,
    shortcuts: `ctrlcmd+alt+${level}`,
    buttonProps: { 'aria-label': `Heading ${level}`, title: `Heading ${level}` },
    icon: <Icon size={ICON_SIZE} />,
    execute: (state, api) => {
      api.replaceSelection(`${hashes} ${state.selectedText}`)
    },
  }
}

// Configuration
const editorCommands: ICommand[] = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  createHeadingCommand(1, Heading1),
  createHeadingCommand(2, Heading2),
  createHeadingCommand(3, Heading3),
  commands.divider,
  commands.unorderedListCommand,
  commands.orderedListCommand,
  commands.divider,
  commands.link,
  commands.quote,
  commands.code,
]
interface MarkdownEditorProps<T extends FieldValues> {
  label: string
  name: FieldPath<T>
  control: Control<T>
  maxLength?: number
  minHeight?: number
  'data-testid'?: string
}

interface EditorContentProps extends Omit<MarkdownEditorProps<FieldValues>, 'control' | 'name'> {
  id: string
  value: string
  onChange: (val: string) => void
  error?: string
}

function EditorContent({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  minHeight = 150,
  'data-testid': dataTestId,
}: EditorContentProps) {
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Use our custom hook to handle the height logic
  useAutoHeight(wrapperRef, value, {
    elementSelector: 'textarea',
    containerSelector: '.w-md-editor',
    containerOffset: TOOLBAR_OFFSET,
    minHeight: minHeight - TOOLBAR_OFFSET,
  })

  const hasValue = value !== undefined && value !== null && value !== ''
  const shouldFloat = isFocused || hasValue

  return (
    <ErrorMessage errorMsg={error} dataTestId={dataTestId ? `${dataTestId}Error` : undefined}>
      <div className="flex flex-col gap-2">
        <div className="relative" data-color-mode="dark">
          {/* Floating Label */}
          <motion.label
            htmlFor={id}
            className="absolute left-4 z-base pointer-events-none origin-left font-rootstock-sans text-bg-0"
            initial={false}
            animate={{
              top: shouldFloat ? 49 : 75,
              scale: shouldFloat ? 0.75 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {label}
          </motion.label>

          {/* Editor Container */}
          <div className="markdown-editor-wrapper" ref={wrapperRef}>
            <MDEditor
              value={value}
              onChange={val => {
                const newValue = val || ''
                // Early return for maxLength prevents state update
                if (maxLength && newValue.length > maxLength) return
                onChange(newValue)
              }}
              preview="edit"
              commands={editorCommands}
              visibleDragbar={false}
              extraCommands={[]}
              textareaProps={{
                id, // For label association
                onFocus: () => setIsFocused(true),
                onBlur: () => setIsFocused(false),
                maxLength,
                ...({ 'data-testid': dataTestId } as Record<string, unknown>),
              }}
            />
          </div>
        </div>

        {/* Character Count */}
        {maxLength && (
          <span className="text-xs text-text-60 text-right">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
    </ErrorMessage>
  )
}

export function MarkdownEditor<T extends FieldValues>({ name, control, ...props }: MarkdownEditorProps<T>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <EditorContent id={id} value={value || ''} onChange={onChange} error={error?.message} {...props} />
      )}
    />
  )
}
