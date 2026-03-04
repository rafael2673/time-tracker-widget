import { ofetch } from 'ofetch'

export const $api = ofetch.create({
    onRequest({ options }) {
        if (typeof window !== 'undefined' && window.AP101_CONFIG?.apiUrl) {
            options.baseURL = window.AP101_CONFIG.apiUrl
        } else {
            options.baseURL = 'http://localhost:8080'
        }
    }
})