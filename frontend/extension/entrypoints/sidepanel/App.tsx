import { useEffect, useState } from 'react'
import { DomainExtraction } from '../../features/domain-extraction/DomainExtraction'
import { getUrl } from '../../features/domain-extraction/url'
import { JobElementSelection } from '../../features/job-element-selection/JobElementSelection'

function App() {
    const [url, setUrl] = useState('Loading current tab...')
    const [origin, setOrigin] = useState<string | null>(null)
    const [tabId, setTabId] = useState<number | null>(null)

    useEffect(() => {
        const loadActiveTab = () =>
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(([tab]) => {
                    const tabUrl = getUrl(tab?.url ?? '')

                    setTabId(tab?.id ?? null)
                    setUrl(tabUrl?.href ?? 'No URL available for this tab.')
                    setOrigin(tabUrl?.origin ?? null)
                })
                .catch((error) => {
                    console.error('Failed to read active tab URL', error)
                    setUrl('Unable to read the current tab URL.')
                    setOrigin(null)
                })

        const handleTabUpdated: Parameters<typeof browser.tabs.onUpdated.addListener>[0] = (
            _tabId,
            changeInfo,
            tab,
        ) => {
            if (tab.active && changeInfo.url) loadActiveTab()
        }

        loadActiveTab()
        browser.tabs.onActivated.addListener(loadActiveTab)
        browser.tabs.onUpdated.addListener(handleTabUpdated)

        return () => {
            browser.tabs.onActivated.removeListener(loadActiveTab)
            browser.tabs.onUpdated.removeListener(handleTabUpdated)
        }
    }, [])

    return (
        <main className="grid gap-4 p-4">
            <DomainExtraction url={url} />
            <JobElementSelection origin={origin} tabId={tabId} />
        </main>
    )
}

export default App
