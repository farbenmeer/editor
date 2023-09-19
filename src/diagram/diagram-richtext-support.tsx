import localFont from 'next/font/local';
import { Descendant, Editor, Location, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useReadOnly, useSlate } from 'slate-react';
import { EditorPlugin } from '../richtext-support';
import { DiagramEditor } from './diagram-editor';
import { DiagramViewer } from './diagram-viewer';
import { DiagramData } from './diagrams';
import { renderDiagramControls } from './diagram-controls';

const univers = localFont({
  src: [
    { path: '../../../../app/font/univers-lt-std-55-roman.otf' },
    { path: '../../../../app/font/univers-lt-std-65-bold.otf', weight: 'bold' },
  ],
});

export type DiagramElement = {
  type: 'diagram';
  children: [{ text: '' }];
} & DiagramData;

function isDiagram(element: Descendant): element is DiagramElement {
  return 'type' in element && element.type === 'diagram';
}

function Diagram({
  children,
  element,
  attributes,
}: RenderElementProps & { element: DiagramElement }) {
  const isReadonly = useReadOnly();
  const editor = useSlate();
  const location = ReactEditor.findPath(editor, element);

  if (isReadonly) {
    return (
      <div className={univers.className} {...attributes}>
        <DiagramViewer diagram={element} />
        {children}
      </div>
    );
  }

  return (
    <div className={univers.className} {...attributes}>
      <DiagramEditor
        diagram={element}
        onChange={diagram =>
          diagram ? updateDiagram(editor, location, diagram) : removeDiagram(editor, location)
        }
      />
      {children}
    </div>
  );
}

export const insertDiagram = (editor: Editor, diagram: DiagramData) => {
  if (editor.selection) {
    editor.select(editor.selection.anchor);
  }
  Transforms.insertNodes(editor, {
    ...diagram,
    type: 'diagram',
    children: [{ text: '' }],
  } as DiagramElement);
  Transforms.move(editor);
};

export function updateDiagram(editor: Editor, location: Location, diagram: DiagramData) {
  Transforms.setNodes(
    editor,
    {
      ...diagram,
      type: 'diagram',
      children: [{ text: '' }],
    },
    { at: location },
  );
}

export function removeDiagram(editor: Editor, location: Location) {
  Transforms.removeNodes(editor, { at: location });
  Transforms.move(editor);
}

export const diagramPlugin: EditorPlugin<DiagramElement> = {
  isElement: isDiagram,
  component: Diagram,
  isVoid: true,
  controls: renderDiagramControls,
};
