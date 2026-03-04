import { defineCustomElement, createApp, h, getCurrentInstance } from 'vue'
import { createPinia } from 'pinia'
import TimerWidget from './components/TimerWidget.vue'
import styles from './style.css?inline'

const pinia = createPinia()

function injectGlobalStyles() {
    const id = 'time-tracker-global-styles'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = styles
    document.head.appendChild(style)
}

function ensureTeleportContainer() {
    const id = 'time-tracker-teleport'
    if (document.getElementById(id)) return
    const container = document.createElement('div')
    container.id = id

    const syncDark = () => {
        container.classList.toggle('dark', document.documentElement.classList.contains('dark'))
    }
    syncDark()
    new MutationObserver(syncDark).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
    })

    document.body.appendChild(container)
}

function setupDOM() {
    injectGlobalStyles()
    ensureTeleportContainer()
}

if (document.body) {
    setupDOM()
} else {
    document.addEventListener('DOMContentLoaded', setupDOM, { once: true })
}

const WidgetWrapper = defineCustomElement({
    styles: [styles],
    props: {
        compact: { type: Boolean, default: false },
        rounded: { type: String, default: '2rem' }
    },
    setup(props) {
        const app = createApp({})
        app.use(pinia)

        const inst = getCurrentInstance()
        if (inst) {
            Object.assign(inst.appContext, app._context)
            Object.assign(inst.provides, app._context.provides)
        }

        return () => h(TimerWidget, {
            compact: props.compact,
            rounded: props.rounded
        })
    }
})

customElements.define('time-tracker', WidgetWrapper)
