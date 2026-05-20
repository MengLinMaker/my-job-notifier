import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    manifest: {
        name: 'My Job Notifier',
        permissions: ['activeTab', 'sidePanel', 'storage', 'tabs'],
    },
    webExt: {
        chromiumProfile: '.wxt/chrome-profile',
        chromiumPref: {
            session: {
                restore_on_startup: 1,
            },
        },
        keepProfileChanges: true,
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),
})
