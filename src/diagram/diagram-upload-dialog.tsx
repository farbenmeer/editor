import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '../../button/Button';
import { sanitizeSvg } from 'src/app/[locale]/chapters/[slug]/actions';
import { useState } from 'react';

interface Props {
  children: React.ReactNode;
  onUpload(svg: string): void;
}

export function DiagramUploadDialog({ children, onUpload }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-slate-800/70 fixed inset-0 z-50" />
        <Dialog.Content asChild>
          <form
            onSubmit={async event => {
              event.preventDefault();
              setBusy(true);
              const formData = new FormData(event.target as HTMLFormElement);
              try {
                const { svg } = await sanitizeSvg(formData);
                onUpload(svg);
                setOpen(false);
              } finally {
                setBusy(false);
              }
            }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[51] p-8 rounded-md shadow-md shadow-slate-800 flex flex-col gap-6 w-full max-w-lg">
            <Dialog.Title className="text-lg flex gap-2 items-center">
              Diagramm einfügen
            </Dialog.Title>
            <Dialog.Description>
              Bitte lade das Diagramm als SVG-File hier hoch:
              <input name="svg" type="file" className="p-2 mt-2" />
            </Dialog.Description>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <Button type="button">Abbrechen</Button>
              </Dialog.Close>
              <Button type="submit" primary disabled={busy}>
                Speichern
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
