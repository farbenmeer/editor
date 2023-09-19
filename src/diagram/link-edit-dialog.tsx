'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { MdDelete } from 'react-icons/md';
import { fetchSuggestions } from 'src/app/[locale]/chapters/[slug]/actions';
import { Button } from '../../button/Button';
import { InlineTextEditor } from '../../editor/inline-text/InlineTextEditor';
import { MentionableIcon } from '../mention/MentionableIcon';
import { MentionablePopover } from '../mention/MentionablePopover';
import { Mentionable, MentionableByType } from '../mention/mentionables';

export interface EditableText {
  path: string;
  link?: string | Mentionable;
  label: string;
}

interface Props {
  editableText: EditableText | null;
  onSave(value: string | Mentionable): void;
  onRemove(): void;
  onCancel(): void;
}

export function LinkEditDialog(props: Props) {
  return (
    <InnerLinkEditDialog
      key={props.editableText?.link ? 'linked-' : 'unlinked-' + props.editableText?.path}
      {...props}
    />
  );
}

function InnerLinkEditDialog({ editableText, onSave, onRemove, onCancel }: Props) {
  const [currentValue, setValue] = useState<string | Mentionable | null>(null);
  const value = currentValue ?? editableText?.link ?? '';

  return (
    <Dialog.Root open={Boolean(editableText)} onOpenChange={open => open || onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-slate-800/70 fixed inset-0 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[51] p-8 rounded-md shadow-md shadow-slate-800 flex flex-col gap-6 w-full max-w-lg">
          <Dialog.Title className="text-lg flex gap-2 items-center">
            Link &quot;{editableText?.label}&quot; bearbeiten
          </Dialog.Title>
          <Dialog.Description asChild>
            <div>
              Gib hier den Namen eines Kapitels, Glossareintrags, einer Person oder einen externen
              Link ein:
              {typeof value === 'object' ? (
                <Mention mentionable={value} onRemove={() => setValue('')} />
              ) : (
                <Suggestions search={value.startsWith('http') ? '' : value} onSelect={setValue}>
                  <InlineTextEditor
                    placeholder="Nicht verlinkt"
                    className="p-4"
                    value={value}
                    onChange={setValue}
                  />
                </Suggestions>
              )}
            </div>
          </Dialog.Description>
          <div className="flex gap-4 flex-col items-stretch sm:flex-row sm:items-start">
            <Button onClick={onCancel}>Abbrechen</Button>
            {editableText?.link && <Button onClick={() => onRemove()}>Link Löschen</Button>}
            <Button
              primary
              onClick={() => editableText && onSave(value)}
              disabled={!editableText || !value}>
              Speichern
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface SuggestionsProps {
  children: ReactNode;
  search: string;
  onSelect(selected: Mentionable): void;
}

function Suggestions({ children, search, onSelect }: SuggestionsProps) {
  const [mentionables, setMentionables] = useState<MentionableByType | null>(null);
  const allMentionables = [
    ...(mentionables?.chapters ?? []),
    ...(mentionables?.people ?? []),
    ...(mentionables?.terms ?? []),
  ];
  const [selected, setSelected] = useState<number>(-1);

  function close() {
    setMentionables(null);
    setSelected(-1);
  }

  const reloadSuggestions = useCallback(async () => {
    if (!search) {
      return;
    }
    const mentionables = await fetchSuggestions(search);
    setMentionables(mentionables);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(reloadSuggestions, 200);
    return () => {
      clearTimeout(timeout);
    };
  }, [reloadSuggestions]);

  const anchor = cloneElement(Children.only(children) as ReactElement, {
    onKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelected(selected => (selected + 1 + allMentionables.length) % allMentionables.length);
          return;
        case 'ArrowUp':
          event.preventDefault();
          setSelected(selected => (selected - 1 + allMentionables.length) % allMentionables.length);
          return;
        case 'Tab':
        case 'Enter': {
          event.preventDefault();
          const target = allMentionables[selected];
          if (target) onSelect(target);
          close();
          return;
        }
        case 'Escape':
          event.preventDefault();
          close();
      }
    },
  });

  return (
    <Popover.Root open={Boolean(search && mentionables)} onOpenChange={open => open || close()}>
      <Popover.Anchor onFocus={() => reloadSuggestions()}>{anchor}</Popover.Anchor>
      <Popover.Content onOpenAutoFocus={event => event.preventDefault()}>
        {mentionables && (
          <MentionablePopover
            mentionables={mentionables}
            selected={allMentionables[selected]}
            onSelect={selected => {
              onSelect(selected);
              close();
            }}
          />
        )}
      </Popover.Content>
    </Popover.Root>
  );
}

interface MentionProps {
  mentionable: Mentionable;
  onRemove(): void;
}

function Mention({ mentionable, onRemove }: MentionProps) {
  return (
    <div className="flex items-center w-fit gap-2 rounded-md bg-zinc-200 p-2">
      <MentionableIcon mentionable={mentionable} />
      {mentionable.name}
      <button onClick={onRemove}>
        <MdDelete />
      </button>
    </div>
  );
}
