import * as cheerio from 'cheerio'
import { HOVERED_CLASS_PORT } from '../utils/messaging-contract'

const HOVER_STYLES_ID = 'my-job-notifier-hover-styles'
const HOVERED_ATTRIBUTE = 'data-my-job-notifier-hovered'
const SIMILAR_ATTRIBUTE = 'data-my-job-notifier-similar'
const HOVERED_DATA_VALUE = 'true'
const HOVERED_SELECTOR = `[${HOVERED_ATTRIBUTE}="${HOVERED_DATA_VALUE}"]`
const SIMILAR_SELECTOR = `[${SIMILAR_ATTRIBUTE}="${HOVERED_DATA_VALUE}"]`
let hoveredClassName: string | null = null
const hoveredClassPorts = new Set<Browser.runtime.Port>()

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        injectHoverStyles()
        document.addEventListener('pointerover', highlightHoveredElement, { passive: true })
        browser.runtime.onConnect.addListener((port) => {
            if (port.name !== HOVERED_CLASS_PORT) return

            hoveredClassPorts.add(port)
            port.postMessage({ className: hoveredClassName })
            port.onDisconnect.addListener(() => hoveredClassPorts.delete(port))
        })
    },
})

function highlightHoveredElement(event: PointerEvent) {
    document.querySelector<HTMLElement>(HOVERED_SELECTOR)?.removeAttribute(HOVERED_ATTRIBUTE)
    document.querySelectorAll<HTMLElement>(SIMILAR_SELECTOR).forEach((element) => {
        element.removeAttribute(SIMILAR_ATTRIBUTE)
    })
    hoveredClassName = null
    if (event.target instanceof HTMLElement && containsLink(event.target)) {
        hoveredClassName = event.target.getAttribute('class')
        event.target.setAttribute(HOVERED_ATTRIBUTE, HOVERED_DATA_VALUE)
        highlightSimilarElements(event.target)
    }
    hoveredClassPorts.forEach((port) => {
        port.postMessage({ className: hoveredClassName })
    })
}

function containsLink(element: HTMLElement) {
    const $ = cheerio.load(element.outerHTML)

    return $('a').length > 0
}

function highlightSimilarElements(target: HTMLElement) {
    const className = target.getAttribute('class')
    if (!className) return
    document.querySelectorAll<HTMLElement>('[class]').forEach((element) => {
        if (
            element !== target &&
            !target.contains(element) &&
            element.getAttribute('class') === className &&
            containsLink(element)
        ) {
            element.setAttribute(SIMILAR_ATTRIBUTE, HOVERED_DATA_VALUE)
        }
    })
}

function injectHoverStyles() {
    if (document.getElementById(HOVER_STYLES_ID)) return
    const style = document.createElement('style')
    style.id = HOVER_STYLES_ID
    style.textContent = `
        ${HOVERED_SELECTOR} {
            outline: 5px solid #22c55e !important;
        }
        ${SIMILAR_SELECTOR} {
            outline: 2px solid #22c55e !important;
        }
    `
    document.documentElement.append(style)
}
