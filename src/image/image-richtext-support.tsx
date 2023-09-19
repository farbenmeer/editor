'use client';
import { Editor, Node, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlateStatic } from 'slate-react';
import { S3Image } from 'src/components/S3Image';
import { EditorPlugin } from '../richtext-support';
import { ImageMeta } from 'src/lib/image';

interface ImageData extends ImageMeta {
  objectKey: string;
}

export type ImageElement = {
  type: 'image';
  children: [{ text: '' }];
  data?: ImageData;
};

function isImage(node: Node): node is ImageElement {
  return !Editor.isEditor(node) && 'type' in node && node.type === 'image';
}

function Image({ children, element, attributes }: RenderElementProps & { element: ImageElement }) {
  const readOnly = useReadOnly();
  const editor = useSlateStatic();
  const location = ReactEditor.findPath(editor, element);

  async function onChange(objectKey: string, meta: ImageMeta) {
    Transforms.setNodes(
      editor,
      {
        type: 'image',
        children: [{ text: '' }],
        data: { objectKey, ...meta },
      },
      { at: location },
    );
    Transforms.move(editor);
  }

  return (
    <div
      className="w-full relative min-h-[5rem]"
      style={{
        aspectRatio: element.data ? element.data.width / element.data.height : undefined,
        maxWidth: element.data ? `${element.data.width}px` : undefined,
      }}
      {...attributes}>
      <S3Image
        objectKey={element.data?.objectKey ?? null}
        src={null}
        editable={!readOnly}
        width={element.data?.width as number}
        height={element.data?.height as number}
        blurDataURL={element.data?.blurDataURL}
        onChange={onChange}
      />
      {children}
    </div>
  );
}

export function insertImage(editor: Editor) {
  if (editor.selection) {
    editor.select(editor.selection.anchor);
  }

  Transforms.insertNodes(editor, {
    type: 'image',
    children: [{ text: '' }],
  });
  Transforms.move(editor);
}

export const imagePlugin: EditorPlugin<ImageElement> = {
  isElement: isImage,
  component: Image,
  isVoid: true,
};
