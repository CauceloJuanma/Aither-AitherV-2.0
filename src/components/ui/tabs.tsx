import React, { createContext, PropsWithChildren, useContext, useState, HTMLAttributes } from 'react';

interface TabsContextValue {
  value?: string;
  setValue?: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue>({});

export function Tabs({ children, defaultValue, className }: PropsWithChildren<{ defaultValue?: string; className?: string }>) {
  const [value, setValue] = useState<string | undefined>(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue: (v: string) => setValue(v) }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ children, value, className }: PropsWithChildren<{ value?: string; className?: string }>) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      className={className}
      onClick={() => value && ctx.setValue && ctx.setValue(value)}
      aria-pressed={active}
      data-state={active ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className }: PropsWithChildren<{ value?: string; className?: string }>) {
  const ctx = useContext(TabsContext);
  if (value && ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}

export default Tabs;