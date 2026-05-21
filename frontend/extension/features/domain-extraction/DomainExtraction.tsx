import { getUrl } from './url'

type DomainExtractionProps = {
    url: string
}

export function DomainExtraction({ url }: DomainExtractionProps) {
    const parsedUrl = getUrl(url)

    return (
        <section className="grid gap-2" aria-labelledby="current-tab-heading">
            <h2
                id="current-tab-heading"
                className="text-xs font-medium text-muted-foreground uppercase"
            >
                Settings for domain
            </h2>
            <p className="border border-border bg-muted p-2 text-sm wrap-anywhere">
                {parsedUrl?.origin}
            </p>
        </section>
    )
}
