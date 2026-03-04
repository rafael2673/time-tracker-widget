import { ofetch } from 'ofetch'

export const $api = ofetch.create({
    onRequest({ options }) {
        const config = (window as any).__TIME_TRACKER_CONFIG__ || (window as any).AP101_CONFIG || {}

        if (config.apiUrl) {
            options.baseURL = config.apiUrl
        }

        options.headers = new Headers(options.headers)
        options.headers.set('Accept-Language', config.lang || 'pt-BR')
    }
})