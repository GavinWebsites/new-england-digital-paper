import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  createEmptyDraft,
  type DocumentDraft,
  type DocumentImage,
  type TextSection,
  STORAGE_KEY,
} from '../types'

function loadDraft(): DocumentDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyDraft()
    const parsed = JSON.parse(raw) as DocumentDraft
    const base = createEmptyDraft()
    return {
      ...base,
      ...parsed,
      logoSrc: parsed.logoSrc || base.logoSrc,
      sections: parsed.sections ?? [],
      images: parsed.images ?? [],
    }
  } catch {
    return createEmptyDraft()
  }
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(1, page), Math.max(1, pageCount))
}

export function useDocumentStore() {
  const [draft, setDraft] = useState<DocumentDraft>(loadDraft)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'cleared'>('idle')
  const skipAutoSave = useRef(false)

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false
      return
    }
    const next = { ...draft, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSaveStatus('saved')
    const t = window.setTimeout(() => setSaveStatus('idle'), 1600)
    return () => window.clearTimeout(t)
  }, [draft])

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

  const saveDraft = useCallback(() => {
    const next = { ...draft, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setDraft(next)
    setSaveStatus('saved')
  }, [draft])

  const loadDraftFromStorage = useCallback(() => {
    skipAutoSave.current = true
    const loaded = loadDraft()
    setDraft(loaded)
    setSaveStatus('saved')
  }, [])

  const clearDraft = useCallback(() => {
    skipAutoSave.current = true
    localStorage.removeItem(STORAGE_KEY)
    setDraft(createEmptyDraft())
    setSaveStatus('cleared')
  }, [])

  return {
    draft,
    saveStatus,
    update,
    setPageCount,
    addSection,
    updateSection,
    removeSection,
    addImage,
    updateImage,
    removeImage,
    saveDraft,
    loadDraftFromStorage,
    clearDraft,
  }
}
