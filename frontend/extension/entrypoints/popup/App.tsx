import { useEffect, useState } from 'react'
import { Button } from '@lib/lib-ui/components/button'

function getUrl(url: string) {
    try {
        return new URL(url)
    } catch {
        return null
    }
}

function App() {
    const [url, setUrl] = useState('Loading current tab...')
    const parsedUrl = getUrl(url)

    useEffect(() => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(([tab]) => {
                setUrl(tab?.url ?? 'No URL available for this tab.')
            })
            .catch((error) => {
                console.error('Failed to read active tab URL', error)
                setUrl('Unable to read the current tab URL.')
            })
    }, [])

    return (
        <main className="grid gap-4 p-4">
            <h1 className="text-lg font-medium">My Job Notifier</h1>
            <section className="grid gap-2" aria-labelledby="current-tab-heading">
                <h2
                    id="current-tab-heading"
                    className="text-xs font-medium text-muted-foreground uppercase"
                >
                    Current URL
                </h2>
                <p className="border border-border bg-muted p-2 text-sm wrap-anywhere">
                    {parsedUrl && (
                        <>
                            <span className="font-medium text-blue-600">{parsedUrl.origin}</span>
                            <span className="text-emerald-700">{parsedUrl.pathname}</span>
                            <span className="text-rose-600">{parsedUrl.search}</span>
                        </>
                    )}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(url)}
                >
                    Copy URL
                </Button>
            </section>
        </main>
    )
}

export default App
