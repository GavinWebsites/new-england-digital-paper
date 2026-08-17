import { v4 as uuid } from 'uuid'
import { BRAND_LOGO, BRAND_NAME } from './brand'

export interface TextSection {
  id: string
  title: string
  body: string
  page: number
}

export interface DocumentImage {
  id: string
  label: string
  src: string
  page: number
}

export interface DocumentDraft {
  id: string
  pageCount: number
  logoSrc: string
  documentTitle: string
  sections: TextSection[]
  images: DocumentImage[]
  updatedAt: string
}

export interface SavedDocument {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  draft: DocumentDraft
}

export interface SavedDocumentMeta {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  pageCount: number
}

export const STORAGE_KEY = 'nedp-document-draft-v2'
export const LEGACY_STORAGE_KEYS = [
  STORAGE_KEY,
  'nedp-document-draft',
] as const
export const ACTIVE_ID_KEY = 'nedp-active-document-id'
export const ACTIVE_CACHE_KEY = 'nedp-active-draft-v3'
export const LIBRARY_FALLBACK_KEY = 'nedp-document-library-v1'
export const EXPORT_KIND = 'nedp-document'
export const LOGO_PLACEHOLDER = 'LOGO_PLACEHOLDER'

export function createEmptyDraft(id = uuid()): DocumentDraft {
  return {
    id,
    pageCount: 2,
    logoSrc: BRAND_LOGO,
    documentTitle: `${BRAND_NAME} Brief`,
    sections: [
      {
        id: 'seed-overview',
        title: 'Overview',
        body: 'New England Digital delivers clear, print-ready layouts for proposals, client briefs, and operational one-pagers. Use this studio to compose sections, place imagery, and export crisp letter pages.',
        page: 1,
      },
      {
        id: 'seed-scope',
        title: 'Scope',
        body: 'Brand-aligned typography, page assignment, and PDF export—so every deliverable carries the same navy and seafoam presence as the NED mark.',
        page: 1,
      },
      {
        id: 'seed-next',
        title: 'Next Steps',
        body: 'Add your own sections and images, assign them across pages, then use Export to PDF / Print for a finished packet.',
        page: 2,
      },
    ],
    images: [],
    updatedAt: new Date().toISOString(),
  }
}

export function displayNameFor(draft: Pick<DocumentDraft, 'documentTitle'>): string {
  const name = draft.documentTitle.trim()
  return name || 'Untitled document'
}
