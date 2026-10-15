import {Await} from 'react-router';
import {Suspense} from 'react';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {Aside} from '~/components/layout/Aside';
import {TooltipProvider} from '~/components/ui/tooltip';
import {Footer} from '~/components/layout/Footer';
import {Header, HeaderMenu} from '~/components/layout/Header';
import {CartMain} from '~/components/cart/CartMain';
import {DemoNotice} from '~/components/layout/DemoNotice';
import type {CurrentCustomer} from '~/lib/customer';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  header: HeaderQuery;
  customer: Promise<CurrentCustomer | null>;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  header,
  customer,
}: PageLayoutProps) {
  return (
    <TooltipProvider>
      <Aside.Provider>
        <CartAside cart={cart} />
        <MobileMenuAside />
        <div className="flex min-h-svh flex-col">
          {header && <Header header={header} cart={cart} customer={customer} />}
          <DemoNotice />
          <main className="integration-rail relative isolate mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <Footer header={header} />
        </div>
      </Aside.Provider>
    </TooltipProvider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Cart">
      <Suspense
        fallback={<p className="text-muted-foreground">Loading cart…</p>}
      >
        <Await resolve={cart}>
          {(cart) => <CartMain cart={cart} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function MobileMenuAside() {
  return (
    <Aside type="mobile" heading="Menu" side="left">
      <HeaderMenu viewport="mobile" />
    </Aside>
  );
}
