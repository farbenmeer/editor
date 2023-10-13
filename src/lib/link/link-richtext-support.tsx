import {
  Descendant,
  Editor,
  Transforms,
  Node,
  Element,
  Path,
  BaseEditor,
} from "slate";
import {
  ReactEditor,
  RenderElementProps,
  useReadOnly,
  useSlate,
} from "slate-react";
import { LinkEditDialog } from "./link-edit-dialog";
import { MdEdit } from "react-icons/md";
import {
  EditorPlugin,
  EditorPluginDefinition,
  PluginElementProps,
} from "../richtext-support";

export type LinkElement = { type: "link"; url: string; children: Descendant[] };

export function isLink(node: Node | LinkElement): node is LinkElement {
  return "type" in node && node.type === "link";
}

export function setLink(
  editor: Editor,
  node: LinkElement | null,
  url: string,
  path?: Path
) {
  Transforms.unwrapNodes(editor, {
    match: isLink,
    split: true,
    at: path,
  });
  if (node) {
    Transforms.setNodes(editor, { url } as any, { at: path });
  } else {
    Transforms.wrapNodes(editor, { type: "link", url, children: [] } as any, {
      at: path,
      split: true,
    });
  }
}

export function removeLink(editor: Editor, path?: Path) {
  Transforms.unwrapNodes(editor, {
    at: path,
    match: isLink,
    split: true,
  });
}

export function Link({
  children,
  element,
  attributes,
}: PluginElementProps<LinkElement>) {
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
      <a
        href={element.url}
        className="underline"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
      <LinkEditDialog
        url={element.url}
        onSave={(url) => setLink(editor, element, url, path)}
        onRemove={() => removeLink(editor, path)}
      >
        <button>
          <MdEdit />
        </button>
      </LinkEditDialog>
    </span>
  );
}

const linkPluginDefinition: EditorPluginDefinition<LinkElement> = {
  name: "link",
  isElement: isLink,
  component: Link,
  isInline: true,
};

export const linkPlugin: EditorPlugin<LinkElement> = () => linkPluginDefinition;
