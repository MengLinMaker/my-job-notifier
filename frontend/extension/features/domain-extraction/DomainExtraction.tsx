export function DomainExtraction(props: { origin: string }) {
    return (
        <section className="grid gap-2" aria-labelledby="current-tab-heading">
            <h2
                id="current-tab-heading"
                className="text-xs font-medium text-muted-foreground uppercase"
            >
                Settings for origin
            </h2>
            <p className="border border-border bg-muted p-2 text-sm wrap-anywhere">
                {props.origin}
            </p>
        </section>
    )
}
