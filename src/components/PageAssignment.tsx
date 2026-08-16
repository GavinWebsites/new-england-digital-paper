import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import type { DocumentImage, TextSection } from '../types'

type Assignable =
  | { kind: 'section'; item: TextSection }
  | { kind: 'image'; item: DocumentImage }

interface PageAssignmentProps {
  pageCount: number
  sections: TextSection[]
  images: DocumentImage[]
  onAssignSection: (id: string, page: number) => void
  onAssignImage: (id: string, page: number) => void
}

export function PageAssignment({
  pageCount,
  sections,
  images,
  onAssignSection,
  onAssignImage,
}: PageAssignmentProps) {
  const [dragging, setDragging] = useState<Assignable | null>(null)

  const unassigned = [
    ...sections.map((item) => ({ kind: 'section' as const, item })),
    ...images.map((item) => ({ kind: 'image' as const, item })),
  ]

  const dropOnPage = (page: number) => {
    if (!dragging) return
    if (dragging.kind === 'section') onAssignSection(dragging.item.id, page)
    else onAssignImage(dragging.item.id, page)
    setDragging(null)
  }

  return (
    <div className="panel-block">
      <div className="panel-block-head">
        <h3>
          <LayoutGrid size={15} />
          Page Assignment
        </h3>
        <span className="hint">Drag items onto a page, or use the dropdowns above</span>
      </div>

      <div className="assignment-pool">
        {unassigned.length === 0 ? (
          <p className="empty-hint">Add sections or images to assign them.</p>
        ) : (
          unassigned.map((entry) => {
            const label =
              entry.kind === 'section' ? entry.item.title : entry.item.label
            return (
              <button
                key={`${entry.kind}-${entry.item.id}`}
                type="button"
                className="chip"
                draggable
                onDragStart={() => setDragging(entry)}
                onDragEnd={() => setDragging(null)}
              >
                <span className="chip-kind">
                  {entry.kind === 'section' ? 'Text' : 'Img'}
                </span>
                <span className="chip-label">{label || 'Untitled'}</span>
                <span className="chip-page">P{entry.item.page}</span>
              </button>
            )
          })
        )}
      </div>

      <div className="assignment-grid">
        {Array.from({ length: pageCount }, (_, i) => {
          const page = i + 1
          const pageSections = sections.filter((s) => s.page === page)
          const pageImages = images.filter((img) => img.page === page)
          return (
            <div
              key={page}
              className={`drop-zone ${dragging ? 'active' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                dropOnPage(page)
              }}
            >
              <div className="drop-zone-title">Page {page}</div>
              <ul>
                {pageSections.map((s) => (
                  <li key={s.id}>§ {s.title || 'Untitled'}</li>
                ))}
                {pageImages.map((img) => (
                  <li key={img.id}>◻ {img.label || 'Untitled image'}</li>
                ))}
                {pageSections.length === 0 && pageImages.length === 0 ? (
                  <li className="muted">Drop content here</li>
                ) : null}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
