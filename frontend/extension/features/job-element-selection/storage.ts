import { JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX } from './contract'

export function getJobElementClassStorageKey(origin: string) {
    return `${JOB_ELEMENT_CLASS_STORAGE_KEY_PREFIX}${origin}`
}
