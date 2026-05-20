import * as cheerio from 'cheerio'
import {
    CANCEL_JOB_TRACKING_MESSAGE,
    HOVERED_CLASS_PORT,
    JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX,
    SET_JOB_ELEMENT_CLASS_MESSAGE,
    START_JOB_TRACKING_MESSAGE,
} from '../utils/messaging-contract'

const HOVER_STYLES_ID = 'my-job-notifier-hover-styles'
const HOVERED_ATTRIBUTE = 'data-my-job-notifier-hovered'
const SIMILAR_ATTRIBUTE = 'data-my-job-notifier-similar'
const HOVERED_DATA_VALUE = 'true'
const HOVERED_SELECTOR = `[${HOVERED_ATTRIBUTE}="${HOVERED_DATA_VALUE}"]`
const SIMILAR_SELECTOR = `[${SIMILAR_ATTRIBUTE}="${HOVERED_DATA_VALUE}"]`
let hoveredClassName: string | null = null
let isTrackingJobPostings = false
const hoveredClassPorts = new Set<Browser.runtime.Port>()
const highlightObserver = new MutationObserver(() => {
    if (!hoveredClassName || isTrackingJobPostings) return
    highlightElementsByClassName(hoveredClassName)
})

export default defineContentScript({
    matches: ['<all_urls>'],
    main() {
        injectHoverStyles()
        loadSavedJobElementClass()
        highlightObserver.observe(document.documentElement, { childList: true, subtree: true })
        document.addEventListener('pointerover', highlightHoveredElement, { passive: true })
        document.addEventListener('click', selectHoveredElement, true)
        browser.runtime.onMessage.addListener((message) => {
            if (message?.type === CANCEL_JOB_TRACKING_MESSAGE) {
                isTrackingJobPostings = false
                clearHighlights()
                notifyHoveredClassPorts()
                return
            }

            if (message?.type === SET_JOB_ELEMENT_CLASS_MESSAGE) {
                isTrackingJobPostings = false
                hoveredClassName = typeof message.className === 'string' ? message.className : null
                applySelectedJobElementClass()
                notifyHoveredClassPorts()
                return
            }

            if (message?.type !== START_JOB_TRACKING_MESSAGE) return
            isTrackingJobPostings = true
            hoveredClassName = null
            clearHighlights()
            notifyHoveredClassPorts()
        })
        browser.runtime.onConnect.addListener((port) => {
            if (port.name !== HOVERED_CLASS_PORT) return

            hoveredClassPorts.add(port)
            port.postMessage({ className: hoveredClassName, isTracking: isTrackingJobPostings })
            port.onDisconnect.addListener(() => hoveredClassPorts.delete(port))
        })
    },
})

function highlightHoveredElement(event: PointerEvent) {
    if (!isTrackingJobPostings) return
    clearHighlights()
    hoveredClassName = null
    if (event.target instanceof HTMLElement && containsLink(event.target)) {
        hoveredClassName = event.target.getAttribute('class')
        event.target.setAttribute(HOVERED_ATTRIBUTE, HOVERED_DATA_VALUE)
        highlightSimilarElements(event.target)
    }
    notifyHoveredClassPorts()
}

function selectHoveredElement(event: MouseEvent) {
    const hoveredElement = document.querySelector<HTMLElement>(HOVERED_SELECTOR)
    if (!isTrackingJobPostings || !hoveredElement) return
    event.preventDefault()
    event.stopPropagation()
    isTrackingJobPostings = false
    hoveredClassName = hoveredElement.getAttribute('class')
    notifyHoveredClassPorts()
}

function loadSavedJobElementClass() {
    browser.storage.local.get(getJobElementClassStorageKey(location.origin)).then((items) => {
        const storedClassName = items[getJobElementClassStorageKey(location.origin)]

        hoveredClassName = typeof storedClassName === 'string' ? storedClassName : null
        applySelectedJobElementClass()
        notifyHoveredClassPorts()
    })
}

function applySelectedJobElementClass() {
    clearHighlights()
    if (hoveredClassName) highlightElementsByClassName(hoveredClassName)
}

function getJobElementClassStorageKey(origin: string) {
    return `${JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX}${origin}`
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

function highlightElementsByClassName(className: string) {
    document.querySelectorAll<HTMLElement>('[class]').forEach((element) => {
        if (element.getAttribute('class') === className && containsLink(element)) {
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

function clearHighlights() {
    document.querySelector<HTMLElement>(HOVERED_SELECTOR)?.removeAttribute(HOVERED_ATTRIBUTE)
    document.querySelectorAll<HTMLElement>(SIMILAR_SELECTOR).forEach((element) => {
        element.removeAttribute(SIMILAR_ATTRIBUTE)
    })
}

function notifyHoveredClassPorts() {
    hoveredClassPorts.forEach((port) => {
        port.postMessage({ className: hoveredClassName, isTracking: isTrackingJobPostings })
    })
}
