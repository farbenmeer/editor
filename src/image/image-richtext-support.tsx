import { MdImage } from "react-icons/md";
import { Editor, Node, Transforms } from "slate";
import { ReactEditor, useReadOnly, useSlateStatic } from "slate-react";
import { EditorPlugin, PluginElementProps } from "../lib/richtext-support";
import { GetObjectUrl, PutObjectUrl, S3Image } from "./S3Image";
import { ImageMeta } from "./meta";
import memoize from "memoize-one";

interface ImageData extends ImageMeta {
  objectKey: string;
}

export type ImageElement = {
  type: "image";
  children: [{ text: "" }];
  data?: ImageData;
};

function isImage(node: Node | ImageElement): node is ImageElement {
  return !Editor.isEditor(node) && "type" in node && node.type === "image";
}

export function insertImage(editor: Editor) {
  if (editor.selection) {
    editor.select(editor.selection.anchor);
  }

  Transforms.insertNodes(editor, {
    type: "image",
    children: [{ text: "" }],
  } as any);
  Transforms.move(editor);
}

function ImageInsertButton() {
  const editor = useSlateStatic();

  return (
    <button
      className="fm-editor-controls-button"
      onMouseDown={(event) => {
        event.preventDefault();
        insertImage(editor);
      }}
    >
      <MdImage />
    </button>
  );
}

interface PluginOptions {
  getObjectUrl: GetObjectUrl;
  putObjectUrl: PutObjectUrl;
}

export const imagePlugin: EditorPlugin<ImageElement, PluginOptions> = memoize(
  ({ getObjectUrl, putObjectUrl }) => {
    function Image({
      children,
      element,
      attributes,
    }: PluginElementProps<ImageElement>) {
      const readOnly = useReadOnly();
      const editor = useSlateStatic();
      const location = ReactEditor.findPath(editor, element);

      async function onChange(objectKey: string, meta: ImageMeta) {
        Transforms.setNodes<any>(
          editor,
          {
            type: "image",
            children: [{ text: "" }],
            data: { objectKey, ...meta },
          },
          { at: location }
        );
        Transforms.move(editor);
      }

      return (
        <div
          className="fm-editor-image"
          style={{
            aspectRatio: element.data
              ? element.data.width / element.data.height
              : undefined,
            maxWidth: element.data ? `${element.data.width}px` : undefined,
          }}
          {...attributes}
        >
          <S3Image
            objectKey={element.data?.objectKey ?? null}
            src={null}
            editable={!readOnly}
            width={element.data?.width as number}
            height={element.data?.height as number}
            blurDataURL={element.data?.blurDataURL}
            onChange={onChange}
            getObjectUrl={getObjectUrl}
            putObjectUrl={putObjectUrl}
          />
          {children}
        </div>
      );
    }

    return {
      name: "image",
      isElement: isImage,
      component: Image,
      button: ImageInsertButton,
      isVoid: true,
    };
  },
  ([newOptions]: PluginOptions[], [lastOptions]: PluginOptions[]) =>
    newOptions.getObjectUrl === lastOptions.getObjectUrl &&
    newOptions.putObjectUrl === lastOptions.putObjectUrl
);
