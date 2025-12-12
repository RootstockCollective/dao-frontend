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
import { useId, useState, useRef, useCallback, useEffect } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { motion } from 'motion/react'
import { Heading1, Heading2, Heading3 } from 'lucide-react'
import { ErrorMessage } from './ErrorMessage'
import { commands, type ICommand } from '@uiw/react-md-editor'

// Dynamic import to avoid SSR issues (editor uses browser APIs)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const ICON_SIZE = 17

// Custom heading commands with Lucide icons (replacing default text-based ones)
const heading1Command: ICommand = {
  name: 'heading1',
  shortcuts: 'ctrlcmd+alt+1',
  keyCommand: 'heading1',
  buttonProps: { 'aria-label': 'Heading 1', title: 'Heading 1' },
  icon: <Heading1 size={ICON_SIZE} />,
  execute: (state, api) => {
    api.replaceSelection(`# ${state.selectedText}`)
  },
}

const heading2Command: ICommand = {
  name: 'heading2',
  shortcuts: 'ctrlcmd+alt+2',
  keyCommand: 'heading2',
  buttonProps: { 'aria-label': 'Heading 2', title: 'Heading 2' },
  icon: <Heading2 size={ICON_SIZE} />,
  execute: (state, api) => {
    api.replaceSelection(`## ${state.selectedText}`)
  },
}

const heading3Command: ICommand = {
  name: 'heading3',
  shortcuts: 'ctrlcmd+alt+3',
  keyCommand: 'heading3',
  buttonProps: { 'aria-label': 'Heading 3', title: 'Heading 3' },
  icon: <Heading3 size={ICON_SIZE} />,
  execute: (state, api) => {
    api.replaceSelection(`### ${state.selectedText}`)
  },
}

// Toolbar configuration: formatting, headings, lists, and utilities
const editorCommands: ICommand[] = [
  commands.bold,
  commands.italic,
  commands.strikethrough,
  commands.divider,
  heading1Command,
  heading2Command,
  heading3Command,
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

// Height offset: toolbar (~41px) + label padding (~24px) + margins
const TOOLBAR_OFFSET = 70

/**
 * EditorContent - Inner component that renders the actual editor
 * Separated to allow useEffect hooks that depend on `value` prop
 */
interface EditorContentProps {
  id: string
  label: string
  value: string
  onChange: (val: string) => void
  error?: string
  maxLength?: number
  minHeight: number
  dataTestId?: string
}

function EditorContent({
  id,
  label,
  value,
  onChange,
  error,
  maxLength,
  minHeight,
  dataTestId,
}: EditorContentProps) {
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  /**
   * Adjusts editor height based on content.
   * Directly manipulates DOM since MDEditor doesn't expose textarea ref.
   */
  const adjustHeight = useCallback(() => {
    if (!wrapperRef.current) return
    const textarea = wrapperRef.current.querySelector('textarea')
    const editorContainer = wrapperRef.current.querySelector('.w-md-editor') as HTMLElement
    if (!textarea || !editorContainer) return

    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    const newHeight = Math.max(minHeight, scrollHeight + TOOLBAR_OFFSET)

    textarea.style.height = `${scrollHeight}px`
    editorContainer.style.height = `${newHeight}px`
  }, [minHeight])

  // MutationObserver watches for textarea to appear (needed for dynamic import)
  useEffect(() => {
    if (!wrapperRef.current) return

    const textarea = wrapperRef.current.querySelector('textarea')
    if (textarea) {
      adjustHeight()
      return
    }

    const observer = new MutationObserver(() => {
      const ta = wrapperRef.current?.querySelector('textarea')
      if (ta) {
        adjustHeight()
        observer.disconnect()
      }
    })

    observer.observe(wrapperRef.current, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [adjustHeight])

  // Adjust on window resize
  useEffect(() => {
    window.addEventListener('resize', adjustHeight)
    return () => window.removeEventListener('resize', adjustHeight)
  }, [adjustHeight])

  const hasValue = value !== undefined && value !== null && value !== ''
  const shouldFloat = isFocused || hasValue

  return (
    <ErrorMessage errorMsg={error} dataTestId={dataTestId ? `${dataTestId}Error` : undefined}>
      <div className="flex flex-col gap-2">
        <div className="relative" data-color-mode="dark">
          <motion.label
            htmlFor={id}
            className="absolute left-4 z-10 pointer-events-none origin-left font-rootstock-sans text-bg-0"
            initial={false}
            animate={{
              // Toolbar is ~41px
              // When floating: right under toolbar (~49px)
              // When not floating: inside content area as placeholder (~75px)
              top: shouldFloat ? 49 : 75,
              scale: shouldFloat ? 0.75 : 1,
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            {label}
          </motion.label>
          <div className="markdown-editor-wrapper" ref={wrapperRef}>
            <MDEditor
              value={value}
              onChange={val => {
                const newValue = val || ''
                // Enforce maxLength if specified
                const truncated = maxLength ? newValue.slice(0, maxLength) : newValue
                onChange(truncated)
                requestAnimationFrame(adjustHeight)
              }}
              preview="edit"
              commands={editorCommands}
              extraCommands={[]}
              data-testid={dataTestId}
              textareaProps={{
                id, // For label association
                onFocus: () => setIsFocused(true),
                onBlur: () => setIsFocused(false),
                maxLength,
              }}
            />
          </div>
        </div>
        {maxLength && (
          <span className="text-xs text-text-60 text-right">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
    </ErrorMessage>
  )
}

export function MarkdownEditor<T extends FieldValues>({
  label,
  name,
  control,
  maxLength,
  minHeight = 150,
  'data-testid': dataTestId,
}: MarkdownEditorProps<T>) {
  const id = useId()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <EditorContent
          id={id}
          label={label}
          value={value || ''}
          onChange={onChange}
          error={error?.message}
          maxLength={maxLength}
          minHeight={minHeight}
          dataTestId={dataTestId}
        />
      )}
    />
  )
}
