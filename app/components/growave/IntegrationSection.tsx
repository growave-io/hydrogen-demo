import {useEffect, useRef, useState} from 'react';
import {highlight} from 'sugar-high';
import {CheckIcon, CopyIcon, ExternalLinkIcon, PuzzleIcon} from 'lucide-react';
import {REPO_URL, SDK_SETUP_URL, type Integration} from '~/integrations/types';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/components/ui/tooltip';
import {cn} from '~/lib/utils';

const HIGHLIGHT: 'rail' | 'outline' = 'rail';

export function IntegrationSection({
  integration,
  variant = 'rail',
  className,
  children,
}: {
  integration: Integration;
  variant?: 'rail' | 'badge';
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useWidgetRendered(ref);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  return (
    <div
      ref={ref}
      className={cn(
        'relative',
        HIGHLIGHT === 'outline' &&
          'rounded-lg outline-2 outline-offset-8 outline-transparent transition-[outline-color]',
        HIGHLIGHT === 'outline' && highlighted && 'outline-primary/30',
        className,
      )}
    >
      {children}
      {rendered && (
        <>
          {HIGHLIGHT === 'rail' && variant === 'rail' && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-y-0 left-[calc(100%+39px)] hidden w-[3px] rounded-full bg-primary/70 opacity-0 transition-opacity xl:block',
                highlighted && 'opacity-100',
              )}
            />
          )}
          <IntegrationMarker
            integration={integration}
            variant={variant}
            onOpen={() => setOpen(true)}
            onHighlight={setHighlighted}
          />
          <IntegrationSheet
            integration={integration}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )}
    </div>
  );
}

function IntegrationMarker({
  integration,
  variant,
  onOpen,
  onHighlight,
}: {
  integration: Integration;
  variant: 'rail' | 'badge';
  onOpen: () => void;
  onHighlight: (highlighted: boolean) => void;
}) {
  const hoverProps = {
    onClick: onOpen,
    onMouseEnter: () => onHighlight(true),
    onMouseLeave: () => onHighlight(false),
    onFocus: () => onHighlight(true),
    onBlur: () => onHighlight(false),
  };
  const badge = (
    <button
      type="button"
      {...hoverProps}
      className={cn(
        'absolute top-0 right-0 z-10 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium shadow-sm hover:bg-muted',
        variant === 'rail' && 'xl:hidden',
      )}
    >
      <PuzzleIcon className="size-3" />
      How it&rsquo;s built
    </button>
  );

  if (variant === 'badge') return badge;

  return (
    <>
      {badge}
      <div className="absolute top-0 left-[calc(100%+28px)] z-10 hidden items-center gap-2 xl:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-integration-marker
              aria-label={`How it's built: ${integration.title}`}
              {...hoverProps}
              className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:text-foreground"
            >
              <PuzzleIcon className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="2xl:hidden">
            {integration.title}
          </TooltipContent>
        </Tooltip>
        <button
          type="button"
          tabIndex={-1}
          {...hoverProps}
          className="hidden w-36 text-left text-xs leading-4 text-muted-foreground transition-colors hover:text-foreground 2xl:block"
        >
          {integration.title}
        </button>
      </div>
    </>
  );
}

function IntegrationSheet({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-xl">
        <SheetHeader>
          <Badge variant="secondary" className="w-fit">
            {integration.kind}
          </Badge>
          <SheetTitle className="text-lg">{integration.title}</SheetTitle>
          <SheetDescription>{integration.description}</SheetDescription>
        </SheetHeader>
        <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
          <CodeBlock code={integration.code} />
          <dl className="grid gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Where it lives</dt>
              <dd>
                <a
                  href={`${REPO_URL}/blob/main/${integration.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs underline underline-offset-4"
                >
                  {integration.file}
                  <ExternalLinkIcon className="size-3" />
                </a>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Requires</dt>
              <dd>
                Growave SDK set up in the app root.{' '}
                <a
                  href={SDK_SETUP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  See the setup steps
                </a>
              </dd>
            </div>
          </dl>
          {integration.docsUrl && (
            <Button asChild variant="outline" className="w-fit">
              <a href={integration.docsUrl} target="_blank" rel="noreferrer">
                Widget documentation
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CodeBlock({code}: {code: string}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative min-w-0">
      <pre className="max-w-full overflow-x-auto rounded-lg bg-muted p-4 pr-12 font-mono text-xs leading-relaxed">
        <code dangerouslySetInnerHTML={{__html: highlight(code)}} />
      </pre>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Copy code"
        className="absolute top-2 right-2"
        onClick={() => {
          void navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  );
}

function useWidgetRendered(ref: React.RefObject<HTMLDivElement | null>) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (rendered) return;
    const interval = setInterval(() => {
      const placeholders = ref.current?.querySelectorAll<HTMLElement>(
        '[class^="gw-"][class*="placeholder"]',
      );
      const isRendered = [...(placeholders ?? [])].some(
        (placeholder) =>
          (placeholder.shadowRoot?.querySelectorAll('*').length ?? 0) > 3 ||
          placeholder.childElementCount > 0,
      );
      if (isRendered) setRendered(true);
    }, 500);
    return () => clearInterval(interval);
  }, [ref, rendered]);

  return rendered;
}
