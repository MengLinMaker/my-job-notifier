import { setupJobElementSelectionContent } from '../features/job-element-selection/content'
import { setupScrapePreviewContent } from '../features/scrape-preview/content'

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        setupJobElementSelectionContent()
        setupScrapePreviewContent()
    },
})
