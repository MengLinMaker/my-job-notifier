import {
    SCRAPE_PREVIEW_MESSAGE,
    type ScrapePreviewMessage,
    type ScrapePreviewResponse,
} from './contract'

export function setupScrapePreviewContent() {
    browser.runtime.onMessage.addListener((message) => {
        if (!isScrapePreviewMessage(message)) return

        return Promise.resolve(createScrapePreview())
    })
}

function isScrapePreviewMessage(value: unknown): value is ScrapePreviewMessage {
    return (
        typeof value === 'object' &&
        value !== null &&
        'type' in value &&
        value.type === SCRAPE_PREVIEW_MESSAGE
    )
}

function createScrapePreview(): ScrapePreviewResponse {
    return { html: document.documentElement.outerHTML }
}
