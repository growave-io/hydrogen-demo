/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    PUBLIC_GROWAVE_INSTAGRAM_GALLERY_ID?: string;
    PRIVATE_GROWAVE_API_SECRET?: string;
  }
}

declare global {
  interface Window {
    gw?: {sdk?: unknown};
  }
}
