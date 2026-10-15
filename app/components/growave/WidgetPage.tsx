export function WidgetPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="sr-only">{title}</h1>
      <div className="flex flex-col gap-12">{children}</div>
    </div>
  );
}
