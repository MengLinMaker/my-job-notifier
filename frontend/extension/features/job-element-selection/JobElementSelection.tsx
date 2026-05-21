import { useEffect, useState } from 'react'
import { useSyncedStorageState } from '../../utils/useSyncedStorageState'
import {
    CANCEL_JOB_TRACKING_MESSAGE,
    HOVERED_CLASS_PORT,
    JOB_ELEMENT_CLASS_STORAGE_KEY,
    SET_JOB_ELEMENT_CLASS_MESSAGE,
    START_JOB_TRACKING_MESSAGE,
} from './contract'
import { EditButton } from './components/EditButton'
import { JobElementClassText } from './components/JobElementClassText'

export function JobElementSelection(props: { origin: string; tabId: number }) {
    const [selectedClassName, setSelectedClassName] = useSyncedStorageState<string | null>(
        JOB_ELEMENT_CLASS_STORAGE_KEY(props.origin),
        null,
    )
    const [hoveredClassName, setHoveredClassName] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const displayedClassName = isEditing ? hoveredClassName : selectedClassName

    useEffect(() => {
        if (isEditing || !selectedClassName) return
        browser.tabs.sendMessage(props.tabId, {
            type: SET_JOB_ELEMENT_CLASS_MESSAGE,
            className: selectedClassName,
        })
    }, [isEditing, selectedClassName, props.tabId])

    useEffect(() => {
        const port = browser.tabs.connect(props.tabId, { name: HOVERED_CLASS_PORT })
        port.onMessage.addListener((message: { className: string | null; isEditing: boolean }) => {
            setIsEditing(message.isEditing)
            if (message.isEditing) return setHoveredClassName(message.className)
            setHoveredClassName(null)
            setSelectedClassName(message.className)
        })
        return () => port.disconnect()
    }, [setSelectedClassName, props.tabId])

    function trackJobPostings() {
        setHoveredClassName(null)
        setIsEditing(!isEditing)
        browser.tabs.sendMessage(props.tabId, {
            type: isEditing ? CANCEL_JOB_TRACKING_MESSAGE : START_JOB_TRACKING_MESSAGE,
            className: selectedClassName,
        })
    }

    return (
        <section className="grid gap-2" aria-labelledby="job-element-class-heading">
            <div className="flex items-center justify-between gap-2">
                <h2
                    id="job-element-class-heading"
                    className="text-xs font-medium text-muted-foreground uppercase"
                >
                    Job Element Class
                </h2>
                <EditButton isEditing={isEditing} onClick={trackJobPostings} />
            </div>
            <JobElementClassText jobElementClass={displayedClassName} isEditing={isEditing} />
        </section>
    )
}
