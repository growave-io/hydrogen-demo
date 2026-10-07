import {TriangleAlertIcon} from 'lucide-react';
import type {DemoNotice} from '~/lib/demoNotices';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';

export function DemoNotices({notices}: {notices: DemoNotice[]}) {
  if (!notices.length) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pt-4 sm:px-6">
      {notices.map((notice) => (
        <Alert key={notice.title}>
          <TriangleAlertIcon />
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
