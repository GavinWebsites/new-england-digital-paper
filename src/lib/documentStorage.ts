import { v4 as uuid } from 'uuid'
import {
  ACTIVE_CACHE_KEY,
  ACTIVE_ID_KEY,
  createEmptyDraft,
  displayNameFor,
  EXPORT_KIND,
  LEGACY_STORAGE_KEYS,
  LIBRARY_FALLBACK_KEY,
  type DocumentDraft,
  type SavedDocument,
  type SavedDocumentMeta,
} from '../types'

const IDB_NAME = 'nedp-paper'
const IDB_STORE = 'documents'
const IDB_VERSION = 1

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => {
      dbPromise = null
      reject(request.error ?? new Error('Could not open IndexedDB'))
    }
  })
  return dbPromise
}

function toMeta(doc: SavedDocument): SavedDocumentMeta {
  return {
    id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    pageCount: doc.draft.pageCount,
  }
}

function sortMeta(items: SavedDocumentMeta[]): SavedDocumentMeta[] {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function clampPageCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return 1
  return Math.min(20, Math.max(1, Math.floor(n)))
}

export function normalizeDraft(raw: unknown, fallbackId = uuid()): DocumentDraft | null {
  if (!raw || typeof raw !== 'object') return null
  const parsed = raw as Partial<DocumentDraft>
  const base = createEmptyDraft(fallbackId)
  const id =
    typeof parsed.id === 'string' && parsed.id.trim() ? parsed.id.trim() : fallbackId
  return {
    ...base,
    ...parsed,
    id,
    pageCount: clampPageCount(parsed.pageCount ?? base.pageCount),
    logoSrc: parsed.logoSrc || base.logoSrc,
    documentTitle:
      typeof parsed.documentTitle === 'string' ? parsed.documentTitle : base.documentTitle,
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    images: Array.isArray(parsed.images) ? parsed.images : [],
    updatedAt:
      typeof parsed.updatedAt === 'string' && parsed.updatedAt
        ? parsed.updatedAt
        : new Date().toISOString(),
  }
}

function wrapDraft(draft: DocumentDraft, previous?: SavedDocument | null): SavedDocument {
  const now = new Date().toISOString()
  return {
    id: draft.id,
    name: displayNameFor(draft),
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    draft: { ...draft, updatedAt: now },
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function readFallbackLibrary(): SavedDocument[] {
  const raw = readJson<SavedDocument[]>(LIBRARY_FALLBACK_KEY)
  if (!Array.isArray(raw)) return []
  return raw.filter((item) => item && typeof item.id === 'string' && item.draft)
}

function writeFallbackLibrary(docs: SavedDocument[]): boolean {
  return writeJson(LIBRARY_FALLBACK_KEY, docs)
}

async function idbGetAll(): Promise<SavedDocument[]> {
  const db = await openDb()
  const tx = db.transaction(IDB_STORE, 'readonly')
  const rows = await requestToPromise(tx.objectStore(IDB_STORE).getAll())
  return Array.isArray(rows) ? (rows as SavedDocument[]) : []
}

async function idbPut(doc: SavedDocument): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(IDB_STORE, 'readwrite')
  tx.objectStore(IDB_STORE).put(doc)
  await waitForTransaction(tx)
}

async function idbGet(id: string): Promise<SavedDocument | null> {
  const db = await openDb()
  const tx = db.transaction(IDB_STORE, 'readonly')
  const row = await requestToPromise(tx.objectStore(IDB_STORE).get(id))
  return (row as SavedDocument | undefined) ?? null
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(IDB_STORE, 'readwrite')
  tx.objectStore(IDB_STORE).delete(id)
  await waitForTransaction(tx)
}

function fallbackGet(id: string): SavedDocument | null {
  return readFallbackLibrary().find((doc) => doc.id === id) ?? null
}

function fallbackPut(doc: SavedDocument): void {
  const docs = readFallbackLibrary().filter((item) => item.id !== doc.id)
  docs.push(doc)
  if (!writeFallbackLibrary(docs)) {
    throw new Error('Browser storage is full. Download a JSON copy to keep this document.')
  }
}

function fallbackDelete(id: string): void {
  writeFallbackLibrary(readFallbackLibrary().filter((item) => item.id !== id))
}

export async function listSavedDocuments(): Promise<SavedDocumentMeta[]> {
  try {
    const rows = await idbGetAll()
    if (rows.length) return sortMeta(rows.map(toMeta))
  } catch {
    // Fall through to localStorage library.
  }
  return sortMeta(readFallbackLibrary().map(toMeta))
}

export async function getSavedDocument(id: string): Promise<SavedDocument | null> {
  try {
    const row = await idbGet(id)
    if (row) return row
  } catch {
    // Fall through.
  }
  return fallbackGet(id)
}

function rememberActive(doc: SavedDocument) {
  writeJson(ACTIVE_ID_KEY, doc.id)
  writeJson(ACTIVE_CACHE_KEY, doc.draft)
}

export async function putSavedDocument(draft: DocumentDraft): Promise<SavedDocument> {
  const previous = await getSavedDocument(draft.id)
  const doc = wrapDraft(draft, previous)
  try {
    await idbPut(doc)
    rememberActive(doc)
    return doc
  } catch {
    fallbackPut(doc)
    rememberActive(doc)
    return doc
  }
}

export async function deleteSavedDocument(id: string): Promise<void> {
  try {
    await idbDelete(id)
  } catch {
    // Still try localStorage.
  }
  fallbackDelete(id)
}

export function readActiveCache(): { id: string | null; draft: DocumentDraft | null } {
  const cachedId = readJson<string>(ACTIVE_ID_KEY)
  const cachedDraft = normalizeDraft(readJson(ACTIVE_CACHE_KEY), cachedId || undefined)
  return {
    id: typeof cachedId === 'string' ? cachedId : cachedDraft?.id ?? null,
    draft: cachedDraft,
  }
}

function readLegacyDrafts(): DocumentDraft[] {
  const drafts: DocumentDraft[] = []
  for (const key of LEGACY_STORAGE_KEYS) {
    const parsed = normalizeDraft(readJson(key))
    if (parsed) drafts.push(parsed)
  }
  return drafts
}

export async function hydrateLibrary(): Promise<{
  draft: DocumentDraft
  saves: SavedDocumentMeta[]
}> {
  const fallbackDocs = readFallbackLibrary()
  if (fallbackDocs.length) {
    try {
      for (const doc of fallbackDocs) await idbPut(doc)
    } catch {
      // IndexedDB unavailable; localStorage library remains the source.
    }
  }

  const cache = readActiveCache()
  let saves = await listSavedDocuments()

  if (saves.length === 0) {
    const legacy = readLegacyDrafts()
    const seed = cache.draft ?? legacy[0] ?? createEmptyDraft()
    await putSavedDocument(seed)
    for (const extra of legacy.slice(1)) {
      if (extra.id !== seed.id) await putSavedDocument(extra)
    }
    saves = await listSavedDocuments()
    return { draft: seed, saves }
  }

  const preferredId = cache.id && saves.some((item) => item.id === cache.id) ? cache.id : saves[0].id
  const stored = await getSavedDocument(preferredId)
  const draft = stored?.draft ?? cache.draft ?? createEmptyDraft(preferredId)
  writeJson(ACTIVE_ID_KEY, draft.id)
  writeJson(ACTIVE_CACHE_KEY, draft)
  return { draft, saves }
}

export function parseImportedDocument(raw: string): DocumentDraft {
  const parsed = JSON.parse(raw) as {
    kind?: string
    document?: SavedDocument
    draft?: DocumentDraft
  } & Partial<DocumentDraft>

  let candidate: unknown = parsed
  if (parsed && typeof parsed === 'object') {
    if (parsed.kind === EXPORT_KIND && parsed.document?.draft) {
      candidate = parsed.document.draft
    } else if (parsed.draft) {
      candidate = parsed.draft
    }
  }

  const draft = normalizeDraft(candidate)
  if (!draft) throw new Error('That file is not a New England Digital document.')
  return { ...draft, id: uuid(), updatedAt: new Date().toISOString() }
}

export function serializeExport(draft: DocumentDraft): string {
  const now = new Date().toISOString()
  const payload = {
    kind: EXPORT_KIND,
    version: 1,
    document: {
      id: draft.id,
      name: displayNameFor(draft),
      createdAt: draft.updatedAt || now,
      updatedAt: now,
      draft,
    } satisfies SavedDocument,
  }
  return JSON.stringify(payload, null, 2)
}

export function downloadDraft(draft: DocumentDraft): void {
  const blob = new Blob([serializeExport(draft)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const slug =
    displayNameFor(draft)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'document'
  anchor.href = url
  anchor.download = `${slug}.nedp.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
