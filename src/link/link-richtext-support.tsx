import { Descendant, Editor, Transforms, Element, Path, BaseEditor } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlate } from 'slate-react';
import { LinkEditDialog } from './link-edit-dialog';
import { MdEdit } from 'react-icons/md';
import { EditorPlugin } from '../richtext-support';

export type LinkElement = { type: 'link'; url: string; children: Descendant[] };

export function isLink(element: Descendant): element is LinkElement {
  return 'type' in element && element.type === 'link';
}

export function withLinks<T extends BaseEditor>(editor: T): T {
  const { isInline } = editor;

  editor.isInline = element => isLink(element) || isInline(element);

  return editor;
}

export function setLink(editor: Editor, node: LinkElement | null, url: string, path?: Path) {
  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    split: true,
    at: path,
  });
  if (node) {
    Transforms.setNodes(editor, { url }, { at: path });
  } else {
    Transforms.wrapNodes(editor, { type: 'link', url, children: [] }, { at: path, split: true });
  }
}

export function removeLink(editor: Editor, path?: Path) {
  Transforms.unwrapNodes(editor, {
    at: path,
    match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    split: true,
  });
}

export function Link({
  children,
  element,
  attributes,
}: RenderElementProps & { element: LinkElement }) {
  const isReadonly = useReadOnly();
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);

  if (isReadonly) {
    return (
      <a {...attributes} href={element.url} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <span {...attributes} className="inline-flex gap-1">
      <a href={element.url} className="underline" target="_blank" rel="noreferrer">
        {children}
      </a>
      <LinkEditDialog
        url={element.url}
        onSave={url => setLink(editor, element, url, path)}
        onRemove={() => removeLink(editor, path)}>
        <button>
          <MdEdit />
        </button>
      </LinkEditDialog>
    </span>
  );
}

export const linkPlugin: EditorPlugin<LinkElement> = {
  isElement: isLink,
  component: Link,
  isInline: true,
};
