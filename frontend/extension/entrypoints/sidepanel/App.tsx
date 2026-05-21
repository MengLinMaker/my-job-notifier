import { useState } from 'react'
import { DomainExtraction } from '../../features/domain-extraction/DomainExtraction'
import { getUrl } from '../../features/domain-extraction/url'
import { JobElementSelection } from '../../features/job-element-selection/JobElementSelection'
import { ScrapePreview } from '../../features/scrape-preview/ScrapePreview'
import { useTab } from '../../utils/useTab'

export default function App() {
    const tab = useTab()
    const origin = getUrl(tab?.url ?? '')?.origin
    const [jobElementClass, setJobElementClass] = useState<string | null>(null)

    if (!tab?.id || !origin) {
        return (
            <main className="grid gap-4 p-4">
                <p className="border border-border bg-muted p-2 text-sm text-muted-foreground">
                    Loading tab settings...
                </p>
            </main>
        )
    }

    return (
        <main className="grid gap-4 p-4">
            <DomainExtraction origin={origin} />
            <JobElementSelection
                onJobElementClassChange={setJobElementClass}
                origin={origin}
                tabId={tab.id}
            />
            <ScrapePreview jobElementClass={jobElementClass} tabId={tab.id} />
        </main>
    )
}
