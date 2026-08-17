import { useEffect, useRef } from 'react'
import { Download, FilePlus, Trash2, Upload, X } from 'lucide-react'
import type { SavedDocumentMeta } from '../types'

interface SavesPanelProps {
  open: boolean
  currentId: string
  saves: SavedDocumentMeta[]
  onClose: () => void
  onOpen: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onImport: (file: File) => void
  onDownload: () => void
}

function formatStamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString()
}

export function SavesPanel({
  open,
  currentId,
  saves,
  onClose,
  onOpen,
  onNew,
  onDelete,
  onImport,
  onDownload,
}: SavesPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="saves-overlay no-print" onClick={onClose}>
      <section
        className="saves-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="saves-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="saves-panel-head">
          <div>
            <h2 id="saves-title">Saved documents</h2>
            <p>Open any save to keep editing it. Changes autosave back to that document.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="saves-toolbar">
          <button type="button" className="btn-ghost" onClick={onNew}>
            <FilePlus size={14} />
            New document
          </button>
          <button type="button" className="btn-ghost" onClick={onDownload}>
            <Download size={14} />
            Download JSON
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} />
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImport(file)
              e.target.value = ''
            }}
          />
        </div>

        {saves.length === 0 ? (
          <p className="empty-hint">No saved documents yet. Create one or import a JSON file.</p>
        ) : (
          <ul className="saves-list">
            {saves.map((save) => {
              const active = save.id === currentId
              return (
                <li key={save.id} className={`saves-item ${active ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="saves-open"
                    onClick={() => onOpen(save.id)}
                  >
                    <span className="saves-name">
                      {save.name}
                      {active ? <em>Open now</em> : null}
                    </span>
                    <span className="saves-meta">
                      {save.pageCount} page{save.pageCount === 1 ? '' : 's'} ·{' '}
                      {formatStamp(save.updatedAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    aria-label={`Delete ${save.name}`}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete “${save.name}”? This removes it from the library.`,
                        )
                      ) {
                        onDelete(save.id)
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
