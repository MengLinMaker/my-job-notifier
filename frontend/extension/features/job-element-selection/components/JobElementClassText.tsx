import { cn } from '@lib/lib-ui/lib/utils'

export function JobElementClassText(props: { jobElementClass: string | null; isEditing: boolean }) {
    const hasSelectedClass = Boolean(props.jobElementClass)
    return (
        <p
            className={cn(
                'border p-2 text-xs wrap-anywhere',
                hasSelectedClass
                    ? 'border-border bg-muted font-mono'
                    : 'border-destructive/50 bg-destructive/10 font-sans text-destructive',
            )}
        >
            {props.jobElementClass ??
                (props.isEditing ? (
                    <span>Hover and click on green bordered element</span>
                ) : (
                    <span>No element selected, please edit</span>
                ))}
        </p>
    )
}
