"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkPlugin = exports.Link = exports.removeLink = exports.setLink = exports.isLink = void 0;
var slate_1 = require("slate");
var slate_react_1 = require("slate-react");
var link_edit_dialog_1 = require("./link-edit-dialog");
var md_1 = require("react-icons/md");
function isLink(node) {
    return "type" in node && node.type === "link";
}
exports.isLink = isLink;
function setLink(editor, node, url, path) {
    slate_1.Transforms.unwrapNodes(editor, {
        match: isLink,
        split: true,
        at: path,
    });
    if (node) {
        slate_1.Transforms.setNodes(editor, { url: url }, { at: path });
    }
    else {
        slate_1.Transforms.wrapNodes(editor, { type: "link", url: url, children: [] }, {
            at: path,
            split: true,
        });
    }
}
exports.setLink = setLink;
function removeLink(editor, path) {
    slate_1.Transforms.unwrapNodes(editor, {
        at: path,
        match: isLink,
        split: true,
    });
}
exports.removeLink = removeLink;
function Link(_a) {
    var children = _a.children, element = _a.element, attributes = _a.attributes;
    var isReadonly = (0, slate_react_1.useReadOnly)();
    var editor = (0, slate_react_1.useSlate)();
    var path = slate_react_1.ReactEditor.findPath(editor, element);
    if (isReadonly) {
        return (<a {...attributes} href={element.url} target="_blank" rel="noreferrer">
        {children}
      </a>);
    }
    return (<span {...attributes} className="inline-flex gap-1">
      <a href={element.url} className="underline" target="_blank" rel="noreferrer">
        {children}
      </a>
      <link_edit_dialog_1.LinkEditDialog url={element.url} onSave={function (url) { return setLink(editor, element, url, path); }} onRemove={function () { return removeLink(editor, path); }}>
        <button>
          <md_1.MdEdit />
        </button>
      </link_edit_dialog_1.LinkEditDialog>
    </span>);
}
exports.Link = Link;
exports.linkPlugin = {
    name: "link",
    isElement: isLink,
    component: Link,
    isInline: true,
};
