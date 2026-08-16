import { Eraser, FolderOpen, Printer, Save } from 'lucide-react'
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from '../brand'

interface ToolbarProps {
  saveStatus: 'idle' | 'saved' | 'cleared'
  updatedAt: string
  onSave: () => void
  onLoad: () => void
  onClear: () => void
  onPrint: () => void
}

export function Toolbar({
  saveStatus,
  updatedAt,
  onSave,
  onLoad,
  onClear,
  onPrint,
}: ToolbarProps) {
  const statusLabel =
    saveStatus === 'saved'
      ? 'Draft saved'
      : saveStatus === 'cleared'
        ? 'Draft cleared'
        : updatedAt
          ? `Last edit ${new Date(updatedAt).toLocaleString()}`
          : 'Autosave on'

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
        <span className={`save-pill ${saveStatus !== 'idle' ? 'pulse' : ''}`}>
          {statusLabel}
        </span>
        <button type="button" className="btn-secondary" onClick={onSave}>
          <Save size={15} />
          Save Draft
        </button>
        <button type="button" className="btn-secondary" onClick={onLoad}>
          <FolderOpen size={15} />
          Load Draft
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
