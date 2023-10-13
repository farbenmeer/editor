import { autoUpdate, shift } from "@floating-ui/dom";
import { flip, useFloating } from "@floating-ui/react";
import memoize from "memoize-one";
import {
  ElementType,
  KeyboardEventHandler,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import { Descendant, Editor, Node, Range, Transforms } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { CustomEditor } from "../custom-types";
import type {
  EditorPluginDefinition,
  PluginElementProps,
} from "../richtext-support";
import { MentionablePopover } from "./MentionablePopover";

export type MentionElement = {
  type: "mention";
  children: Descendant[];
  mentionable?: Mentionable;
};

export const MentionContext = createContext<{
  open(mention?: Mentionable, target?: HTMLElement): void;
  Component: ElementType<MentionComponentProps<any>>;
  Popover?: ElementType<MentionComponentProps<any>>;
}>({
  open: () => {
    throw new Error("Needs to be inside RichtextEditor");
  },
  Component: () => {
    throw new Error("Needs to be inside RichtextEditor");
  },
});

export const isMention = (
  element: Node | MentionElement
): element is MentionElement => "type" in element && element.type === "mention";

function MentionDraft({
  attributes,
  element,
  children,
}: PluginElementProps<MentionElement>) {
  const editor = useSlate();
  const search = Node.string(element);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<SuggestionGroup<Mentionable>[]>([]);

  useEffect(() => {
    setBusy(true);
  });
  const [selected, setSelected] = useState<Mentionable | undefined>();
  const combinedResults = useMemo(
    () => results.flatMap((group) => group.suggestions),
    [results]
  );
  return (
    <span {...attributes} aria-describedby="mentionable-popover">
      @{children}
    </span>
  );
}

export const Mention = ({
  attributes,
  element,
  children,
}: PluginElementProps<MentionElement>) => {
  const { open, Component } = useContext(MentionContext);

  const { mentionable } = element;

  if (!mentionable) {
    return (
      <MentionDraft attributes={attributes} element={element}>
        {children}
      </MentionDraft>
    );
  }

  return (
    <span
      {...attributes}
      contentEditable={false}
      className="fm-editor-mention"
      aria-describedby="mention-popover"
      onMouseEnter={(ev) => open(mentionable, ev.currentTarget)}
      onMouseLeave={() => open()}
    >
      <Component mentionable={mentionable} />
      {children}
    </span>
  );
};

export function MentionPopoverProvider({
  children,
  Component,
  Popover,
}: {
  children: ReactNode;
  Component?: ElementType<MentionComponentProps<Mentionable>>;
  Popover?: ElementType<MentionComponentProps<Mentionable>>;
}) {
  const [mention, setMention] = useState<Mentionable | null>();
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    open: !!mention,
    whileElementsMounted: autoUpdate,
    middleware: [shift(), flip()],
  });

  const value = useMemo(
    () =>
      Component && {
        open: (mention?: Mentionable, target?: HTMLElement) => {
          setMention(mention ?? null);
          refs.setReference(target ?? null);
        },
        Component,
      },
    [Component, refs]
  );

  if (!value) {
    return children;
  }

  return (
    <MentionContext.Provider value={value}>
      {children}
      {mention && Popover && (
        <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 10 }}>
          <Popover mentionable={mention} />
        </div>
      )}
    </MentionContext.Provider>
  );
}

export const insertMention = (editor: Editor, mentionable: Mentionable) => {
  Transforms.insertNodes(editor, {
    ...mentionable,
    type: "mention",
    children: [{ text: "" }],
  } as any);
  Transforms.move(editor);
};

export function useMentionableTypeahead({
  editor,
  suggest,
  onChange: defaultOnChange,
  onKeyDown: defaultOnKeyDown,
}: {
  editor: CustomEditor;
  suggest?(search: string): Promise<SuggestionGroup<Mentionable>[]>;
  onChange?(value: Descendant[]): void;
  onKeyDown?: KeyboardEventHandler;
}) {
  const [target, setTarget] = useState<Range | undefined>();
  const [search, setSearch] = useState("");

  const [results, setResults] = useState<SuggestionGroup<Mentionable>[]>([]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Mentionable | undefined>();
  const combinedResults = useMemo(
    () => results.flatMap((group) => group.suggestions),
    [results]
  );

  // Suggestion Popover
  const suggestionsOpen = !!(target && combinedResults.length);
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
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
      setSearch("");
    },
    [target, selected, editor]
  );

  const onKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (!target || !combinedResults.length) return defaultOnKeyDown?.(event);
      const index = combinedResults.indexOf(selected!);
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelected(combinedResults[(index + 1) % combinedResults.length]);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelected(
            combinedResults[
              (index - 1 + combinedResults.length) % combinedResults.length
            ]
          );
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          insertSelected();
          break;
        case "Escape":
          event.preventDefault();
          setTarget(undefined);
          break;
      }
    },
    [combinedResults, insertSelected, selected, target, defaultOnKeyDown]
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
              onSelect={(mentionable) => {
                setSelected(mentionable);
                insertSelected(mentionable);
              }}
            />
          </div>
        )}
      </>
    );
  }, [
    suggestionsOpen,
    refs.setFloating,
    floatingStyles,
    results,
    busy,
    selected,
    insertSelected,
  ]);

  const onChange = useCallback<(value: Descendant[]) => void>(
    (value) => {
      const { selection } = editor;
      if (!selection || !Range.isCollapsed(selection)) {
        setTarget(undefined);
        return defaultOnChange?.(value);
      }
      const [start] = Range.edges(selection);

      const wordBefore = Editor.before(editor, start, { unit: "word" });
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
    [defaultOnChange, editor]
  );

  return { popover, onKeyDown, onChange };
}

function insertText(editor: Editor, text: string) {
  const [mention] = Editor.nodes(editor, { match: isMention });

  if (mention) {
    const [node] = mention;
    if ((node as any).mentionable) {
      return;
    }
    if (text === " ") {
      Transforms.unwrapNodes(editor);
      Transforms.move(editor);
      return true;
    }
  }
  console.log({ mention });
  console.log("insertText", text);
  if (text === "@") {
    console.log("insert Mention");
    if (editor.selection) {
      console.log("collapse selection");
      Transforms.select(editor, editor.selection.anchor);
    }
    Transforms.insertNodes(editor, {
      type: "mention",
      children: [{ text: "" }],
    } as any);
    Transforms.move(editor);
    return true;
  }
}

export interface SuggestionGroup<T extends Mentionable> {
  title: string;
  suggestions: T[];
}

export interface Mentionable {
  title: string;
  href: string;
}

interface MentionComponentProps<T extends Mentionable> {
  mentionable: T;
}

interface PluginOptions<T extends Mentionable> {
  component: ElementType<MentionComponentProps<T>>;
  suggest(search: string): Promise<SuggestionGroup<T>[]>;
  popover?: ElementType<MentionComponentProps<T>>;
}

export const optionsKey = Symbol("mentionPluginContext");

function rawMentionPlugin<T extends Mentionable>(options: PluginOptions<T>) {
  function MentionDraft({
    attributes,
    element,
    children,
  }: PluginElementProps<MentionElement>) {
    const editor = useSlate();
    const search = Node.string(element);
    const [busy, setBusy] = useState(false);
    const [results, setResults] = useState<SuggestionGroup<Mentionable>[]>([]);
    console.log("render draft", search, results);

    useEffect(() => {
      setBusy(true);
      options
        .suggest(search)
        .then(setResults)
        .finally(() => setBusy(false));
    }, [search]);

    const [selected, setSelected] = useState<Mentionable | undefined>();
    const combinedResults = useMemo(
      () => results.flatMap((group) => group.suggestions),
      [results]
    );

    function onKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
      console.log("key", event.key);
      const index = combinedResults.indexOf(selected!);
      switch (event.key) {
        case "Space":
          event.preventDefault();
          Transforms.unwrapNodes(editor);
          Transforms.move(editor);
          break;
        case "ArrowDown":
          event.preventDefault();
          setSelected(combinedResults[(index + 1) % combinedResults.length]);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelected(
            combinedResults[
              (index - 1 + combinedResults.length) % combinedResults.length
            ]
          );
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          insertMention(editor, selected!);
          break;
        case "Escape":
          event.preventDefault();
          Transforms.unwrapNodes(editor);
          Transforms.move(editor);
          break;
      }
    }
    return (
      <span
        {...attributes}
        aria-describedby="mentionable-popover"
        onKeyDown={onKeyDown}
      >
        @{children}
      </span>
    );
  }

  function Mention({
    attributes,
    element,
    children,
  }: PluginElementProps<MentionElement>) {
    console.log("mention");
    const { open, Component } = useContext(MentionContext);

    const { mentionable } = element;

    if (!mentionable) {
      return (
        <MentionDraft attributes={attributes} element={element}>
          {children}
        </MentionDraft>
      );
    }

    return (
      <span
        {...attributes}
        contentEditable={false}
        className="fm-editor-mention"
        aria-describedby="mention-popover"
        onMouseEnter={(ev) => open(mentionable, ev.currentTarget)}
        onMouseLeave={() => open()}
      >
        <Component mentionable={mentionable} />
        {children}
      </span>
    );
  }

  return {
    name: "mention",
    isVoid(element) {
      return Boolean(element.mentionable);
    },
    markableVoid: true,
    isInline: true,
    component: Mention,
    isElement: isMention,
    insertText,
    //[optionsKey]: options,
  } as EditorPluginDefinition<MentionElement>;
}

export const mentionPlugin = memoize(
  rawMentionPlugin,
  ([newOptions], [oldOptions]) =>
    newOptions.component === oldOptions.component &&
    newOptions.suggest === oldOptions.suggest &&
    newOptions.popover === oldOptions.popover
);

export function getMentionPluginOptions(
  plugin?: EditorPluginDefinition<MentionElement>
) {
  const options: PluginOptions<Mentionable> | null =
    (plugin as any)?.[optionsKey] ?? null;
  return options;
}
