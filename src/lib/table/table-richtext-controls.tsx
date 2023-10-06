'use client';

import {
  RiDeleteColumn,
  RiDeleteRow,
  RiInsertColumnRight,
  RiInsertRowBottom,
} from 'react-icons/ri';
import { Editor } from 'slate';
import { RichtextControlButton, RichtextControlGroup } from '../RichtextControls';
import { deleteColumn, deleteRow, insertColumn, insertRow } from './table-richtext-support';

export function renderTableRichtextControls(editor: Editor) {
  return (
    <RichtextControlGroup>
      <RichtextControlButton onClick={() => insertColumn(editor)}>
        <RiInsertColumnRight />
      </RichtextControlButton>
      <RichtextControlButton onClick={() => deleteColumn(editor)}>
        <RiDeleteColumn />
      </RichtextControlButton>
      <RichtextControlButton onClick={() => insertRow(editor)}>
        <RiInsertRowBottom />
      </RichtextControlButton>
      <RichtextControlButton onClick={() => deleteRow(editor)}>
        <RiDeleteRow />
      </RichtextControlButton>
    </RichtextControlGroup>
  );
}
