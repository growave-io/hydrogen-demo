import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon} from 'lucide-react';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {toRelativeUrl} from '~/lib/menu';
import {cn} from '~/lib/utils';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <HeaderMenuMobileToggle />
        <Link
          prefetch="intent"
          to="/"
          className="font-heading text-base font-semibold tracking-tight"
        >
          {shop.name}
        </Link>
        <HeaderMenu
          menu={menu}
          viewport="desktop"
          primaryDomainUrl={shop.primaryDomain.url}
          publicStoreDomain={publicStoreDomain}
        />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  const items = [
    {id: 'home', title: 'Home', url: '/'},
    ...(menu || FALLBACK_HEADER_MENU).items,
  ];

  return (
    <nav
      className={cn(
        viewport === 'desktop'
          ? 'hidden items-center gap-5 text-sm md:flex'
          : 'flex flex-col gap-1',
      )}
      role="navigation"
    >
      {items.map((item) => {
        if (!item.url) return null;
        if (viewport === 'desktop' && item.id === 'home') return null;
        return (
          <NavLink
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            to={toRelativeUrl(item.url, publicStoreDomain, primaryDomainUrl)}
            className={({isActive}) =>
              cn(
                'text-muted-foreground transition-colors hover:text-foreground',
                isActive && 'text-foreground',
                viewport === 'mobile' && 'rounded-md px-2 py-2 text-base',
              )
            }
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <div className="ml-auto flex items-center gap-1">
      <Button asChild variant="ghost" size="icon" aria-label="Search">
        <Link prefetch="intent" to="/search">
          <SearchIcon />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link prefetch="intent" to="/account">
          <UserIcon />
          <span className="sr-only">
            <Suspense fallback="Sign in">
              <Await resolve={isLoggedIn} errorElement="Sign in">
                {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
              </Await>
            </Suspense>
          </span>
        </Link>
      </Button>
      <CartToggle cart={cart} />
    </div>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2 md:hidden"
      aria-label="Open menu"
      onClick={() => open('mobile')}
    >
      <MenuIcon />
    </Button>
  );
}

function CartBadge({count}: {count: number}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <Button asChild variant="ghost" size="icon" className="relative">
      <a
        href="/cart"
        aria-label={`Cart (items: ${count})`}
        onClick={(e) => {
          e.preventDefault();
          open('cart');
          publish('cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          } as CartViewPayload);
        }}
      >
        <ShoppingBagIcon />
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
            {count}
          </Badge>
        )}
      </a>
    </Button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const FALLBACK_HEADER_MENU = {
  items: [
    {id: 'catalog', title: 'Catalog', url: '/collections/all'},
    {id: 'collections', title: 'Collections', url: '/collections'},
  ],
};
