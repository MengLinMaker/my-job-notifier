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

type JobElementSelectionProps = {
    origin: string | null
    tabId: number | null
}

export function JobElementSelection({ origin, tabId }: JobElementSelectionProps) {
    const [selectedClassName, setSelectedClassName] = useSyncedStorageState<string | null>(
        origin ? JOB_ELEMENT_CLASS_STORAGE_KEY(origin) : null,
        null,
    )
    const [hoveredClassName, setHoveredClassName] = useState<string | null>(null)
    const [isTracking, setIsTracking] = useState(false)
    const displayedClassName = isTracking ? hoveredClassName : selectedClassName

    useEffect(() => {
        setIsTracking(false)
        setHoveredClassName(null)
        if (!tabId || !selectedClassName) return
        browser.tabs
            .sendMessage(tabId, {
                type: SET_JOB_ELEMENT_CLASS_MESSAGE,
                className: selectedClassName,
            })
            .catch(() => {})
    }, [selectedClassName, tabId])

    useEffect(() => {
        if (!tabId) return
        const port = browser.tabs.connect(tabId, { name: HOVERED_CLASS_PORT })
        port.onMessage.addListener((message) => {
            if (!isHoveredClassMessage(message)) return
            setIsTracking(message.isTracking)
            if (message.isTracking) {
                setHoveredClassName(message.className)
                return
            }
            setHoveredClassName(null)
            setSelectedClassName(message.className)
        })
        return () => port.disconnect()
    }, [setSelectedClassName, tabId])

    function trackJobPostings() {
        if (!tabId) return
        const nextIsTracking = !isTracking

        setHoveredClassName(null)
        setIsTracking(nextIsTracking)
        browser.tabs
            .sendMessage(tabId, {
                type: isTracking ? CANCEL_JOB_TRACKING_MESSAGE : START_JOB_TRACKING_MESSAGE,
                className: selectedClassName,
            })
            .catch(() => {
                setHoveredClassName(hoveredClassName)
                setIsTracking(isTracking)
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
                <EditButton isEditing={isTracking} onClick={trackJobPostings} />
            </div>
            <JobElementClassText jobElementClass={displayedClassName} isEditing={isTracking} />
        </section>
    )
}

function isHoveredClassMessage(
    value: unknown,
): value is { className: string | null; isTracking: boolean } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'className' in value &&
        'isTracking' in value &&
        (typeof value.className === 'string' || value.className === null) &&
        typeof value.isTracking === 'boolean'
    )
}
