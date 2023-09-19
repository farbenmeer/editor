import { ElementType, KeyboardEvent, ReactNode, createElement } from 'react';
import { Descendant, Editor, Node, Path, TextUnit } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { CustomElement } from './custom-types';
import { diagramPlugin } from './diagram/diagram-richtext-support';
import { linkPlugin } from './link/link-richtext-support';
import { mentionPlugin } from './mention/mention-richtext-support';
import { tablePlugin } from './table/table-richtext-support';
import { linebreakPlugin } from './linebreak-richtext-support';
import { imagePlugin } from './image/image-richtext-support';

export const Leaf = ({ attributes, children, leaf }: RenderLeafProps & { leaf: any }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.code) children = <code>{children}</code>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  return <span {...attributes}>{children}</span>;
};

type TagnameMap = {
  [Key in CustomElement['type']]?: string;
};
const tagNames: TagnameMap = {
  'block-quote': 'blockquote',
  'bulleted-list': 'ul',
  'numbered-list': 'ol',
  'heading': 'h2',
  'heading-two': 'h3',
  'list-item': 'li',
};

declare const EditorPluginType: unique symbol;
export interface EditorPlugin<T extends Descendant> {
  [EditorPluginType]?: T;
  isVoid?: boolean;
  markableVoid?: boolean;
  isInline?: boolean;
  isElement(node: Node): node is T;
  component: ElementType<RenderElementProps & { element: any }>;
  deleteBackward?(editor: Editor, unit: TextUnit): boolean | void;
  deleteForward?(editor: Editor, unit: TextUnit): boolean | void;
  insertBreak?(editor: Editor): boolean | void;
  onKeyDown?(editor: Editor, event: KeyboardEvent): boolean | void;
  controls?(editor: Editor, element: T, path: Path): ReactNode;
  insertData?(editor: Editor, data: DataTransfer): boolean | void;
}

export const plugins = [
  mentionPlugin,
  linkPlugin,
  diagramPlugin,
  tablePlugin,
  linebreakPlugin,
  imagePlugin,
] as const;

export function Element({ attributes, children, element }: RenderElementProps) {
  const style = { textAlign: element.align };

  for (const plugin of plugins) {
    if (plugin.isElement(element)) {
      return (
        <plugin.component attributes={attributes} element={element}>
          {children}
        </plugin.component>
      );
    }
  }

  const tag = tagNames[element.type as never] ?? 'p';
  return createElement(tag, { style, ...attributes }, children);
}

export type PluginElement = NonNullable<(typeof plugins)[number][typeof EditorPluginType]>;
