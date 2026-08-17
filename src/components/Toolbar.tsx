import { Eraser, FilePlus, FolderOpen, Printer, Save } from 'lucide-react'
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from '../brand'
import type { SaveStatus } from '../hooks/useDocumentStore'

interface ToolbarProps {
  saveStatus: SaveStatus
  saveError: string | null
  currentName: string
  updatedAt: string
  onSave: () => void
  onOpen: () => void
  onNew: () => void
  onClear: () => void
  onPrint: () => void
}

export function Toolbar({
  saveStatus,
  saveError,
  currentName,
  updatedAt,
  onSave,
  onOpen,
  onNew,
  onClear,
  onPrint,
}: ToolbarProps) {
  const statusLabel =
    saveStatus === 'saved'
      ? `Saved · ${currentName}`
      : saveStatus === 'cleared'
        ? 'Document cleared'
        : saveStatus === 'error'
          ? saveError || 'Save failed'
          : updatedAt
            ? `${currentName} · ${new Date(updatedAt).toLocaleString()}`
            : currentName

  return (
    <header className="app-toolbar no-print">
      <div className="brand">
        <img src={BRAND_LOGO} alt={BRAND_NAME} className="brand-logo" />
        <div>
          <p className="brand-name">{BRAND_NAME}</p>
          <p className="brand-sub">{BRAND_TAGLINE}</p>
        </div>
      </div>

      <div className="toolbar-actions">
        <span
          className={`save-pill ${saveStatus !== 'idle' ? 'pulse' : ''} ${saveStatus === 'error' ? 'error' : ''}`}
          title={saveError ?? currentName}
        >
          {statusLabel}
        </span>
        <button type="button" className="btn-secondary" onClick={onSave}>
          <Save size={15} />
          Save
        </button>
        <button type="button" className="btn-secondary" onClick={onOpen}>
          <FolderOpen size={15} />
          Open
        </button>
        <button type="button" className="btn-secondary" onClick={onNew}>
          <FilePlus size={15} />
          New
        </button>
        <button type="button" className="btn-secondary" onClick={onClear}>
          <Eraser size={15} />
          Clear
        </button>
        <button type="button" className="btn-primary" onClick={onPrint}>
          <Printer size={15} />
          Export to PDF / Print
        </button>
      </div>
    </header>
  )
}
