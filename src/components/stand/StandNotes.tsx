"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";

interface StandNotesProps {
  notes: string;
  readOnly: boolean;
  onSave: (notes: string) => Promise<void>;
}

export function StandNotes({ notes, readOnly, onSave }: StandNotesProps) {
  const [value, setValue] = useState(notes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialRef = useRef(notes);

  useEffect(() => {
    setValue(notes);
    initialRef.current = notes;
  }, [notes]);

  useEffect(() => {
    if (value === initialRef.current) return;
    setSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(value);
        initialRef.current = value;
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSave]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-triart-gray">Bloco de Notas</h3>
        <div className="flex items-center gap-1.5 text-xs text-triart-gray">
          {saving && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Salvando...
            </>
          )}
          {saved && !saving && (
            <>
              <Check className="w-3 h-3 text-triart-green" />
              Salvo
            </>
          )}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        readOnly={readOnly}
        placeholder={readOnly ? "Nenhuma nota registrada." : "Digite suas notas aqui..."}
        className="min-h-[180px] sm:min-h-[300px] resize-none bg-triart-gray-light/50 border-0 rounded-xl text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-triart-green"
      />
    </div>
  );
}
