import { useEffect, useState } from 'react'
import { Button } from '@lib/lib-ui/components/button'
import {
    CANCEL_JOB_TRACKING_MESSAGE,
    HOVERED_CLASS_PORT,
    JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX,
    SET_JOB_ELEMENT_CLASS_MESSAGE,
    START_JOB_TRACKING_MESSAGE,
} from '../../utils/messaging-contract'

function getUrl(url: string) {
    try {
        return new URL(url)
    } catch {
        return null
    }
}

function App() {
    const [url, setUrl] = useState('Loading current tab...')
    const [origin, setOrigin] = useState<string | null>(null)
    const [tabId, setTabId] = useState<number | null>(null)
    const [hoveredClassName, setHoveredClassName] = useState<string | null>(null)
    const [isTracking, setIsTracking] = useState(false)
    const parsedUrl = getUrl(url)

    useEffect(() => {
        const loadActiveTab = () =>
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(([tab]) => {
                    const tabUrl = getUrl(tab?.url ?? '')
                    const tabOrigin = tabUrl?.origin ?? null

                    setTabId(tab?.id ?? null)
                    setUrl(tabUrl?.href ?? 'No URL available for this tab.')
                    setOrigin(tabOrigin)
                    setIsTracking(false)
                    if (!tabOrigin) {
                        setHoveredClassName(null)
                        return
                    }
                    return browser.storage.local
                        .get(getJobElementClassStorageKey(tabOrigin))
                        .then((items) => {
                            const storedClassName = items[getJobElementClassStorageKey(tabOrigin)]
                            const className =
                                typeof storedClassName === 'string' ? storedClassName : null

                            setHoveredClassName(className)
                            if (tab?.id && className) {
                                browser.tabs
                                    .sendMessage(tab.id, {
                                        type: SET_JOB_ELEMENT_CLASS_MESSAGE,
                                        className,
                                    })
                                    .catch(() => {})
                            }
                        })
                })
                .catch((error) => {
                    console.error('Failed to read active tab URL', error)
                    setUrl('Unable to read the current tab URL.')
                    setOrigin(null)
                    setHoveredClassName(null)
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

    useEffect(() => {
        if (!tabId) return
        const port = browser.tabs.connect(tabId, { name: HOVERED_CLASS_PORT })
        port.onMessage.addListener((message) => {
            if (!isHoveredClassMessage(message)) return
            setHoveredClassName(message.className)
            setIsTracking(message.isTracking)
            if (origin && message.className && !message.isTracking) {
                browser.storage.local.set({
                    [getJobElementClassStorageKey(origin)]: message.className,
                })
            }
        })
        return () => port.disconnect()
    }, [origin, tabId])

    function trackJobPostings() {
        if (!tabId) return
        browser.tabs.sendMessage(tabId, {
            type: isTracking ? CANCEL_JOB_TRACKING_MESSAGE : START_JOB_TRACKING_MESSAGE,
        })
    }

    return (
        <main className="grid gap-4 p-4">
            <h1 className="text-lg font-medium">My Job Notifier</h1>
            <section className="grid gap-2" aria-labelledby="current-tab-heading">
                <h2
                    id="current-tab-heading"
                    className="text-xs font-medium text-muted-foreground uppercase"
                >
                    Settings for domain
                </h2>
                <p className="border border-border bg-muted p-2 text-sm wrap-anywhere">
                    {parsedUrl?.origin}
                </p>
            </section>
            <section className="grid gap-2" aria-labelledby="job-element-class-heading">
                <div className="flex items-center justify-between gap-2">
                    <h2
                        id="job-element-class-heading"
                        className="text-xs font-medium text-muted-foreground uppercase"
                    >
                        Job Element Class
                    </h2>
                    <Button type="button" variant="outline" size="xs" onClick={trackJobPostings}>
                        {isTracking ? 'Cancel' : '✎ Edit'}
                    </Button>
                </div>
                <p className="border border-border bg-muted p-2 font-mono text-xs wrap-anywhere">
                    {hoveredClassName ??
                        (isTracking ? (
                            <span className="font-sans text-muted-foreground">
                                Click on green bordered job element
                            </span>
                        ) : (
                            <span className="font-sans text-muted-foreground">
                                No job element selected, please edit
                            </span>
                        ))}
                </p>
            </section>
        </main>
    )
}

function getJobElementClassStorageKey(origin: string) {
    return `${JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX}${origin}`
}

function isHoveredClassMessage(
    value: unknown,
): value is { className: string | null; isTracking: boolean } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'className' in value &&
        'isTracking' in value &&
        (typeof value.className === 'string' || value.className === null) &&
        typeof value.isTracking === 'boolean'
    )
}

export default App
