import * as cheerio from 'cheerio'

export function extractTextPreview(props: { className: string; html: string }) {
    const $ = cheerio.load(props.html)
    const items: string[] = []
    const selectedClassNames = getClassNameTokens(props.className)

    if (!selectedClassNames.length) return items

    $('[class]').each((_, element) => {
        const elementClassNames = getClassNameTokens(element.attribs?.['class'] ?? '')
        if (!selectedClassNames.every((className) => elementClassNames.includes(className))) return

        const text = $(element).text().replace(/\s+/g, ' ').trim()
        if (text) items.push(text)
    })

    return items
}

function getClassNameTokens(className: string) {
    return className.split(/\s+/).filter(Boolean)
}
