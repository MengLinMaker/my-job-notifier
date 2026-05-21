import { useState } from 'react'
import { Button } from '@lib/lib-ui/components/button'
import { CaretLeftIcon, CaretRightIcon, ArrowClockwiseIcon } from '@phosphor-icons/react'
import { SCRAPE_PREVIEW_MESSAGE, type ScrapePreviewResponse } from './contract'
import { extractTextPreview } from './extractTextPreview'

export function ScrapePreview(props: { jobElementClass: string | null; tabId: number }) {
    const [items, setItems] = useState<string[]>([])
    const [htmlLength, setHtmlLength] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentItem = items[currentIndex]

    function refreshPreview() {
        setCurrentIndex(0)
        setError(null)
        if (!props.jobElementClass) {
            setHtmlLength(0)
            setItems([])
            return
        }
        browser.tabs
            .sendMessage(props.tabId, {
                type: SCRAPE_PREVIEW_MESSAGE,
            })
            .then((response: ScrapePreviewResponse) => {
                setHtmlLength(response.html.length)
                setItems(extractTextPreview({ className: props.jobElementClass ?? '', html: response.html }))
            })
            .catch((error) => {
                setError(error instanceof Error ? error.message : 'Unable to scrape this tab')
                setHtmlLength(0)
                setItems([])
            })
    }

    return (
        <section className="grid gap-2" aria-labelledby="scrape-preview-heading">
            <div className="flex items-center justify-between gap-2">
                <h2
                    id="scrape-preview-heading"
                    className="text-xs font-medium text-muted-foreground uppercase"
                >
                    Scrape Preview
                </h2>
                <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="inline-flex items-center gap-1.5"
                    onClick={refreshPreview}
                >
                    <ArrowClockwiseIcon aria-hidden size={14} />
                    Refresh
                </Button>
            </div>
            <p className="min-h-24 border border-border bg-muted p-2 text-sm wrap-anywhere">
                {error ?? currentItem ?? 'No matching elements found'}
            </p>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                    <CaretLeftIcon aria-hidden size={14} />
                    Previous
                </Button>
                <span>
                    {items.length ? currentIndex + 1 : 0} / {items.length}
                    {htmlLength ? ` from ${htmlLength.toLocaleString()} HTML chars` : ''}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={currentIndex >= items.length - 1}
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                    Next
                    <CaretRightIcon aria-hidden size={14} />
                </Button>
            </div>
        </section>
    )
}
