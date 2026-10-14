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
    <div className="flex size-8 items-center justify-center">
      <WishlistsGoToWishlistsPageHeaderWidget />
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
