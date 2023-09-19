import { MdDelete, MdUpload } from 'react-icons/md';
import { Editor, Path } from 'slate';
import styles from 'src/components/form/richtext/RichtextControls.module.css';
import { RichtextControlButton, RichtextControlGroup } from '../RichtextControls';
import { DiagramElement, removeDiagram, updateDiagram } from './diagram-richtext-support';
import { DiagramUploadDialog } from './diagram-upload-dialog';

export function renderDiagramControls(editor: Editor, _element: DiagramElement, path: Path) {
  return (
    <RichtextControlGroup>
      <DiagramUploadDialog onUpload={svg => updateDiagram(editor, path, { svg, links: {} })}>
        <button title="Digramm austauschen" className={styles.button}>
          <MdUpload />
        </button>
      </DiagramUploadDialog>
      <RichtextControlButton title="Diagramm entfernen" onClick={() => removeDiagram(editor, path)}>
        <MdDelete />
      </RichtextControlButton>
    </RichtextControlGroup>
  );
}
