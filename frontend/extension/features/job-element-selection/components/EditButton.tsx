import { Button } from '@lib/lib-ui/components/button'
import { PencilSimpleIcon, XIcon } from '@phosphor-icons/react'

export function EditButton(props: { isEditing: boolean; onClick: () => void }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="xs"
            className="inline-flex items-center gap-1.5"
            onClick={props.onClick}
        >
            {props.isEditing ? (
                <>
                    <XIcon aria-hidden size={14} />
                    Cancel
                </>
            ) : (
                <>
                    <PencilSimpleIcon aria-hidden size={14} />
                    Edit
                </>
            )}
        </Button>
    )
}
