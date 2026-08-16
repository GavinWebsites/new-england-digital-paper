import { ImagePlus, Link2, Upload, X } from 'lucide-react'
import { LOGO_PLACEHOLDER } from '../types'

interface LogoUploaderProps {
  logoSrc: string
  onChange: (src: string) => void
}

export function LogoUploader({ logoSrc, onChange }: LogoUploaderProps) {
  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="panel-block">
      <div className="panel-block-head">
        <h3>Logo</h3>
        <span className="hint">Brands every page · {LOGO_PLACEHOLDER}</span>
      </div>

      <div className="logo-slot">
        {logoSrc ? (
          <img src={logoSrc} alt="Document logo" className="logo-preview" />
        ) : (
          <div className="logo-empty">
            <ImagePlus size={22} strokeWidth={1.5} />
            <span>{LOGO_PLACEHOLDER}</span>
          </div>
        )}
        {logoSrc ? (
          <button
            type="button"
            className="icon-btn logo-clear"
            onClick={() => onChange('')}
            aria-label="Remove logo"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <div className="field-row">
        <label className="file-btn">
          <Upload size={14} />
          Upload
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        <div className="url-field">
          <Link2 size={14} className="url-icon" />
          <input
            type="url"
            placeholder="Or paste image URL"
            value={logoSrc.startsWith('data:') ? '' : logoSrc}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
