import {ArrowUpRightIcon, TriangleAlertIcon} from 'lucide-react';
import type {DemoNotice} from '~/lib/demoNotices';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';

export function DemoNotices({notices}: {notices: DemoNotice[]}) {
  if (!notices.length) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pt-4 sm:px-6">
      {notices.map((notice) => (
        <Alert key={notice.title} variant={notice.variant}>
          <TriangleAlertIcon />
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>
            <p>{notice.description}</p>
            {(notice.command || notice.docs) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                {notice.command && (
                  <code className="rounded-md border border-current/20 bg-background/70 px-2 py-0.5 font-mono text-xs">
                    {notice.command}
                  </code>
                )}
                {notice.docs && (
                  <a
                    href={notice.docs.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium underline underline-offset-4"
                  >
                    {notice.docs.label}
                    <ArrowUpRightIcon className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
