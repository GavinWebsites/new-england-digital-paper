import { Minus, Plus } from 'lucide-react'
import type { DocumentDraft, DocumentImage, TextSection } from '../types'
import { LogoUploader } from './LogoUploader'
import { SectionsManager } from './SectionsManager'
import { ImagesManager } from './ImagesManager'
import { PageAssignment } from './PageAssignment'

interface ControlPanelProps {
  draft: DocumentDraft
  onUpdate: (patch: Partial<DocumentDraft>) => void
  onPageCount: (count: number) => void
  onAddSection: () => void
  onUpdateSection: (id: string, patch: Partial<Omit<TextSection, 'id'>>) => void
  onRemoveSection: (id: string) => void
  onAddImage: () => void
  onUpdateImage: (id: string, patch: Partial<Omit<DocumentImage, 'id'>>) => void
  onRemoveImage: (id: string) => void
}

export function ControlPanel({
  draft,
  onUpdate,
  onPageCount,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onAddImage,
  onUpdateImage,
  onRemoveImage,
}: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <div className="panel-block">
        <div className="panel-block-head">
          <h3>Document</h3>
        </div>
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={draft.documentTitle}
            onChange={(e) => onUpdate({ documentTitle: e.target.value })}
            placeholder="Document title"
          />
        </label>

        <div className="field">
          <span>Page count</span>
          <div className="stepper">
            <button
              type="button"
              className="icon-btn"
              onClick={() => onPageCount(draft.pageCount - 1)}
              aria-label="Fewer pages"
              disabled={draft.pageCount <= 1}
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              min={1}
              max={20}
              value={draft.pageCount}
              onChange={(e) => onPageCount(Number(e.target.value))}
              aria-label="Number of pages"
            />
            <button
              type="button"
              className="icon-btn"
              onClick={() => onPageCount(draft.pageCount + 1)}
              aria-label="More pages"
              disabled={draft.pageCount >= 20}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <LogoUploader
        logoSrc={draft.logoSrc}
        onChange={(logoSrc) => onUpdate({ logoSrc })}
      />

      <SectionsManager
        sections={draft.sections}
        pageCount={draft.pageCount}
        onAdd={onAddSection}
        onUpdate={onUpdateSection}
        onRemove={onRemoveSection}
      />

      <ImagesManager
        images={draft.images}
        pageCount={draft.pageCount}
        onAdd={onAddImage}
        onUpdate={onUpdateImage}
        onRemove={onRemoveImage}
      />

      <PageAssignment
        pageCount={draft.pageCount}
        sections={draft.sections}
        images={draft.images}
        onAssignSection={(id, page) => onUpdateSection(id, { page })}
        onAssignImage={(id, page) => onUpdateImage(id, { page })}
      />
    </aside>
  )
}
