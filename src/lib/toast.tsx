import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type Toast = (message: string, bad?: boolean) => void;
const ToastContext = createContext<Toast>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback<Toast>((text, bad = false) => {
    setMsg({ text, bad });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 3600);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite">{msg && <div className={"toast" + (msg.bad ? " bad" : "")}>{msg.text}</div>}</div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
