import * as cheerio from 'cheerio'
import {
    CANCEL_JOB_TRACKING_MESSAGE,
    HIGHLIGHT_ATTRIBUTE,
    HIGHLIGHT_DATA_VALUE,
    HIGHLIGHT_SELECTOR,
    HOVER_STYLES_ID,
    HOVERED_CLASS_PORT,
    JOB_ELEMENT_CLASS_STORAGE_KEY,
    SET_JOB_ELEMENT_CLASS_MESSAGE,
    START_JOB_TRACKING_MESSAGE,
} from './contract'

let hoveredClassName: string | null = null
let isEditingJobElement = false
const hoveredClassPorts = new Set<Browser.runtime.Port>()

export function defineJobElementSelectionContentScript() {
    return defineContentScript({
        matches: ['<all_urls>'],
        main() {
            const highlightObserver = new MutationObserver(() => {
                if (!hoveredClassName || isEditingJobElement) return
                highlightElementsByClassName(hoveredClassName)
            })

            injectHoverStyles()
            loadSavedJobElementClass()
            highlightObserver.observe(document.documentElement, { childList: true, subtree: true })
            document.addEventListener('pointerover', highlightHoveredElement, { passive: true })
            document.addEventListener('click', selectHoveredElement, true)
            browser.runtime.onMessage.addListener((message) => {
                if (message?.type === CANCEL_JOB_TRACKING_MESSAGE) {
                    isEditingJobElement = false
                    hoveredClassName =
                        typeof message.className === 'string' ? message.className : null
                    applySelectedJobElementClass()
                    notifyHoveredClassPorts()
                    return
                }

                if (message?.type === SET_JOB_ELEMENT_CLASS_MESSAGE) {
                    isEditingJobElement = false
                    hoveredClassName =
                        typeof message.className === 'string' ? message.className : null
                    applySelectedJobElementClass()
                    notifyHoveredClassPorts()
                    return
                }

                if (message?.type !== START_JOB_TRACKING_MESSAGE) return
                isEditingJobElement = true
                hoveredClassName = null
                clearHighlights()
                notifyHoveredClassPorts()
            })
            browser.runtime.onConnect.addListener((port) => {
                if (port.name !== HOVERED_CLASS_PORT) return

                hoveredClassPorts.add(port)
                port.postMessage({ className: hoveredClassName, isEditing: isEditingJobElement })
                port.onDisconnect.addListener(() => hoveredClassPorts.delete(port))
            })
        },
    })
}

function highlightHoveredElement(event: PointerEvent) {
    if (!isEditingJobElement) return
    clearHighlights()
    hoveredClassName = null
    if (event.target instanceof HTMLElement && containsLink(event.target)) {
        hoveredClassName = event.target.getAttribute('class')
        highlightSimilarElements(event.target)
    }
    notifyHoveredClassPorts()
}

function selectHoveredElement(event: MouseEvent) {
    if (!isEditingJobElement || !(event.target instanceof HTMLElement)) return
    if (!containsLink(event.target)) return
    event.preventDefault()
    event.stopPropagation()
    isEditingJobElement = false
    hoveredClassName = event.target.getAttribute('class')
    notifyHoveredClassPorts()
}

function loadSavedJobElementClass() {
    browser.storage.sync.get(JOB_ELEMENT_CLASS_STORAGE_KEY(location.origin)).then((items) => {
        if (isEditingJobElement) return
        const storedClassName = items[JOB_ELEMENT_CLASS_STORAGE_KEY(location.origin)]

        hoveredClassName = typeof storedClassName === 'string' ? storedClassName : null
        applySelectedJobElementClass()
        notifyHoveredClassPorts()
    })
}

function applySelectedJobElementClass() {
    clearHighlights()
    if (hoveredClassName) highlightElementsByClassName(hoveredClassName)
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
            (element === target || !target.contains(element)) &&
            hasAllClassNames(element, className) &&
            containsLink(element)
        ) {
            element.setAttribute(HIGHLIGHT_ATTRIBUTE, HIGHLIGHT_DATA_VALUE)
        }
    })
}

function highlightElementsByClassName(className: string) {
    document.querySelectorAll<HTMLElement>('[class]').forEach((element) => {
        if (hasAllClassNames(element, className) && containsLink(element)) {
            element.setAttribute(HIGHLIGHT_ATTRIBUTE, HIGHLIGHT_DATA_VALUE)
        }
    })
}

function hasAllClassNames(element: HTMLElement, className: string) {
    return className
        .split(/\s+/)
        .filter(Boolean)
        .every((className) => element.classList.contains(className))
}

function injectHoverStyles() {
    if (document.getElementById(HOVER_STYLES_ID)) return
    const style = document.createElement('style')
    style.id = HOVER_STYLES_ID
    style.textContent = `
        ${HIGHLIGHT_SELECTOR} {
            outline: 5px solid #22c55e !important;
        }
    `
    document.documentElement.append(style)
}

function clearHighlights() {
    document.querySelectorAll<HTMLElement>(HIGHLIGHT_SELECTOR).forEach((element) => {
        element.removeAttribute(HIGHLIGHT_ATTRIBUTE)
    })
}

function notifyHoveredClassPorts() {
    hoveredClassPorts.forEach((port) => {
        port.postMessage({ className: hoveredClassName, isEditing: isEditingJobElement })
    })
}
