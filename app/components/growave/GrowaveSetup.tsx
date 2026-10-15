import {useEffect, useState} from 'react';
import {useRevalidator} from 'react-router';
import {useNonce} from '@shopify/hydrogen';
import {
  GrowaveApp,
  GrowaveProvider,
  Role,
  useGrowave,
} from '@growave-io/react-sdk';

const GROWAVE_BOOTSTRAP_URL = 'https://static.growave.io/bootstrap_growave.js';

const GROWAVE_URLS = {
  createProductUrl({
    productHandle,
    variantId,
  }: {
    productHandle: string;
    variantId?: number | string | null;
  }) {
    return variantId
      ? `/p/${productHandle}?variant=${variantId}`
      : `/p/${productHandle}`;
  },
  createCollectionUrl({collectionHandle}: {collectionHandle: string}) {
    return `/c/${collectionHandle}`;
  },
  createStorefrontLoginUrl() {
    return '/account/login';
  },
};

type GrowaveConfig = {
  init: {myshopifyDomain: string; storefrontApiAccessToken: string};
  instagramGalleryId: string | null;
};

type GrowaveCustomerAuth = {
  shopifyCustomerId: number;
  signatureTimestamp: number;
  signature: string;
};

// The bootstrap script is added after hydration: the bundle writes into <head> and into
// widget placeholders, and doing that before React hydrates them breaks hydration.
// GrowaveProvider treats any window.gw as a loaded SDK, but window.gw is created early
// for widget customizations, so the provider mounts only once gw.sdk exists.
export function GrowaveSetup({
  config,
  customer,
}: {
  config: GrowaveConfig;
  customer: Promise<GrowaveCustomerAuth | null>;
}) {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const nonce = useNonce();

  useEffect(() => {
    if (document.querySelector(`script[src="${GROWAVE_BOOTSTRAP_URL}"]`))
      return;
    const script = document.createElement('script');
    script.src = GROWAVE_BOOTSTRAP_URL;
    script.async = true;
    if (nonce) script.nonce = nonce;
    document.head.appendChild(script);
  }, [nonce]);

  useEffect(() => {
    const check = () => setIsSdkLoaded(Boolean(window.gw?.sdk));
    check();
    document.addEventListener('gwSdkReady', check);
    return () => document.removeEventListener('gwSdkReady', check);
  }, []);

  if (!isSdkLoaded) return null;

  return (
    <GrowaveProvider>
      <GrowaveInit config={config} customer={customer} />
    </GrowaveProvider>
  );
}

function GrowaveInit({
  config,
  customer,
}: {
  config: GrowaveConfig;
  customer: Promise<GrowaveCustomerAuth | null>;
}) {
  const {
    sdk,
    initGrowave,
    isReadyForInit,
    isInitialized,
    isCartSDKReady,
    isDiscountsSDKReady,
    isAuthenticationSDKReady,
    authenticateCustomer,
    logoutCustomer,
    getCurrentRole,
  } = useGrowave();
  const {revalidate} = useRevalidator();
  const [customerAuth, setCustomerAuth] = useState<
    GrowaveCustomerAuth | null | undefined
  >();

  useEffect(() => {
    let active = true;
    void customer.then((auth) => {
      if (active) setCustomerAuth(auth);
    });
    return () => {
      active = false;
    };
  }, [customer]);

  useEffect(() => {
    if (!isReadyForInit || isInitialized) return;
    initGrowave({
      ...config.init,
      enabledApps: [
        GrowaveApp.Reviews,
        GrowaveApp.Wishlist,
        GrowaveApp.Rewards,
        GrowaveApp.Instagram,
        GrowaveApp.GiftRegistry,
      ],
      localization: 'en',
    });
  }, [config, initGrowave, isReadyForInit, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    void sdk.common.methods.setCustomURLsBuilder(GROWAVE_URLS);
  }, [isInitialized, sdk]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticationSDKReady) return;
    if (customerAuth === undefined) return;

    const role = getCurrentRole();
    if (customerAuth && (role === Role.Guest || role === null)) {
      void authenticateCustomer(customerAuth);
    } else if (!customerAuth && role === Role.Customer) {
      void logoutCustomer();
    }
  }, [
    customerAuth,
    isInitialized,
    isAuthenticationSDKReady,
    getCurrentRole,
    authenticateCustomer,
    logoutCustomer,
  ]);

  useEffect(() => {
    if (!isCartSDKReady) return;
    const postJson = async (url: string, body: unknown) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      void revalidate();
      return response.json();
    };

    sdk.cart.methods.setCustomCartRepository({
      async getCart() {
        const response = await fetch('/api/getCart');
        return response.json();
      },
      addToCart({items}: {items: {variantID: number; quantity: number}[]}) {
        return postJson('/api/addLines', {items});
      },
      changeCartItem(params: {
        variantID: number;
        quantity: number;
        lineKey?: string;
      }) {
        return postJson('/api/changeCartItem', params);
      },
      updateCart({
        discount,
        attributes,
      }: {
        discount?: string;
        attributes?: Record<string, string>;
      }) {
        return postJson('/api/updateCart', {discount, attributes});
      },
    });
  }, [isCartSDKReady, sdk, revalidate]);

  useEffect(() => {
    if (!isDiscountsSDKReady) return;
    sdk.discounts.methods.setCustomDiscountStrategy({
      async applyDiscount(params: {discountCode: string}) {
        await fetch('/api/applyDiscount', {
          method: 'POST',
          body: JSON.stringify({discountCode: params.discountCode}),
        });
        void revalidate();
      },
    });
  }, [isDiscountsSDKReady, sdk, revalidate]);

  return null;
}
