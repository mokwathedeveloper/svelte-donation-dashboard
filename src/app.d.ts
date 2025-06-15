// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

declare module '$env/static/private' {
  export const MONGODB_URI: string;
  export const JWT_SECRET: string;
  export const MPESA_CONSUMER_KEY: string;
  export const MPESA_CONSUMER_SECRET: string;
  export const MPESA_PASSKEY: string;
  export const MPESA_SHORTCODE: string;
  export const MPESA_CALLBACK_URL: string;
}

export {};
