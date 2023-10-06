import { KeyboardEvent } from "react";
import { Editor, Node, Transforms } from "slate";
import { EditorPluginDefinition, PluginElementProps } from "./richtext-support";

export type LinebreakElement = { type: "line-break"; children: [{ text: "" }] };

function isLinebreak(node: Node | LinebreakElement): node is LinebreakElement {
  return !Editor.isEditor(node) && "type" in node && node.type === "line-break";
}

function Linebreak({
  children,
  attributes,
}: PluginElementProps<LinebreakElement>) {
  return (
    <>
      <br {...attributes} />
      {children}
    </>
  );
}

function onKeyDown(editor: Editor, event: KeyboardEvent) {
  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault();
    Editor.insertNode(editor, {
      type: "line-break",
      children: [{ text: "" }],
    } as any);
    Transforms.move(editor);
    return true;
  }
}

export const linebreakPlugin: EditorPluginDefinition<LinebreakElement> = {
  name: "linebreak",
  isElement: isLinebreak,
  component: Linebreak,
  isInline: true,
  isVoid: true,
  onKeyDown,
};
