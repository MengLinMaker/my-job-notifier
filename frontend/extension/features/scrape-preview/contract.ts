export const SCRAPE_PREVIEW_MESSAGE = 'scrape-preview'

export type ScrapePreviewMessage = {
    type: typeof SCRAPE_PREVIEW_MESSAGE
}

export type ScrapePreviewResponse = {
    html: string
}
