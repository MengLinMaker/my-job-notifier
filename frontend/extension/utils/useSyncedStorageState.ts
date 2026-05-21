import { useEffect, useState } from 'react'

export function useSyncedStorageState<T>(key: string | null, initialValue: T) {
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        if (!key) {
            setValue(initialValue)
            return
        }
        browser.storage.sync.get(key).then((items) => {
            setValue(key in items ? (items[key] as T) : initialValue)
        })
    }, [key, initialValue])

    function setStoredValue(nextValue: T) {
        setValue(nextValue)
        if (key) browser.storage.sync.set({ [key]: nextValue })
    }

    return [value, setStoredValue] as const
}
