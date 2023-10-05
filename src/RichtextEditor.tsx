import clsx from "clsx";
import { KeyboardEvent, useMemo } from "react";
import { Descendant, TextUnit, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { EditableProps } from "slate-react/dist/components/editable";
import { RichtextControls } from "./RichtextControls";
import { linebreakPlugin } from "./linebreak-richtext-support";
import {
  MentionPopoverProvider,
  useMentionableTypeahead,
} from "./mention/mention-richtext-support";
import { MentionableByType } from "./mention/mentionables";
import {
  EditorPluginDefinition,
  Element,
  Leaf,
  PluginsContext,
} from "./richtext-support";

export interface RichtextEditorProps {
  config?: EditableProps;
  value?: Descendant[];
  noPad?: boolean;
  readOnly?: boolean;
  placeholder?: string;

  plugins: EditorPluginDefinition<any>[];

  controls?: "minimal" | "full";

  suggest?(search: string): Promise<MentionableByType>;
  onChange?(value: Descendant[]): void;
}

export function RichtextEditor({
  suggest,
  value = [{ text: "" }],
  config = {},
  noPad,
  readOnly,
  controls = "full",
  placeholder,
  onChange,
  plugins,
}: RichtextEditorProps) {
  const editor = useMemo(() => {
    let editor = createEditor();
    editor = withHistory(editor);
    editor = withReact(editor);

    const {
      isVoid,
      markableVoid,
      isInline,
      deleteForward,
      deleteBackward,
      insertBreak,
      insertData,
    } = editor;

    editor.isVoid = function isVoidWithPlugins(element) {
      for (const plugin of plugins) {
        if (plugin.isVoid && plugin.isElement(element)) return true;
      }
      return isVoid(element);
    };

    editor.markableVoid = function markableVoidWithPlugiins(element) {
      for (const plugin of plugins) {
        if (plugin.markableVoid && plugin.isElement(element)) return true;
      }
      return markableVoid(element);
    };

    editor.isInline = function isInlineWithPlugins(element) {
      for (const plugin of plugins) {
        if (plugin.isInline && plugin.isElement(element)) return true;
      }
      return isInline(element);
    };

    editor.insertData = function insertDataWithPlugins(data) {
      for (const plugin of plugins) {
        if (plugin.insertData?.(editor, data)) {
          return;
        }
      }
      insertData(data);
    };

    editor.deleteBackward = function deleteBackwardWithPlugins(unit: TextUnit) {
      for (const plugin of plugins) {
        if (plugin.deleteBackward?.(editor, unit)) {
          return;
        }
      }
      deleteBackward(unit);
    };

    editor.deleteForward = function deleteForwardWithPlugins(unit: TextUnit) {
      for (const plugin of plugins) {
        if (plugin.deleteForward?.(editor, unit)) {
          return;
        }
      }
      deleteForward(unit);
    };

    editor.insertBreak = function insertBreakWithPlugins() {
      for (const plugin of plugins) {
        if (plugin.insertBreak?.(editor)) {
          return;
        }
      }
      insertBreak();
    };

    return editor;
  }, []);

  function onKeyDown(event: KeyboardEvent) {
    for (const plugin of plugins) {
      if (plugin.onKeyDown?.(editor, event)) {
        return;
      }
    }
  }

  const {
    popover,
    onKeyDown: onKeyDownWrapped,
    onChange: onChangeWrapped,
  } = useMentionableTypeahead({ editor, suggest, onChange, onKeyDown });

  const memoizedPlugins = useMemo(() => [linebreakPlugin, ...plugins], plugins);

  return (
    <Slate editor={editor} initialValue={value} onChange={onChangeWrapped}>
      <PluginsContext.Provider value={memoizedPlugins}>
        <MentionPopoverProvider>
          {!readOnly && <RichtextControls variant={controls} />}
          <Editable
            {...config}
            renderElement={Element}
            renderLeaf={Leaf}
            readOnly={readOnly}
            onKeyDown={readOnly ? undefined : onKeyDownWrapped}
            className={clsx("fm-editor", noPad && "fm-editor-nopad")}
            placeholder={placeholder}
          />
          {popover}
        </MentionPopoverProvider>
      </PluginsContext.Provider>
    </Slate>
  );
}
