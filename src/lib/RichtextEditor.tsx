import clsx from "clsx";
import { CSSProperties, KeyboardEvent, useMemo, useRef } from "react";
import { Descendant, TextUnit, createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import { EditableProps } from "slate-react/dist/components/editable";
import { RichtextControls } from "./RichtextControls";
import { linebreakPlugin } from "./linebreak-richtext-support";
import {
  MentionPopoverProvider,
  getMentionPluginOptions,
  useMentionableTypeahead,
} from "./mention/mention-richtext-support";
import {
  EditorPluginDefinition,
  Element,
  Leaf,
  PluginsContext,
} from "./richtext-support";
import { useRouter } from "next/navigation";
import { TextInsertTextOptions } from "slate/dist/interfaces/transforms/text";

export interface RichtextEditorProps {
  config?: EditableProps;
  defaultValue?: Descendant[];
  noPad?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;

  plugins?: EditorPluginDefinition<any>[];

  controls?: "minimal" | "full";

  onChange?(value: Descendant[]): void;
}

export function RichtextEditor({
  defaultValue = [{ type: "paragraph", children: [{ text: "" }] }],
  config = {},
  style,
  className,
  noPad,
  readOnly,
  controls = "full",
  placeholder,
  onChange,
  plugins = [],
}: RichtextEditorProps) {
  const previousPluginsLength = useRef(plugins.length);
  if (plugins.length !== previousPluginsLength.current) {
    window.location.reload();
    return null;
  }
  const memoizedPlugins = useMemo(() => [linebreakPlugin, ...plugins], plugins);

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
      insertText,
    } = editor;

    editor.isVoid = function isVoidWithPlugins(element) {
      for (const plugin of memoizedPlugins) {
        if (plugin.isElement(element)) {
          if (typeof plugin.isVoid === "function") {
            return plugin.isVoid(element as any);
          } else if (typeof plugin.isVoid === "boolean") {
            return plugin.isVoid;
          }
        }
      }
      return isVoid(element);
    };

    editor.markableVoid = function markableVoidWithPlugiins(element) {
      for (const plugin of memoizedPlugins) {
        if (plugin.markableVoid && plugin.isElement(element)) return true;
      }
      return markableVoid(element);
    };

    editor.isInline = function isInlineWithPlugins(element) {
      for (const plugin of memoizedPlugins) {
        if (plugin.isInline && plugin.isElement(element)) return true;
      }
      return isInline(element);
    };

    editor.insertData = function insertDataWithPlugins(data) {
      for (const plugin of memoizedPlugins) {
        if (plugin.insertData?.(editor, data)) {
          return;
        }
      }
      insertData(data);
    };

    editor.deleteBackward = function deleteBackwardWithPlugins(unit: TextUnit) {
      for (const plugin of memoizedPlugins) {
        if (plugin.deleteBackward?.(editor, unit)) {
          return;
        }
      }
      deleteBackward(unit);
    };

    editor.deleteForward = function deleteForwardWithPlugins(unit: TextUnit) {
      for (const plugin of memoizedPlugins) {
        if (plugin.deleteForward?.(editor, unit)) {
          return;
        }
      }
      deleteForward(unit);
    };

    editor.insertBreak = function insertBreakWithPlugins() {
      for (const plugin of memoizedPlugins) {
        if (plugin.insertBreak?.(editor)) {
          return;
        }
      }
      insertBreak();
    };

    editor.insertText = function insertTextWithPlugins(
      text: string,
      options?: TextInsertTextOptions | undefined
    ) {
      for (const plugin of memoizedPlugins) {
        if (plugin.insertText?.(editor, text, options)) {
          return;
        }
      }
      console.log("base insertText");
      insertText(text, options);
    };

    return editor;
  }, [memoizedPlugins]);

  function onKeyDown(event: KeyboardEvent) {
    for (const plugin of memoizedPlugins) {
      if (plugin.onKeyDown?.(editor, event)) {
        return;
      }
    }
  }

  return (
    <Slate editor={editor} initialValue={defaultValue} onChange={onChange}>
      <PluginsContext.Provider value={memoizedPlugins}>
        {!readOnly && <RichtextControls variant={controls} />}
        <Editable
          {...config}
          renderElement={Element}
          renderLeaf={Leaf}
          readOnly={readOnly}
          onKeyDown={readOnly ? undefined : onKeyDown}
          className={clsx("fm-editor", noPad && "fm-editor-nopad", className)}
          style={style}
          placeholder={placeholder}
        />
      </PluginsContext.Provider>
    </Slate>
  );
}
