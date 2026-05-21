import { useEffect, useState } from 'react'

export function useTab() {
    const [tab, setTab] = useState<Browser.tabs.Tab | undefined>(undefined)

    useEffect(() => {
        const loadActiveTab = () =>
            browser.tabs.query({ active: true, lastFocusedWindow: true }).then(([tab]) => {
                setTab(tab ?? undefined)
            })

        const handleTabActivated: Parameters<typeof browser.tabs.onActivated.addListener>[0] = (
            activeInfo,
        ) =>
            browser.tabs.get(activeInfo.tabId).then((tab) => {
                setTab(tab)
            })

        const handleTabUpdated: Parameters<typeof browser.tabs.onUpdated.addListener>[0] = (
            tabId,
            changeInfo,
            updatedTab,
        ) => {
            if (!updatedTab.active || tab?.id !== tabId) return
            if (changeInfo.url || changeInfo.status) setTab(updatedTab)
        }

        loadActiveTab()
        browser.tabs.onActivated.addListener(handleTabActivated)
        browser.tabs.onUpdated.addListener(handleTabUpdated)

        return () => {
            browser.tabs.onActivated.removeListener(handleTabActivated)
            browser.tabs.onUpdated.removeListener(handleTabUpdated)
        }
    }, [tab?.id])

    return tab
}
