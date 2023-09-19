import { autoUpdate, shift } from '@floating-ui/dom';
import { flip, useFloating } from '@floating-ui/react';
import clsx from 'clsx';
import Link from 'next/link';
import {
  KeyboardEventHandler,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { BaseEditor, Descendant, Editor, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import { CustomEditor } from 'src/components/form/richtext/custom-types';
import { MentionPopover } from 'src/components/form/richtext/mention/MentionPopover';
import { MentionableIcon } from 'src/components/form/richtext/mention/MentionableIcon';
import { MentionablePopover } from 'src/components/form/richtext/mention/MentionablePopover';
import {
  Mentionable,
  MentionableByType,
  mentionMatches,
} from 'src/components/form/richtext/mention/mentionables';
import classes from '../RichtextEditor.module.css';
import type { EditorPlugin } from '../richtext-support';

export type MentionElement = {
  type: 'mention';
  children: [{ text: '' }];
} & Mentionable;

export const MentionContext = createContext<{
  open(mention?: Mentionable, target?: HTMLElement): void;
}>({
  open: () => {
    throw new Error('Needs to be inside RichtextEditor');
  },
});

export const isMention = (element: Descendant): element is MentionElement =>
  'type' in element && element.type === 'mention';

export function withMentions<T extends BaseEditor>(editor: T): T {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = element => isMention(element) || isInline(element);
  editor.isVoid = element => isMention(element) || isVoid(element);
  editor.markableVoid = element => isMention(element) || markableVoid(element);

  return editor;
}

export const Mention = ({
  attributes,
  element,
  children,
}: RenderElementProps & { element: MentionElement }) => {
  const { targetId, targetType, name } = element;
  const selected = useSelected();
  const focused = useFocused();

  const { open } = useContext(MentionContext);

  const className = clsx({
    [classes.mention!]: true,
    [classes.chapter!]: targetType === 'Chapter',
    [classes.person!]: targetType === 'Person',
    [classes.term!]: targetType === 'Term',
    [classes.selected!]: selected && focused,
  });

  const icon = targetType === 'Person' && <MentionableIcon mentionable={element} />;

  return targetType === 'Chapter' ? (
    <Link
      {...attributes}
      contentEditable={false}
      className={className}
      aria-describedby="mention-popover"
      href={`/chapters/${targetId}`}
      onMouseEnter={ev => open(element, ev.currentTarget)}
      onMouseLeave={() => open()}>
      <span>{name}</span>
      {children}
    </Link>
  ) : (
    <span
      {...attributes}
      contentEditable={false}
      className={className}
      aria-describedby="mention-popover"
      onMouseEnter={ev => open(element, ev.currentTarget)}
      onMouseLeave={() => open()}>
      {icon}
      <span className={clsx(icon && 'pl-0.5')}>{name}</span>
      {children}
    </span>
  );
};

export function MentionPopoverProvider({ children }: { children: ReactNode }) {
  const [mention, setMention] = useState<{ mention: Mentionable; target: HTMLElement } | null>();
  const open = (mention?: Mentionable, target?: HTMLElement) =>
    setMention(mention && target ? { mention, target } : null);
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    open: !!mention,
    whileElementsMounted: autoUpdate,
    middleware: [shift(), flip()],
  });

  useEffect(() => {
    refs.setReference(mention?.target ?? null);
  }, [refs, mention]);

  return (
    <MentionContext.Provider value={{ open }}>
      {children}
      {mention && (
        <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 10 }}>
          <MentionPopover mention={mention.mention} />
        </div>
      )}
    </MentionContext.Provider>
  );
}

export const insertMention = (editor: Editor, mentionable: Mentionable) => {
  Transforms.insertNodes(editor, {
    ...mentionable,
    type: 'mention',
    children: [{ text: '' }],
  } as MentionElement);
  Transforms.move(editor);
};

export function useMentionableTypeahead({
  editor,
  suggest,
  onChange: defaultOnChange,
  onKeyDown: defaultOnKeyDown,
}: {
  editor: CustomEditor;
  suggest?(search: string): Promise<MentionableByType>;
  onChange?(value: Descendant[]): void;
  onKeyDown?: KeyboardEventHandler;
}) {
  const [target, setTarget] = useState<Range | undefined>();
  const [search, setSearch] = useState('');

  const [results, setResults] = useState<MentionableByType>({});
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Mentionable | undefined>();
  const combinedResults = useMemo(() => {
    return [...(results.chapters ?? []), ...(results.people ?? []), ...(results.terms ?? [])];
  }, [results]);

  // Suggestion Popover
  const suggestionsOpen = !!(target && combinedResults.length);
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    open: suggestionsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [shift(), flip()],
  });

  const insertSelected = useCallback(
    (mentionable?: Mentionable) => {
      if (!target || !(mentionable ?? selected)) return;
      Transforms.select(editor, target);
      insertMention(editor, mentionable ?? selected!);
      setTarget(undefined);
      setSearch('');
    },
    [target, selected, editor],
  );

  const onKeyDown = useCallback<KeyboardEventHandler>(
    event => {
      if (!target || !combinedResults.length) return defaultOnKeyDown?.(event);
      const index = combinedResults.findIndex(it => mentionMatches(it, selected));
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelected(combinedResults[(index + 1) % combinedResults.length]);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelected(
            combinedResults[(index - 1 + combinedResults.length) % combinedResults.length],
          );
          break;
        case 'Tab':
        case 'Enter':
          event.preventDefault();
          insertSelected();
          break;
        case 'Escape':
          event.preventDefault();
          setTarget(undefined);
          break;
      }
    },
    [combinedResults, insertSelected, selected, target, defaultOnKeyDown],
  );

  useEffect(() => {
    if (!target || !combinedResults.length) return;
    const domRange = ReactEditor.toDOMRange(editor, target);
    refs.setReference(domRange);
  }, [target, combinedResults, editor, refs]);

  useEffect(() => {
    if (!suggest) return;
    setBusy(true);
    suggest(search)
      .then(setResults)
      .then(() => setBusy(false))
      .catch(() => setBusy(false));
  }, [search, suggest]);

  const popover = useMemo(() => {
    return (
      <>
        {suggestionsOpen && (
          <div ref={refs.setFloating} style={floatingStyles} key="mentionable">
            <MentionablePopover
              mentionables={results}
              busy={busy}
              selected={selected}
              onSelect={mentionable => {
                setSelected(mentionable);
                insertSelected(mentionable);
              }}
            />
          </div>
        )}
      </>
    );
  }, [suggestionsOpen, refs.setFloating, floatingStyles, results, busy, selected, insertSelected]);

  const onChange = useCallback<(value: Descendant[]) => void>(
    value => {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) {
        setTarget(undefined);
        return defaultOnChange?.(value);
      }
      const [start] = Range.edges(selection);

      const wordBefore = Editor.before(editor, start, { unit: 'word' });
      const before = wordBefore && Editor.before(editor, wordBefore);
      const beforeRange = before && Editor.range(editor, before, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const beforeMatch = beforeText && beforeText.match(/@(\w*)$/);

      if (beforeMatch) {
        setTarget(beforeRange);
        setSearch(beforeMatch[1]!);
        return;
      }

      setTarget(undefined);
      defaultOnChange?.(value);
    },
    [defaultOnChange, editor],
  );

  return { popover, onKeyDown, onChange };
}

export const mentionPlugin: EditorPlugin<MentionElement> = {
  isVoid: true,
  markableVoid: true,
  isInline: true,
  component: Mention,
  isElement: isMention,
};
