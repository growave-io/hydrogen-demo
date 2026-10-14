import type {HeaderQuery} from 'storefrontapi.generated';
import {ReviewsTrustBadgeWidget} from '@growave-io/react-sdk';

export function Footer({header}: {header: HeaderQuery}) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <span>
          © {new Date().getFullYear()} {header.shop.name}
        </span>
        <ReviewsTrustBadgeWidget />
      </div>
    </footer>
  );
}
