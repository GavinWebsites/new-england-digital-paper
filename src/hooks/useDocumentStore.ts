import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  deleteSavedDocument,
  downloadDraft,
  getSavedDocument,
  hydrateLibrary,
  listSavedDocuments,
  parseImportedDocument,
  putSavedDocument,
  readActiveCache,
} from '../lib/documentStorage'
import {
  createEmptyDraft,
  displayNameFor,
  type DocumentDraft,
  type DocumentImage,
  type SavedDocumentMeta,
  type TextSection,
} from '../types'

export type SaveStatus = 'idle' | 'saved' | 'cleared' | 'error'

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), Math.max(1, pageCount))
}

export function useDocumentStore() {
  const cached = readActiveCache()
  const [draft, setDraft] = useState<DocumentDraft>(
    () => cached.draft ?? createEmptyDraft(),
  )
  const [saves, setSaves] = useState<SavedDocumentMeta[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const skipAutoSave = useRef(true)
  const readyRef = useRef(false)
  const draftRef = useRef(draft)
  draftRef.current = draft

  const refreshSaves = useCallback(async () => {
    setSaves(await listSavedDocuments())
  }, [])

  const persist = useCallback(async (next: DocumentDraft) => {
    try {
      const saved = await putSavedDocument(next)
      setSaves((prev) => {
        const others = prev.filter((item) => item.id !== saved.id)
        return [
          {
            id: saved.id,
            name: saved.name,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            pageCount: saved.draft.pageCount,
          },
          ...others,
        ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      })
      setSaveError(null)
      setSaveStatus('saved')
      return true
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not save this document in the browser.',
      )
      setSaveStatus('error')
      return false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const hydrated = await hydrateLibrary()
        if (cancelled) return
        skipAutoSave.current = true
        setDraft(hydrated.draft)
        setSaves(hydrated.saves)
        readyRef.current = true
      } catch {
        if (cancelled) return
        readyRef.current = true
        setSaveError('Could not open the saved-document library.')
        setSaveStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    if (skipAutoSave.current) {
      skipAutoSave.current = false
      return
    }
    const handle = window.setTimeout(() => {
      void persist(draftRef.current)
    }, 250)
    const statusClear = window.setTimeout(() => {
      setSaveStatus((current) => (current === 'saved' ? 'idle' : current))
    }, 1800)
    return () => {
      window.clearTimeout(handle)
      window.clearTimeout(statusClear)
    }
  }, [draft, persist])

  useEffect(() => {
    const flush = () => {
      if (!readyRef.current) return
      void persist(draftRef.current)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [persist])

  const update = useCallback((patch: Partial<DocumentDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const setPageCount = useCallback((count: number) => {
    const pageCount = Math.min(20, Math.max(1, Math.floor(count) || 1))
    setDraft((prev) => ({
      ...prev,
      pageCount,
      sections: prev.sections.map((s) => ({
        ...s,
        page: clampPage(s.page, pageCount),
      })),
      images: prev.images.map((img) => ({
        ...img,
        page: clampPage(img.page, pageCount),
      })),
    }))
  }, [])

  const addSection = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: uuid(),
          title: `Section ${prev.sections.length + 1}`,
          body: '',
          page: 1,
        },
      ],
    }))
  }, [])

  const updateSection = useCallback(
    (id: string, patch: Partial<Omit<TextSection, 'id'>>) => {
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                page:
                  patch.page !== undefined
                    ? clampPage(patch.page, prev.pageCount)
                    : s.page,
              }
            : s,
        ),
      }))
    },
    [],
  )

  const removeSection = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }))
  }, [])

  const addImage = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: uuid(),
          label: `Image ${prev.images.length + 1}`,
          src: '',
          page: 1,
        },
      ],
    }))
  }, [])

  const updateImage = useCallback(
    (id: string, patch: Partial<Omit<DocumentImage, 'id'>>) => {
      setDraft((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === id
            ? {
                ...img,
                ...patch,
                page:
                  patch.page !== undefined
                    ? clampPage(patch.page, prev.pageCount)
                    : img.page,
              }
            : img,
        ),
      }))
    },
    [],
  )

  const removeImage = useCallback((id: string) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== id),
    }))
  }, [])

  const saveDraft = useCallback(async () => {
    await persist(draftRef.current)
  }, [persist])

  const openSave = useCallback(async (id: string) => {
    const saved = await getSavedDocument(id)
    if (!saved) {
      setSaveError('That saved document could not be opened.')
      setSaveStatus('error')
      await refreshSaves()
      return
    }
    skipAutoSave.current = true
    setDraft(saved.draft)
    setSaveError(null)
    setSaveStatus('saved')
    await putSavedDocument(saved.draft)
    await refreshSaves()
  }, [refreshSaves])

  const newDocument = useCallback(async () => {
    const next = createEmptyDraft()
    skipAutoSave.current = true
    setDraft(next)
    await persist(next)
  }, [persist])

  const clearDraft = useCallback(async () => {
    const next = {
      ...createEmptyDraft(draftRef.current.id),
      documentTitle: draftRef.current.documentTitle,
    }
    skipAutoSave.current = true
    setDraft(next)
    const ok = await persist(next)
    if (ok) setSaveStatus('cleared')
  }, [persist])

  const deleteSave = useCallback(
    async (id: string) => {
      await deleteSavedDocument(id)
      if (draftRef.current.id === id) {
        const remaining = (await listSavedDocuments()).filter((item) => item.id !== id)
        if (remaining[0]) {
          await openSave(remaining[0].id)
        } else {
          await newDocument()
        }
      } else {
        await refreshSaves()
      }
    },
    [newDocument, openSave, refreshSaves],
  )

  const importDraftFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text()
        const imported = parseImportedDocument(text)
        skipAutoSave.current = true
        setDraft(imported)
        await persist(imported)
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Could not import that file.',
        )
        setSaveStatus('error')
      }
    },
    [persist],
  )

  const exportDraftFile = useCallback(() => {
    downloadDraft(draftRef.current)
  }, [])

  return {
    draft,
    saves,
    saveStatus,
    saveError,
    currentName: displayNameFor(draft),
    update,
    setPageCount,
    addSection,
    updateSection,
    removeSection,
    addImage,
    updateImage,
    removeImage,
    saveDraft,
    openSave,
    newDocument,
    clearDraft,
    deleteSave,
    importDraftFile,
    exportDraftFile,
  }
}
