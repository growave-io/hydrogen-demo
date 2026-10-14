import type {Route} from './+types/sitemap.$type.$page[.xml]';
import {getSitemap} from '@shopify/hydrogen';

const SITEMAP_PATHS: Record<string, string> = {products: 'p', collections: 'c'};

export async function loader({
  request,
  params,
  context: {storefront},
}: Route.LoaderArgs) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-US', 'EN-CA', 'FR-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      const path = `${SITEMAP_PATHS[type] ?? type}/${handle}`;
      if (!locale) return `${baseUrl}/${path}`;
      return `${baseUrl}/${locale}/${path}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}
