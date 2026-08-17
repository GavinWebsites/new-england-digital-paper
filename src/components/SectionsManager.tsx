import { Bold, GripVertical, Italic, Plus, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { toggleMarkdownStyle } from '../lib/richText'
import type { TextSection } from '../types'

interface SectionsManagerProps {
  sections: TextSection[]
  pageCount: number
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<TextSection, 'id'>>) => void
  onRemove: (id: string) => void
}

export function SectionsManager({
  sections,
  pageCount,
  onAdd,
  onUpdate,
  onRemove,
}: SectionsManagerProps) {
  return (
    <div className="panel-block">
      <div className="panel-block-head">
        <h3>Typed Sections</h3>
        <button type="button" className="btn-ghost" onClick={onAdd}>
          <Plus size={14} />
          Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="empty-hint">No sections yet. Add text blocks to place across pages.</p>
      ) : (
        <ul className="item-list">
          {sections.map((section) => (
            <li key={section.id} className="item-card">
              <div className="item-card-top">
                <GripVertical size={14} className="grip" aria-hidden />
                <input
                  className="title-input"
                  value={section.title}
                  onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                  placeholder="Section title"
                />
                <select
                  className="page-select"
                  value={section.page}
                  onChange={(e) =>
                    onUpdate(section.id, { page: Number(e.target.value) })
                  }
                  aria-label={`Assign ${section.title} to page`}
                >
                  {Array.from({ length: pageCount }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => onRemove(section.id)}
                  aria-label="Remove section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <SectionBodyEditor
                section={section}
                onUpdate={onUpdate}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SectionBodyEditor({
  section,
  onUpdate,
}: {
  section: TextSection
  onUpdate: (id: string, patch: Partial<Omit<TextSection, 'id'>>) => void
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const applyStyle = (style: 'bold' | 'italic') => {
    const el = inputRef.current
    if (!el) return
    const next = toggleMarkdownStyle(el.value, el.selectionStart, el.selectionEnd, style)
    onUpdate(section.id, { body: next.value })
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(next.start, next.end)
    })
  }

  return (
    <>
      <div className="format-bar">
        <button
          type="button"
          className="format-btn"
          title="Bold (Ctrl+B)"
          aria-label="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyStyle('bold')}
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          className="format-btn"
          title="Italic (Ctrl+I)"
          aria-label="Italic"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyStyle('italic')}
        >
          <Italic size={13} />
        </button>
        <p className="format-hint">Select text, then B or I</p>
      </div>
      <textarea
        ref={inputRef}
        className="body-input"
        rows={4}
        value={section.body}
        onChange={(e) => onUpdate(section.id, { body: e.target.value })}
        onKeyDown={(event) => {
          if (!(event.metaKey || event.ctrlKey)) return
          const key = event.key.toLowerCase()
          if (key === 'b') {
            event.preventDefault()
            applyStyle('bold')
          } else if (key === 'i') {
            event.preventDefault()
            applyStyle('italic')
          }
        }}
        placeholder="Write section content… use **bold** or *italic*"
      />
    </>
  )
}
