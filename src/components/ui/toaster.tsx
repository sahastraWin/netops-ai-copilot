"use client";

import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`p-4 rounded-lg border shadow-lg animate-fade-in-up text-sm ${
            variant === "destructive"
              ? "bg-red-950 border-red-800 text-red-200"
              : "bg-[#0d1117] border-[#1f2937] text-gray-200"
          }`}
        >
          {title && <p className="font-semibold mb-0.5">{title}</p>}
          {description && <p className="text-xs opacity-80">{description}</p>}
        </div>
      ))}
    </div>
  );
}
