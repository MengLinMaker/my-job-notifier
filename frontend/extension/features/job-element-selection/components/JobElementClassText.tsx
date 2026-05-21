import { cn } from '@lib/lib-ui/lib/utils'

export function JobElementClassText(props: {
    isEditing: boolean
    jobElementClass: string | null
    onJobElementClassChange: (jobElementClass: string | null) => void
}) {
    const hasSelectedClass = Boolean(props.jobElementClass)
    if (props.isEditing) {
        return (
            <p className="border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive wrap-anywhere">
                Hover and click on green bordered element
            </p>
        )
    }

    return (
        <textarea
            className={cn(
                'min-h-20 w-full resize-y border p-2 text-xs outline-none wrap-anywhere',
                hasSelectedClass
                    ? 'border-border bg-muted font-mono'
                    : 'border-destructive/50 bg-destructive/10 font-sans text-destructive',
            )}
            onChange={(event) => {
                props.onJobElementClassChange(event.target.value || null)
            }}
            placeholder="No element selected, please edit"
            value={props.jobElementClass ?? ''}
            spellCheck={false}
            aria-label="Job element class"
            rows={4}
        />
    )
}
