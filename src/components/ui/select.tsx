import React, { createContext, PropsWithChildren, useContext } from 'react';

type SelectContextValue = {
  value?: string;
  onValueChange?: (v: string) => void;
};

const SelectContext = createContext<SelectContextValue>({});

export function Select({ children, value, onValueChange }: PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function SelectValue() {
  const ctx = useContext(SelectContext);
  return <span>{ctx.value}</span>;
}

export function SelectContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

export function SelectItem({ children, value }: PropsWithChildren<{ value?: string }>) {
  const ctx = useContext(SelectContext);
  return (
    <div
      role="button"
      onClick={() => value && ctx.onValueChange && ctx.onValueChange(value)}
      className="px-2 py-1 cursor-pointer"
    >
      {children}
    </div>
  );
}

export default Select;