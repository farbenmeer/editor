import { KeyboardEvent } from "react";
import {
  Descendant,
  Editor,
  Element,
  Node,
  NodeEntry,
  Path,
  Point,
  Range,
  Transforms,
} from "slate";
import { ReactEditor, RenderElementProps } from "slate-react";
import { EditorPluginDefinition } from "../richtext-support";
import { renderTableRichtextControls } from "./table-richtext-controls";
import styles from "./table.module.css";

export type TableCellElement = { type: "table-cell"; children: Descendant[] };

type TableRowElement = { type: "table-row"; children: TableCellElement[] };

type TableTableElement = { type: "table"; children: TableRowElement[] };

export type TableElement =
  | TableTableElement
  | TableRowElement
  | TableCellElement;

export function isTableElement(element: Node): element is TableElement {
  return (
    !Editor.isEditor(element) &&
    "type" in element &&
    ["table", "table-row", "table-cell"].includes(element.type)
  );
}

function isTable(element: Node): element is TableTableElement {
  return (
    !Editor.isEditor(element) && "type" in element && element.type === "table"
  );
}

function isTableRow(element: Node): element is TableRowElement {
  return (
    !Editor.isEditor(element) &&
    "type" in element &&
    element.type === "table-row"
  );
}

export function isTableCell(element: Node): element is TableCellElement {
  return (
    !Editor.isEditor(element) &&
    "type" in element &&
    element.type === "table-cell"
  );
}

function Table({
  element,
  attributes,
  children,
}: RenderElementProps & { element: TableElement }) {
  switch (element.type) {
    case "table": {
      return (
        <div className="px-2 w-full" {...attributes}>
          <table className="w-full">
            <tbody>{children}</tbody>
          </table>
        </div>
      );
    }
    case "table-row":
      return (
        <tr className={styles.row} {...attributes}>
          {children}
        </tr>
      );

    case "table-cell":
      return (
        <td className={styles.cell} {...attributes}>
          {children}
        </td>
      );
  }
}

function deleteBackward(editor: Editor) {
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [cell] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "table-cell",
    });

    if (cell) {
      const [, cellPath] = cell;
      const start = Editor.start(editor, cellPath);

      if (Point.equals(selection.anchor, start)) {
        return true;
      }
    }
  }
}

function deleteForward(editor: Editor) {
  const { selection } = editor;

  if (selection && Range.isCollapsed(selection)) {
    const [cell] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === "table-cell",
    });

    if (cell) {
      const [, cellPath] = cell;
      const end = Editor.end(editor, cellPath);

      if (Point.equals(selection.anchor, end)) {
        return true;
      }
    }
  }
}

function insertBreak(editor: Editor) {
  const [cellNode] = Editor.nodes<TableCellElement>(editor, {
    match: isTableCell,
  });

  if (!cellNode) {
    return false;
  }

  const [cell, cellPath] = cellNode;
  const cellIndex = cellPath[cellPath.length - 1];
  const rowPath = Path.parent(cellPath);

  try {
    const sibling = [...Path.next(rowPath), cellIndex];
    Editor.nodes(editor, { at: sibling, match: isTableCell });
    Transforms.select(editor, sibling);
  } catch {
    insertRow(editor, cell);
  }

  return true;
}

function onKeyDown(editor: Editor, event: KeyboardEvent) {
  if (event.key === "Tab") {
    const { selection } = editor;

    if (!selection) return;

    const [cell] = Editor.nodes<TableCellElement>(editor, {
      match: (n) => !Editor.isEditor(n) && isTableCell(n),
    });
    const [table] = Editor.nodes<TableElement>(editor, {
      match: (n) => !Editor.isEditor(n) && isTable(n),
    });

    if (cell && table) {
      event.preventDefault();
      const [node, path]: [TableCellElement, Path] = cell;
      if (event.shiftKey) {
        try {
          const sibling = Path.previous(path);
          Editor.nodes(editor, { at: sibling, match: isTableCell });
          Transforms.select(editor, sibling);
          return;
        } catch {
          return;
        }
      }

      try {
        const sibling = Path.next(path);
        Editor.nodes(editor, {
          at: sibling,
          match: (n) => !Editor.isEditor(n) && isTableCell(n),
        });
        Transforms.select(editor, sibling);
      } catch {
        insertColumn(editor, node);
      }
      return true;
    }
  }
}

const emptyCell = (): TableCellElement => ({
  type: "table-cell",
  children: [{ text: "" }],
});
const emptyRow = (n: number): TableRowElement => ({
  type: "table-row",
  children: Array.from({ length: n }).map(() => emptyCell()),
});

export function insertTable(editor: Editor) {
  if (editor.selection) {
    const [activeTableNode] = Editor.nodes(editor, { match: isTable });
    if (activeTableNode) {
      const [, path] = activeTableNode;
      editor.select(Path.next(path));
    } else {
      editor.select(editor.selection.anchor);
    }
  }

  const table: TableElement = {
    type: "table",
    children: [emptyRow(2), emptyRow(2)],
  };

  Transforms.insertNodes(editor, table);
  Transforms.move(editor);
}

function findCell(
  editor: Editor,
  element?: TableCellElement
): NodeEntry<TableCellElement> {
  switch (element?.type) {
    case "table-cell": {
      const path = ReactEditor.findPath(editor, element);
      return [element, path];
    }
    default: {
      const [cell] = Editor.nodes<TableCellElement>(editor, {
        match: (n) => !Editor.isEditor(n) && isTableCell(n),
      });
      return cell;
    }
  }
}

export function insertRow(editor: Editor, element?: TableCellElement) {
  const [, cellPath] = findCell(editor, element);
  const [[row, rowPath]] = Editor.nodes<TableRowElement>(editor, {
    match: isTableRow,
    at: Path.parent(cellPath),
  });
  const nextRow = Path.next(rowPath);

  Transforms.insertNodes<TableRowElement>(
    editor,
    emptyRow(row.children.length),
    {
      at: nextRow,
    }
  );
  Transforms.move(editor);
  Transforms.select(editor, [...nextRow, cellPath[cellPath.length - 1]]);
}

export function insertColumn(editor: Editor, element?: TableCellElement) {
  const [, cellPath] = findCell(editor, element);
  const tablePath = Path.parent(Path.parent(cellPath));
  const [[table]] = Editor.nodes<TableTableElement>(editor, {
    match: isTable,
    at: tablePath,
  });

  const cellIndex = cellPath[cellPath.length - 1] + 1;

  table.children.forEach((row, rowIndex) => {
    const cellPath = [...tablePath, rowIndex, cellIndex];
    Transforms.insertNodes<TableCellElement>(editor, emptyCell(), {
      at: cellPath,
    });
  });

  Transforms.move(editor);
  Transforms.select(editor, Path.next(cellPath));
}

export function deleteRow(editor: Editor, element?: TableCellElement) {
  const [, cellPath] = findCell(editor, element);
  const rowPath = Path.parent(cellPath);
  const tablePath = Path.parent(rowPath);
  const [[table]] = Editor.nodes<TableElement>(editor, {
    at: tablePath,
    match: isTable,
  });

  const rowCount = table.children.length;
  const cellIndex = cellPath[cellPath.length - 1];
  const rowIndex = rowPath[rowPath.length - 1];

  if (rowCount <= 1) {
    Transforms.removeNodes(editor, { at: tablePath, match: isTable });
    Transforms.move(editor);
    return;
  }

  Transforms.removeNodes(editor, { at: rowPath, match: isTableRow });

  Transforms.move(editor);
  Transforms.select(
    editor,
    rowIndex < rowCount - 1 ? cellPath : [...Path.previous(rowPath), cellIndex]
  );
}

export function deleteColumn(editor: Editor, element?: TableCellElement) {
  const [, cellPath] = findCell(editor, element);
  const [[table, tablePath]] = Editor.nodes<TableTableElement>(editor, {
    match: isTable,
    at: cellPath,
  });

  const cellIndex = cellPath[cellPath.length - 1];
  const columnCount = table.children[0].children.length ?? 0;

  if (columnCount <= 1) {
    Transforms.removeNodes(editor, { at: tablePath, match: isTable });
    Transforms.move(editor);
    return;
  }

  table.children.forEach((_row, rowIndex) => {
    Transforms.removeNodes(editor, { at: [...tablePath, rowIndex, cellIndex] });
  });

  Transforms.move(editor);
  Transforms.select(
    editor,
    cellIndex < columnCount - 1 ? cellPath : Path.previous(cellPath)
  );
}

function insertData(editor: Editor, data: DataTransfer) {
  Transforms.insertText(editor, data.getData("text/plain"));
  Transforms.move(editor);
  return true;
}

export const tablePlugin: EditorPluginDefinition<TableElement> = {
  isElement: isTableElement,
  component: Table,
  deleteBackward,
  deleteForward,
  insertBreak,
  onKeyDown,
  insertData,
  controls: renderTableRichtextControls,
};
