import clsx from "clsx";
import { ReactNode, cloneElement, forwardRef, useContext } from "react";
import { LuHeading1, LuHeading2 } from "react-icons/lu";
import {
  MdFormatAlignCenter,
  MdFormatAlignJustify,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdFormatUnderlined,
  MdLink,
} from "react-icons/md";
import { Editor, Element, Transforms } from "slate";
import { useFocused, useSlate } from "slate-react";
import {
  CustomEditor,
  CustomElement,
  CustomText,
  EmptyText,
} from "./custom-types";
import { LinkEditDialog } from "./link/link-edit-dialog";
import {
  LinkElement,
  isLink,
  removeLink,
  setLink,
} from "./link/link-richtext-support";
import { PluginsContext } from "./richtext-support";

interface RichtextControlButtonProps {
  onClick(): void;
  children: ReactNode;
  className?: string;
  title?: string;
}

export const RichtextControlButton = forwardRef<
  HTMLButtonElement,
  RichtextControlButtonProps
>(function RichtextControlButton({ title, className, onClick, children }, ref) {
  return (
    <button
      ref={ref}
      title={title}
      className={clsx("fm-editor-controls-button", className)}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
});

export function RichtextMarkButton({
  children,
  disabled,
  mark,
}: {
  children: any;
  disabled?: boolean;
  mark: Mark;
}) {
  const editor = useSlate();
  const active = isMarkActive(editor, mark);

  return (
    <button
      className={clsx(
        "fm-editor-controls-button",
        active && "fm-editor-controls-button-active"
      )}
      disabled={disabled}
      onMouseDown={(ev) => {
        ev.preventDefault();
        toggleMark(editor, mark);
      }}
    >
      {children}
    </button>
  );
}

export function RichtextBlockButton<
  BlockType extends keyof CustomElement,
  Format extends CustomElement[BlockType]
>({
  blockType,
  format,
  children,
  disabled,
}: {
  blockType: BlockType;
  format: Format;
  children: any;
  disabled?: boolean;
}) {
  const editor = useSlate();
  const active = isBlockActive(editor, blockType, format);

  return (
    <button
      className={clsx(
        "fm-editor-controls-button",
        active && "fm-editor-controls-button-active"
      )}
      disabled={disabled}
      onMouseDown={(ev) => {
        ev.preventDefault();
        toggleBlock(editor, blockType, format as never);
      }}
    >
      {children}
    </button>
  );
}

export function RichtextControlGroup({ children }: { children: any }) {
  return <div className="fm-editor-controls-group">{children}</div>;
}

type Mark = keyof Omit<CustomText & EmptyText, "text">;

function isMarkActive(editor: CustomEditor, mark: Mark) {
  return Editor.marks(editor)?.[mark as never] === true;
}

function toggleMark(editor: CustomEditor, mark: Mark) {
  if (isMarkActive(editor, mark)) Editor.removeMark(editor, mark);
  else Editor.addMark(editor, mark, true);
}

function isBlockActive<
  BlockType extends keyof CustomElement,
  Format extends CustomElement[BlockType]
>(editor: CustomEditor, blockType: BlockType, format: Format) {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n[blockType] === format,
    })
  );
  return !!match;
}

function isList(format: string) {
  return /-list$/.test(format);
}

function isAlign(format: string) {
  return /^(?:left|center|right|justify)$/.test(format);
}

function toggleBlock<
  BlockType extends keyof CustomElement,
  Format extends CustomElement[BlockType] & string
>(editor: CustomEditor, blockType: BlockType, format: Format) {
  const active = isBlockActive(editor, blockType, format);
  const list = isList(format);
  const align = isAlign(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && Element.isElement(n) && isList(n.type) && !align,
    split: true,
  });
  let newProperties: Partial<Element>;
  if (align) {
    newProperties = { align: active ? undefined : format } as never;
  } else {
    newProperties = {
      type: active ? "paragraph" : list ? "list-item" : format,
    } as never;
  }
  Transforms.setNodes<Element>(editor, newProperties);

  if (!active && list)
    Transforms.wrapNodes(editor, { type: format, children: [] } as never);
}

interface Props {
  variant: "full" | "minimal";
}

export function RichtextControls({ variant }: Props) {
  const isFocused = useFocused();
  const editor = useSlate();
  const plugins = useContext(PluginsContext);

  let pluginControls: ReactNode | null = null;
  let pluginButtons: ReactNode[] = [];

  for (const plugin of plugins) {
    if (plugin.button) {
      pluginButtons.push(<plugin.button key={plugin.name} />);
    }

    const [node] = Editor.nodes(editor, { match: plugin.isElement });

    if (node && plugin.controls) {
      const [element, path] = node;
      pluginControls = plugin.controls(editor, element as any, path);
    }
  }

  return (
    <div
      className={clsx(
        "fm-editor-controls",
        isFocused && "fm-editor-controls-visible"
      )}
    >
      <RichtextControlGroup>
        <RichtextMarkButton mark="bold">
          <MdFormatBold />
        </RichtextMarkButton>
        <RichtextMarkButton mark="italic">
          <MdFormatItalic />
        </RichtextMarkButton>
        <RichtextMarkButton mark="underline">
          <MdFormatUnderlined />
        </RichtextMarkButton>
        <EditLinkButton />
      </RichtextControlGroup>
      {!pluginControls && (
        <RichtextControlGroup>
          <RichtextBlockButton blockType="type" format="heading">
            <LuHeading1 />
          </RichtextBlockButton>
          {variant === "full" && (
            <RichtextBlockButton blockType="type" format="heading-two">
              <LuHeading2 />
            </RichtextBlockButton>
          )}
          {variant === "full" && (
            <RichtextBlockButton blockType="type" format="block-quote">
              <MdFormatQuote />
            </RichtextBlockButton>
          )}
          <RichtextBlockButton blockType="type" format="bulleted-list">
            <MdFormatListBulleted />
          </RichtextBlockButton>
          <RichtextBlockButton blockType="type" format="numbered-list">
            <MdFormatListNumbered />
          </RichtextBlockButton>
        </RichtextControlGroup>
      )}
      {variant === "full" && !pluginControls && (
        <RichtextControlGroup>
          <RichtextBlockButton blockType="align" format="left">
            <MdFormatAlignLeft />
          </RichtextBlockButton>
          <RichtextBlockButton blockType="align" format="center">
            <MdFormatAlignCenter />
          </RichtextBlockButton>
          <RichtextBlockButton blockType="align" format="right">
            <MdFormatAlignRight />
          </RichtextBlockButton>
          <RichtextBlockButton blockType="align" format="justify">
            <MdFormatAlignJustify />
          </RichtextBlockButton>
        </RichtextControlGroup>
      )}
      {pluginControls}
      {variant === "full" && (
        <RichtextControlGroup>{pluginButtons}</RichtextControlGroup>
      )}
    </div>
  );
}

function getActiveLink(editor: Editor): LinkElement | null {
  const { selection } = editor;
  if (!selection) return null;

  const [match] = Array.from(
    Editor.nodes<any>(editor, {
      at: Editor.unhangRange(editor, selection),
      match: isLink,
    })
  );

  if (!match) return null;

  const [node] = match;
  return node;
}

function EditLinkButton() {
  const editor = useSlate();
  const activeLink = getActiveLink(editor);

  return (
    <LinkEditDialog
      url={activeLink?.url}
      onSave={(url) => setLink(editor, activeLink, url)}
      onRemove={() => removeLink(editor)}
    >
      <button
        className="fm-editor-controls-button"
        onMouseDown={(event) => event.preventDefault()}
      >
        <MdLink />
      </button>
    </LinkEditDialog>
  );
}
