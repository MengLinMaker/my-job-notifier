import { useCallback, useEffect, useState, type SetStateAction } from 'react'

export function useLocalStorageState<T>(key: string | null, initialValue: T) {
    const [storedState, setStoredState] = useState({ key, value: initialValue })
    const value = storedState.key === key ? storedState.value : initialValue

    useEffect(() => {
        let isCurrent = true
        if (!key) {
            setStoredState({ key, value: initialValue })
            return
        }

        setStoredState({ key, value: initialValue })
        browser.storage.local.get(key).then((items) => {
            if (!isCurrent) return
            setStoredState({ key, value: key in items ? (items[key] as T) : initialValue })
        })
        return () => {
            isCurrent = false
        }
    }, [initialValue, key])

    const setStoredValue = useCallback(
        (nextValue: SetStateAction<T>) => {
            setStoredState((currentState) => {
                const valueToStore =
                    typeof nextValue === 'function'
                        ? (nextValue as (currentValue: T) => T)(currentState.value)
                        : nextValue

                if (key) browser.storage.local.set({ [key]: valueToStore })
                return { key, value: valueToStore }
            })
        },
        [key],
    )

    return [value, setStoredValue] as const
}
