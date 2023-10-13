import * as Dialog from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";

interface Props {
  url?: string;
  onSave(url: string): void;
  onRemove(): void;
  children: ReactNode;
}

export function LinkEditDialog({
  url: initial,
  onSave,
  onRemove,
  children,
}: Props) {
  const [currentUrl, setUrl] = useState<string | null>(null);
  const url = currentUrl ?? initial ?? "";

  return (
    <Dialog.Root
      onOpenChange={() => {
        setUrl(null);
      }}
    >
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fm-editor-dialog-overlay" />
        <Dialog.Content className="fm-editor-dialog">
          <Dialog.Title className="fm-editor-dialog-title">
            Link bearbeiten
          </Dialog.Title>
          <Dialog.Description>
            Zu folgender URL verlinken:
            <input
              type="url"
              placeholder="URL"
              className="fm-editor-text-input"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </Dialog.Description>
          <div className="fm-editor-dialog-actions">
            <Dialog.Close asChild>
              <button>Abbrechen</button>
            </Dialog.Close>
            {initial && (
              <Dialog.Close onClick={onRemove} asChild>
                <button>Link entfernen</button>
              </Dialog.Close>
            )}
            <Dialog.Close
              onClick={() => currentUrl && onSave(currentUrl)}
              asChild
            >
              <button disabled={!currentUrl}>Speichern</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
