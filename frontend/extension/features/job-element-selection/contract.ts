export const HOVERED_CLASS_PORT = 'hovered-class-name'
export const START_JOB_TRACKING_MESSAGE = 'start-job-tracking'
export const CANCEL_JOB_TRACKING_MESSAGE = 'cancel-job-tracking'
export const SET_JOB_ELEMENT_CLASS_MESSAGE = 'set-job-element-class'
export const JOB_ELEMENT_CLASS_STORAGE_KEY = (origin: string) => `job-element-class:${origin}`

export const HOVER_STYLES_ID = 'my-job-notifier-hover-styles'
export const HIGHLIGHT_ATTRIBUTE = 'data-my-job-notifier-highlighted'
export const HIGHLIGHT_DATA_VALUE = 'true'
export const HIGHLIGHT_SELECTOR = `[${HIGHLIGHT_ATTRIBUTE}="${HIGHLIGHT_DATA_VALUE}"]`
