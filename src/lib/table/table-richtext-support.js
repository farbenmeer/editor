"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tablePlugin = exports.deleteColumn = exports.deleteRow = exports.insertColumn = exports.insertRow = exports.insertTable = exports.isTableCell = exports.isTableElement = void 0;
var slate_1 = require("slate");
var slate_react_1 = require("slate-react");
var table_richtext_controls_1 = require("./table-richtext-controls");
var table_module_css_1 = require("./table.module.css");
function isTableElement(element) {
    return (!slate_1.Editor.isEditor(element) &&
        "type" in element &&
        ["table", "table-row", "table-cell"].includes(element.type));
}
exports.isTableElement = isTableElement;
function isTable(element) {
    return (!slate_1.Editor.isEditor(element) && "type" in element && element.type === "table");
}
function isTableRow(element) {
    return (!slate_1.Editor.isEditor(element) &&
        "type" in element &&
        element.type === "table-row");
}
function isTableCell(element) {
    return (!slate_1.Editor.isEditor(element) &&
        "type" in element &&
        element.type === "table-cell");
}
exports.isTableCell = isTableCell;
function Table(_a) {
    var element = _a.element, attributes = _a.attributes, children = _a.children;
    switch (element.type) {
        case "table": {
            return (<div className="px-2 w-full" {...attributes}>
          <table className="w-full">
            <tbody>{children}</tbody>
          </table>
        </div>);
        }
        case "table-row":
            return (<tr className={table_module_css_1.default.row} {...attributes}>
          {children}
        </tr>);
        case "table-cell":
            return (<td className={table_module_css_1.default.cell} {...attributes}>
          {children}
        </td>);
    }
}
function deleteBackward(editor) {
    var selection = editor.selection;
    if (selection && slate_1.Range.isCollapsed(selection)) {
        var cell = slate_1.Editor.nodes(editor, {
            match: function (n) {
                return !slate_1.Editor.isEditor(n) && slate_1.Element.isElement(n) && n.type === "table-cell";
            },
        })[0];
        if (cell) {
            var cellPath = cell[1];
            var start = slate_1.Editor.start(editor, cellPath);
            if (slate_1.Point.equals(selection.anchor, start)) {
                return true;
            }
        }
    }
}
function deleteForward(editor) {
    var selection = editor.selection;
    if (selection && slate_1.Range.isCollapsed(selection)) {
        var cell = slate_1.Editor.nodes(editor, {
            match: function (n) {
                return !slate_1.Editor.isEditor(n) && slate_1.Element.isElement(n) && n.type === "table-cell";
            },
        })[0];
        if (cell) {
            var cellPath = cell[1];
            var end = slate_1.Editor.end(editor, cellPath);
            if (slate_1.Point.equals(selection.anchor, end)) {
                return true;
            }
        }
    }
}
function insertBreak(editor) {
    var cellNode = slate_1.Editor.nodes(editor, {
        match: isTableCell,
    })[0];
    if (!cellNode) {
        return false;
    }
    var cell = cellNode[0], cellPath = cellNode[1];
    var cellIndex = cellPath[cellPath.length - 1];
    var rowPath = slate_1.Path.parent(cellPath);
    try {
        var sibling = __spreadArray(__spreadArray([], slate_1.Path.next(rowPath), true), [cellIndex], false);
        slate_1.Editor.nodes(editor, { at: sibling, match: isTableCell });
        slate_1.Transforms.select(editor, sibling);
    }
    catch (_a) {
        insertRow(editor, cell);
    }
    return true;
}
function onKeyDown(editor, event) {
    if (event.key === "Tab") {
        var selection = editor.selection;
        if (!selection)
            return;
        var cell = slate_1.Editor.nodes(editor, {
            match: function (n) { return !slate_1.Editor.isEditor(n) && isTableCell(n); },
        })[0];
        var table = slate_1.Editor.nodes(editor, {
            match: function (n) { return !slate_1.Editor.isEditor(n) && isTable(n); },
        })[0];
        if (cell && table) {
            event.preventDefault();
            var node = cell[0], path = cell[1];
            if (event.shiftKey) {
                try {
                    var sibling = slate_1.Path.previous(path);
                    slate_1.Editor.nodes(editor, { at: sibling, match: isTableCell });
                    slate_1.Transforms.select(editor, sibling);
                    return;
                }
                catch (_a) {
                    return;
                }
            }
            try {
                var sibling = slate_1.Path.next(path);
                slate_1.Editor.nodes(editor, {
                    at: sibling,
                    match: function (n) { return !slate_1.Editor.isEditor(n) && isTableCell(n); },
                });
                slate_1.Transforms.select(editor, sibling);
            }
            catch (_b) {
                insertColumn(editor, node);
            }
            return true;
        }
    }
}
var emptyCell = function () { return ({
    type: "table-cell",
    children: [{ text: "" }],
}); };
var emptyRow = function (n) { return ({
    type: "table-row",
    children: Array.from({ length: n }).map(function () { return emptyCell(); }),
}); };
function insertTable(editor) {
    if (editor.selection) {
        var activeTableNode = slate_1.Editor.nodes(editor, { match: isTable })[0];
        if (activeTableNode) {
            var path = activeTableNode[1];
            editor.select(slate_1.Path.next(path));
        }
        else {
            editor.select(editor.selection.anchor);
        }
    }
    var table = {
        type: "table",
        children: [emptyRow(2), emptyRow(2)],
    };
    slate_1.Transforms.insertNodes(editor, table);
    slate_1.Transforms.move(editor);
}
exports.insertTable = insertTable;
function findCell(editor, element) {
    switch (element === null || element === void 0 ? void 0 : element.type) {
        case "table-cell": {
            var path = slate_react_1.ReactEditor.findPath(editor, element);
            return [element, path];
        }
        default: {
            var cell = slate_1.Editor.nodes(editor, {
                match: function (n) { return !slate_1.Editor.isEditor(n) && isTableCell(n); },
            })[0];
            return cell;
        }
    }
}
function insertRow(editor, element) {
    var _a = findCell(editor, element), cellPath = _a[1];
    var _b = slate_1.Editor.nodes(editor, {
        match: isTableRow,
        at: slate_1.Path.parent(cellPath),
    })[0], row = _b[0], rowPath = _b[1];
    var nextRow = slate_1.Path.next(rowPath);
    slate_1.Transforms.insertNodes(editor, emptyRow(row.children.length), {
        at: nextRow,
    });
    slate_1.Transforms.move(editor);
    slate_1.Transforms.select(editor, __spreadArray(__spreadArray([], nextRow, true), [cellPath[cellPath.length - 1]], false));
}
exports.insertRow = insertRow;
function insertColumn(editor, element) {
    var _a = findCell(editor, element), cellPath = _a[1];
    var tablePath = slate_1.Path.parent(slate_1.Path.parent(cellPath));
    var table = slate_1.Editor.nodes(editor, {
        match: isTable,
        at: tablePath,
    })[0][0];
    var cellIndex = cellPath[cellPath.length - 1] + 1;
    table.children.forEach(function (row, rowIndex) {
        var cellPath = __spreadArray(__spreadArray([], tablePath, true), [rowIndex, cellIndex], false);
        slate_1.Transforms.insertNodes(editor, emptyCell(), {
            at: cellPath,
        });
    });
    slate_1.Transforms.move(editor);
    slate_1.Transforms.select(editor, slate_1.Path.next(cellPath));
}
exports.insertColumn = insertColumn;
function deleteRow(editor, element) {
    var _a = findCell(editor, element), cellPath = _a[1];
    var rowPath = slate_1.Path.parent(cellPath);
    var tablePath = slate_1.Path.parent(rowPath);
    var table = slate_1.Editor.nodes(editor, {
        at: tablePath,
        match: isTable,
    })[0][0];
    var rowCount = table.children.length;
    var cellIndex = cellPath[cellPath.length - 1];
    var rowIndex = rowPath[rowPath.length - 1];
    if (rowCount <= 1) {
        slate_1.Transforms.removeNodes(editor, { at: tablePath, match: isTable });
        slate_1.Transforms.move(editor);
        return;
    }
    slate_1.Transforms.removeNodes(editor, { at: rowPath, match: isTableRow });
    slate_1.Transforms.move(editor);
    slate_1.Transforms.select(editor, rowIndex < rowCount - 1 ? cellPath : __spreadArray(__spreadArray([], slate_1.Path.previous(rowPath), true), [cellIndex], false));
}
exports.deleteRow = deleteRow;
function deleteColumn(editor, element) {
    var _a;
    var _b = findCell(editor, element), cellPath = _b[1];
    var _c = slate_1.Editor.nodes(editor, {
        match: isTable,
        at: cellPath,
    })[0], table = _c[0], tablePath = _c[1];
    var cellIndex = cellPath[cellPath.length - 1];
    var columnCount = (_a = table.children[0].children.length) !== null && _a !== void 0 ? _a : 0;
    if (columnCount <= 1) {
        slate_1.Transforms.removeNodes(editor, { at: tablePath, match: isTable });
        slate_1.Transforms.move(editor);
        return;
    }
    table.children.forEach(function (_row, rowIndex) {
        slate_1.Transforms.removeNodes(editor, { at: __spreadArray(__spreadArray([], tablePath, true), [rowIndex, cellIndex], false) });
    });
    slate_1.Transforms.move(editor);
    slate_1.Transforms.select(editor, cellIndex < columnCount - 1 ? cellPath : slate_1.Path.previous(cellPath));
}
exports.deleteColumn = deleteColumn;
function insertData(editor, data) {
    slate_1.Transforms.insertText(editor, data.getData("text/plain"));
    slate_1.Transforms.move(editor);
    return true;
}
exports.tablePlugin = {
    isElement: isTableElement,
    component: Table,
    deleteBackward: deleteBackward,
    deleteForward: deleteForward,
    insertBreak: insertBreak,
    onKeyDown: onKeyDown,
    insertData: insertData,
    controls: table_richtext_controls_1.renderTableRichtextControls,
};
