export interface AP101Config {
    apiUrl?: string
    apiKey: string
    user: {
        email: string
        name: string
    }
}

declare global {
    interface Window {
        AP101_CONFIG?: AP101Config
    }
}