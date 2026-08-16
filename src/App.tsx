import { ControlPanel } from './components/ControlPanel'
import { PageRenderer } from './components/PageRenderer'
import { Toolbar } from './components/Toolbar'
import { useDocumentStore } from './hooks/useDocumentStore'

export default function App() {
  const store = useDocumentStore()

  return (
    <div className="app-shell">
      <Toolbar
        saveStatus={store.saveStatus}
        updatedAt={store.draft.updatedAt}
        onSave={store.saveDraft}
        onLoad={store.loadDraftFromStorage}
        onClear={() => {
          if (
            window.confirm(
              'Clear the current draft? This removes the saved localStorage copy.',
            )
          ) {
            store.clearDraft()
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
    </div>
  )
}
