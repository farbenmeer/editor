'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { InlineTextEditor } from 'src/components/form/editor/inline-text/InlineTextEditor';
import { Button } from 'src/components/form/button/Button';
import { ReactNode, useState } from 'react';

interface Props {
  url?: string;
  onSave(url: string): void;
  onRemove(): void;
  children: ReactNode;
}

export function LinkEditDialog({ url: initial, onSave, onRemove, children }: Props) {
  const [currentUrl, setUrl] = useState<string | null>(null);
  const url = currentUrl ?? initial ?? '';

  return (
    <Dialog.Root
      onOpenChange={() => {
        setUrl(null);
      }}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-slate-800/70 fixed inset-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[51] p-8 rounded-md shadow-md shadow-slate-800 flex flex-col gap-6 w-full max-w-lg">
          <Dialog.Title className="text-lg flex gap-2 items-center">Link bearbeiten</Dialog.Title>
          <Dialog.Description>
            Zu folgender URL verlinken:
            <InlineTextEditor
              type="url"
              placeholder="URL"
              className="p-4"
              value={url}
              onChange={setUrl}
            />
          </Dialog.Description>
          <div className="flex gap-4 flex-col items-stretch sm:flex-row sm:items-start">
            <Dialog.Close asChild>
              <Button>Abbrechen</Button>
            </Dialog.Close>
            {initial && (
              <Dialog.Close onClick={onRemove} asChild>
                <Button>Link entfernen</Button>
              </Dialog.Close>
            )}
            <Dialog.Close onClick={() => currentUrl && onSave(currentUrl)} asChild>
              <Button primary disabled={!currentUrl}>
                Speichern
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
