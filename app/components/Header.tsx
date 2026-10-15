import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import {MenuIcon, SearchIcon, ShoppingBagIcon, UserIcon} from 'lucide-react';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {WishlistsGoToWishlistsPageHeaderWidget} from '@growave-io/react-sdk';
import {useAside} from '~/components/Aside';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {cn} from '~/lib/utils';
import type {CurrentCustomer} from '~/lib/customer';
import {REPO_URL} from '~/integrations/types';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/components/ui/tooltip';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  customer: Promise<CurrentCustomer | null>;
}

type Viewport = 'desktop' | 'mobile';

export function Header({header, customer, cart}: HeaderProps) {
  const {shop} = header;
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
        <HeaderMenu viewport="desktop" />
        <HeaderCtas customer={customer} cart={cart} />
      </div>
    </header>
  );
}

export function HeaderMenu({viewport}: {viewport: Viewport}) {
  const {close} = useAside();

  return (
    <nav
      className={cn(
        viewport === 'desktop'
          ? 'hidden items-center gap-5 text-sm md:flex'
          : 'flex flex-col gap-1',
      )}
      role="navigation"
    >
      {SITE_MENU.map((item) => {
        if (viewport === 'desktop' && item.url === '/') return null;
        return (
          <NavLink
            end
            key={item.url}
            onClick={close}
            prefetch="intent"
            to={item.url}
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

function HeaderCtas({customer, cart}: Pick<HeaderProps, 'customer' | 'cart'>) {
  return (
    <div className="ml-auto flex items-center gap-1">
      <GithubLink />
      <Button asChild variant="ghost" size="icon" aria-label="Search">
        <Link prefetch="intent" to="/search">
          <SearchIcon />
        </Link>
      </Button>
      <HeaderWishlist />
      <CartToggle cart={cart} />
      <Suspense fallback={<SignInButton />}>
        <Await resolve={customer} errorElement={<SignInButton />}>
          {(customer) =>
            customer ? <AccountButton customer={customer} /> : <SignInButton />
          }
        </Await>
      </Suspense>
    </div>
  );
}

function GithubLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="mr-1 hidden sm:inline-flex lg:pl-2"
    >
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Source code on GitHub"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>
        <span className="hidden lg:inline">Source</span>
      </a>
    </Button>
  );
}

function SignInButton() {
  return (
    <Button asChild variant="ghost" size="icon">
      <Link prefetch="intent" to="/account" aria-label="Sign in">
        <UserIcon />
      </Link>
    </Button>
  );
}

function AccountButton({customer}: {customer: CurrentCustomer}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" className="gap-2 px-1.5 sm:pr-2.5">
          <Link
            prefetch="intent"
            to="/account"
            aria-label={`Account: ${customer.email ?? customer.firstName ?? 'signed in'}`}
          >
            <span
              aria-hidden
              className="flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
            >
              {customer.initials}
            </span>
            <span className="hidden text-sm sm:inline">
              {customer.firstName ? `Hi, ${customer.firstName}` : 'Account'}
            </span>
          </Link>
        </Button>
      </TooltipTrigger>
      {customer.email && (
        <TooltipContent>Signed in as {customer.email}</TooltipContent>
      )}
    </Tooltip>
  );
}

function HeaderWishlist() {
  return (
    <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg transition-all hover:bg-muted">
      <WishlistsGoToWishlistsPageHeaderWidget heartColor="var(--foreground)" />
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

const SITE_MENU = [
  {title: 'Home', url: '/'},
  {title: 'Catalog', url: '/c/all'},
  {title: 'Collections', url: '/collections'},
  {title: 'Rewards Page', url: '/pages/rewards'},
  {title: 'Wishlists Page', url: '/pages/wishlist'},
  {title: 'Reviews Page', url: '/pages/reviews'},
];
