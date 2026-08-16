import type { DocumentDraft } from '../types'
import { DocumentPage } from './DocumentPage'

interface PageRendererProps {
  draft: DocumentDraft
}

export function PageRenderer({ draft }: PageRendererProps) {
  const pages = Array.from({ length: draft.pageCount }, (_, i) => i + 1)

  return (
    <div className="preview-stage">
      <div className="preview-toolbar-label">
        <span>Live Preview</span>
        <span className="preview-count">
          {draft.pageCount} page{draft.pageCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="page-stack print-root" id="print-root">
        {pages.map((pageNumber) => (
          <DocumentPage
            key={pageNumber}
            pageNumber={pageNumber}
            pageCount={draft.pageCount}
            logoSrc={draft.logoSrc}
            documentTitle={draft.documentTitle}
            sections={draft.sections.filter((s) => s.page === pageNumber)}
            images={draft.images.filter((img) => img.page === pageNumber)}
          />
        ))}
      </div>
    </div>
  )
}
