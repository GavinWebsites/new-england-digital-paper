import { ImagePlus, Plus, Trash2, Upload } from 'lucide-react'
import type { DocumentImage } from '../types'

interface ImagesManagerProps {
  images: DocumentImage[]
  pageCount: number
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Omit<DocumentImage, 'id'>>) => void
  onRemove: (id: string) => void
}

export function ImagesManager({
  images,
  pageCount,
  onAdd,
  onUpdate,
  onRemove,
}: ImagesManagerProps) {
  const onFile = (id: string, file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onUpdate(id, { src: reader.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="panel-block">
      <div className="panel-block-head">
        <h3>Images</h3>
        <button type="button" className="btn-ghost" onClick={onAdd}>
          <Plus size={14} />
          Add Image
        </button>
      </div>

      {images.length === 0 ? (
        <p className="empty-hint">No images yet. Upload files or paste URLs.</p>
      ) : (
        <ul className="item-list">
          {images.map((image) => (
            <li key={image.id} className="item-card">
              <div className="item-card-top">
                <input
                  className="title-input"
                  value={image.label}
                  onChange={(e) => onUpdate(image.id, { label: e.target.value })}
                  placeholder="Image label"
                />
                <select
                  className="page-select"
                  value={image.page}
                  onChange={(e) =>
                    onUpdate(image.id, { page: Number(e.target.value) })
                  }
                  aria-label={`Assign ${image.label} to page`}
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
                  onClick={() => onRemove(image.id)}
                  aria-label="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="image-editor">
                <div className="image-thumb">
                  {image.src ? (
                    <img src={image.src} alt={image.label || 'Uploaded'} />
                  ) : (
                    <div className="image-thumb-empty">
                      <ImagePlus size={18} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="image-fields">
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={image.src.startsWith('data:') ? '' : image.src}
                    onChange={(e) => onUpdate(image.id, { src: e.target.value })}
                  />
                  <label className="file-btn compact">
                    <Upload size={13} />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => onFile(image.id, e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
