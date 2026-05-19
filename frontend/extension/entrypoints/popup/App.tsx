import { useEffect, useState } from 'react'
import { Button } from '@lib/lib-ui/components/button'
import './App.css'

function App() {
    const [url, setUrl] = useState('Loading current tab...')

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
        <main className="app">
            <h1>My Job Notifier</h1>
            <section className="current-tab" aria-labelledby="current-tab-heading">
                <h2 id="current-tab-heading">Current URL</h2>
                <p className="url">{url}</p>
                <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(url)}>
                    Copy URL
                </Button>
            </section>
        </main>
    )
}

export default App
