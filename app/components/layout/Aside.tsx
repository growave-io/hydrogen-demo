import {createContext, type ReactNode, useContext, useState} from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

type AsideType = 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

export function Aside({
  children,
  heading,
  type,
  side = 'right',
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  side?: 'left' | 'right';
}) {
  const {type: activeType, close} = useAside();

  return (
    <Sheet
      open={type === activeType}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent side={side} className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{heading}</SheetTitle>
          <SheetDescription className="sr-only">{heading}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
