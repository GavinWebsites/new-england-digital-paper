import { GripVertical, Plus, Trash2 } from 'lucide-react'
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
              <textarea
                className="body-input"
                rows={4}
                value={section.body}
                onChange={(e) => onUpdate(section.id, { body: e.target.value })}
                placeholder="Write section content…"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
