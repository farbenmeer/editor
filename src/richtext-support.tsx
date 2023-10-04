import {
  ElementType,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  createContext,
  createElement,
  useContext,
} from "react";
import { Descendant, Editor, Node, Path, TextUnit } from "slate";
import { RenderElementProps, RenderLeafProps } from "slate-react";
import { CustomElement, EmptyText } from "./custom-types";

export const Leaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps & { leaf: any }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.code) children = <code>{children}</code>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  return <span {...attributes}>{children}</span>;
};

type TagnameMap = {
  [Key in CustomElement["type"]]?: string;
};
const tagNames: TagnameMap = {
  "block-quote": "blockquote",
  "bulleted-list": "ul",
  "numbered-list": "ol",
  heading: "h2",
  "heading-two": "h3",
  "list-item": "li",
};

export type PluginElementProps<T> = Omit<RenderElementProps, "element"> & {
  element: T & Node;
};

declare const EditorPluginType: unique symbol;
export interface EditorPluginDefinition<
  T extends { type: string; children: Descendant[] }
> {
  [EditorPluginType]?: T;
  name: string;
  isVoid?: boolean;
  markableVoid?: boolean;
  isInline?: boolean;
  isElement(node: Node | T): node is T;
  component: ElementType<PluginElementProps<T>>;
  deleteBackward?(editor: Editor, unit: TextUnit): boolean | void;
  deleteForward?(editor: Editor, unit: TextUnit): boolean | void;
  insertBreak?(editor: Editor): boolean | void;
  onKeyDown?(editor: Editor, event: KeyboardEvent): boolean | void;
  controls?(editor: Editor, element: T, path: Path): ReactNode;
  button?(): ReactNode;
  insertData?(editor: Editor, data: DataTransfer): boolean | void;
  deps?: any[];
}

export interface EditorPlugin<
  T extends { type: string; children: Descendant[] },
  O extends object | undefined = undefined
> {
  (options: O): EditorPluginDefinition<T>;
}

export const PluginsContext = createContext<EditorPluginDefinition<any>[]>([]);

export function Element({ attributes, children, element }: RenderElementProps) {
  const style = { textAlign: element.align };
  const plugins = useContext(PluginsContext);

  for (const plugin of plugins) {
    if (plugin.isElement(element)) {
      return (
        <plugin.component attributes={attributes} element={element}>
          {children}
        </plugin.component>
      );
    }
  }

  const tag = tagNames[element.type as never] ?? "p";
  return createElement(tag, { style, ...attributes }, children);
}
