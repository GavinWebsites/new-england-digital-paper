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
  pageCount: number
  logoSrc: string
  documentTitle: string
  sections: TextSection[]
  images: DocumentImage[]
  updatedAt: string
}

export const STORAGE_KEY = 'nedp-document-draft-v2'
export const LOGO_PLACEHOLDER = 'LOGO_PLACEHOLDER'

export function createEmptyDraft(): DocumentDraft {
  return {
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
