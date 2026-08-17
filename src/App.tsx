import { useEffect, useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { PageRenderer } from './components/PageRenderer'
import { SavesPanel } from './components/SavesPanel'
import { Toolbar } from './components/Toolbar'
import { useDocumentStore } from './hooks/useDocumentStore'

export default function App() {
  const store = useDocumentStore()
  const [libraryOpen, setLibraryOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void store.saveDraft()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [store.saveDraft])

  return (
    <div className="app-shell">
      <Toolbar
        saveStatus={store.saveStatus}
        saveError={store.saveError}
        currentName={store.currentName}
        updatedAt={
          store.saves.find((save) => save.id === store.draft.id)?.updatedAt ??
          store.draft.updatedAt
        }
        onSave={() => {
          void store.saveDraft()
        }}
        onOpen={() => setLibraryOpen(true)}
        onNew={() => {
          void store.newDocument()
        }}
        onClear={() => {
          if (
            window.confirm(
              'Clear the current document content? Other saved documents stay in the library.',
            )
          ) {
            void store.clearDraft()
          }
        }}
        onPrint={() => window.print()}
      />

      <main className="app-main">
        <div className="no-print">
          <ControlPanel
            draft={store.draft}
            onUpdate={store.update}
            onPageCount={store.setPageCount}
            onAddSection={store.addSection}
            onUpdateSection={store.updateSection}
            onRemoveSection={store.removeSection}
            onAddImage={store.addImage}
            onUpdateImage={store.updateImage}
            onRemoveImage={store.removeImage}
          />
        </div>

        <PageRenderer draft={store.draft} />
      </main>

      <SavesPanel
        open={libraryOpen}
        currentId={store.draft.id}
        saves={store.saves}
        onClose={() => setLibraryOpen(false)}
        onOpen={(id) => {
          void store.openSave(id)
          setLibraryOpen(false)
        }}
        onNew={() => {
          void store.newDocument()
          setLibraryOpen(false)
        }}
        onDelete={(id) => {
          void store.deleteSave(id)
        }}
        onImport={(file) => {
          void store.importDraftFile(file)
          setLibraryOpen(false)
        }}
        onDownload={store.exportDraftFile}
      />
    </div>
  )
}
