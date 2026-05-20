import * as cheerio from 'cheerio'

const HOVER_STYLES_ID = 'my-job-notifier-hover-styles'
const HOVERED_ATTRIBUTE = 'data-my-job-notifier-hovered'
const HOVERED_DATA_VALUE = 'true'
const HOVERED_SELECTOR = `[${HOVERED_ATTRIBUTE}="${HOVERED_DATA_VALUE}"]`

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        injectHoverStyles()
        document.addEventListener('pointerover', highlightHoveredElement, { passive: true })
    },
})

function highlightHoveredElement(event: PointerEvent) {
    document.querySelector<HTMLElement>(HOVERED_SELECTOR)?.removeAttribute(HOVERED_ATTRIBUTE)
    if (event.target instanceof HTMLElement && containsLink(event.target)) {
        event.target.setAttribute(HOVERED_ATTRIBUTE, HOVERED_DATA_VALUE)
    }
}

function containsLink(element: HTMLElement) {
    const $ = cheerio.load(element.outerHTML)

    return $('a').length > 0
}

function injectHoverStyles() {
    if (document.getElementById(HOVER_STYLES_ID)) return
    const style = document.createElement('style')
    style.id = HOVER_STYLES_ID
    style.textContent = `
        ${HOVERED_SELECTOR} {
            outline: 5px solid #22c55e !important;
        }
    `
    document.documentElement.append(style)
}
