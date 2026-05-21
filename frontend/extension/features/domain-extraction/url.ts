export function getUrl(url: string) {
    try {
        return new URL(url)
    } catch {
        return null
    }
}
