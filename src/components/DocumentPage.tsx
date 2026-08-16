import { AutoFit } from './AutoFit'
import { LOGO_PLACEHOLDER, type DocumentImage, type TextSection } from '../types'

interface DocumentPageProps {
  pageNumber: number
  pageCount: number
  logoSrc: string
  documentTitle: string
  sections: TextSection[]
  images: DocumentImage[]
}

const CONTACT = {
  name: 'Gavin Lim',
  company: 'New England Digital',
  phone: '860-709-2279',
  email: 'gavinwl2014@gmail.com',
  web: 'NewEnglandDigital.co',
}

export function DocumentPage({
  pageNumber,
  pageCount,
  logoSrc,
  documentTitle,
  sections,
  images,
}: DocumentPageProps) {
  const isFirstPage = pageNumber === 1

  return (
    <article className="doc-page" data-page={pageNumber}>
      <header className="doc-page-header">
        <div className="doc-header-left">
          <div className="doc-logo">
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" />
            ) : (
              <span className="doc-logo-placeholder">{LOGO_PLACEHOLDER}</span>
            )}
          </div>
          <div className="doc-header-meta">
            <p className="doc-title">{documentTitle || 'Untitled Document'}</p>
            <p className="doc-page-label">
              Page {pageNumber} of {pageCount}
            </p>
          </div>
        </div>

        {isFirstPage ? (
          <address className="doc-contact">
            <span className="doc-contact-name">{CONTACT.name}</span>
            <span>{CONTACT.company}</span>
            <a href={`tel:${CONTACT.phone.replace(/-/g, '')}`}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a
              href={`https://${CONTACT.web}`}
              target="_blank"
              rel="noreferrer"
            >
              {CONTACT.web}
            </a>
          </address>
        ) : null}
      </header>

      <div className="doc-page-rule" />

      <AutoFit className="doc-page-body">
        <div className="doc-flow">
          {sections.map((section) => (
            <section key={section.id} className="doc-section">
              <h2>{section.title || 'Untitled Section'}</h2>
              <p>{section.body || '—'}</p>
            </section>
          ))}

          {images.length > 0 ? (
            <div className="doc-images">
              {images.map((image) => (
                <figure key={image.id} className="doc-figure">
                  {image.src ? (
                    <img src={image.src} alt={image.label || 'Document image'} />
                  ) : (
                    <div className="doc-figure-empty">No image</div>
                  )}
                  {image.label ? <figcaption>{image.label}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : null}

          {sections.length === 0 && images.length === 0 ? (
            <div className="doc-empty">
              <p>This page is empty.</p>
              <p>Assign sections or images from the control panel.</p>
            </div>
          ) : null}
        </div>
      </AutoFit>

      <footer className="doc-page-footer">
        <span>New England Digital</span>
        <span>{pageNumber}</span>
      </footer>
    </article>
  )
}
