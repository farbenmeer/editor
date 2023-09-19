import { KeyboardEvent } from 'react';
import { Editor, Node, Transforms } from 'slate';
import { RenderElementProps } from 'slate-react';
import { EditorPlugin } from './richtext-support';

export type LinebreakElement = { type: 'line-break'; children: [{ text: '' }] };

function isLinebreak(node: Node): node is LinebreakElement {
  return !Editor.isEditor(node) && 'type' in node && node.type === 'line-break';
}

function Linebreak({ children, attributes }: RenderElementProps) {
  return (
    <>
      <br {...attributes} />
      {children}
    </>
  );
}

function onKeyDown(editor: Editor, event: KeyboardEvent) {
  if (event.key === 'Enter' && event.shiftKey) {
    event.preventDefault();
    Editor.insertNode(editor, { type: 'line-break', children: [{ text: '' }] });
    Transforms.move(editor);
    return true;
  }
}

export const linebreakPlugin: EditorPlugin<LinebreakElement> = {
  isElement: isLinebreak,
  component: Linebreak,
  isInline: true,
  isVoid: true,
  onKeyDown,
};
