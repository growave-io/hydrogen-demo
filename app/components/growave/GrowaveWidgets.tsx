import {useRouteLoaderData} from 'react-router';
import type {RootLoader} from '~/root';

export function useGrowaveConfig() {
  return useRouteLoaderData<RootLoader>('root')?.growave ?? null;
}

// The Shopify theme extension defines this hook; the bundle needs it to pick up gw-style-for-* tags.
const CUSTOMIZATIONS_HOOK = `window.gw = window.gw || {};
if (!window.gw.customizations) {
  window.gw.customizations = [];
  window.gw.registerWidgetCustomization = (selectWidget, customizeWidget) => {
    window.gw.customizations.push([selectWidget, customizeWidget]);
  };
}`;

export function GrowaveCustomizationsHook({nonce}: {nonce?: string}) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{__html: CUSTOMIZATIONS_HOOK}}
    />
  );
}

// Page widgets stretch to 100vw by default; these keep them inside the page container.
// The product page wishlist and registry buttons are restyled to match the site's outline Button.
// Both widgets' own button rules are more specific than these, hence the repeated classes and !important.
export function GrowaveWidgetStyles() {
  return (
    <>
      <style id="gw-style-for-ReviewsPageWidgetV2">{`
        .gw-rv-page-widget__wrapper { width: auto !important; margin-left: 0 !important; }
        .gw-rv-page-widget { max-width: none !important; padding-inline: 0 !important; }
      `}</style>
      <style id="gw-style-for-WishlistPageWidgetV2">{`
        .gw-wl-page-wrapper { width: auto !important; margin-left: 0 !important; }
        .gw-wl-page { max-width: none !important; padding-inline: 0 !important; }
      `}</style>
      <style id="gw-style-for-AddToWishlistProductPageWidget">{`
        .gw-wl-add-to-wishlist-product-page-widget .gw-btn.gw-btn.gw-button.gw-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 36px;
          padding: 0 10px !important;
          box-sizing: border-box;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: none !important;
          background-color: var(--background) !important;
          color: var(--foreground) !important;
          font-family: inherit;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 20px !important;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
        }
        .gw-wl-add-to-wishlist-product-page-widget .gw-btn.gw-btn.gw-button.gw-button:hover {
          background-color: var(--muted) !important;
        }
        .gw-wl-add-to-wishlist-product-page-widget .gw-wl-add-to-wishlist-btn__inner { gap: 6px !important; }
        .gw-wl-add-to-wishlist-product-page-widget .gw-wl-add-to-wishlist-btn__inner > :is(svg, img) {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .gw-wl-add-to-wishlist-product-page-widget .gw-wl-icon { color: inherit; }
        .gw-wl-add-to-wishlist-product-page-widget .gw-badge {
          padding: 0 !important;
          font: inherit !important;
          color: var(--muted-foreground) !important;
        }
      `}</style>
      <style id="gw-style-for-AddToRegistryProductPageWidget">{`
        .gw-gr-add-to-registry-product-page-widget .gw-btn.gw-button {
          height: 36px;
          min-height: 36px !important;
          padding: 0 10px !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: none !important;
          background-color: var(--background) !important;
          color: var(--foreground) !important;
          font-size: 14px !important;
          font-weight: 500;
          line-height: 20px;
          text-transform: none;
          letter-spacing: normal;
          white-space: nowrap;
        }
        .gw-gr-add-to-registry-product-page-widget .gw-btn.gw-button:hover {
          background-color: var(--muted) !important;
        }
      `}</style>
    </>
  );
}
