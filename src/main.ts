import { defineCustomElement, createApp, h, getCurrentInstance } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import styles from './style.css?inline'

const pinia = createPinia()

const WidgetWrapper = defineCustomElement({
    styles: [styles],
    props: {
        compact: { type: [Boolean, String], default: false },
        rounded: { type: String, default: '2rem' },
        apiUrl: { type: String, required: true },
        lang: { type: String, default: 'pt-BR' },
        token: { type: String }
    },
    setup(props) {
        const app = createApp({})
        app.use(pinia)

        const inst = getCurrentInstance()
        if (inst) {
            Object.assign(inst.appContext, app._context)
            Object.assign((inst as any).provides, app._context.provides)
        }

        return () => h(App, {
            compact: props.compact,
            rounded: props.rounded,
            apiUrl: props.apiUrl as string,
            lang: props.lang,
            token: props.token
        })
    }
})

customElements.define('time-tracker', WidgetWrapper)