import type {HeaderQuery} from 'storefrontapi.generated';

export function Footer({header}: {header: HeaderQuery}) {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {header.shop.name}
      </div>
    </footer>
  );
}
