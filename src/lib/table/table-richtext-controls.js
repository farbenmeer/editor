'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTableRichtextControls = void 0;
var ri_1 = require("react-icons/ri");
var RichtextControls_1 = require("../RichtextControls");
var table_richtext_support_1 = require("./table-richtext-support");
function renderTableRichtextControls(editor) {
    return (<RichtextControls_1.RichtextControlGroup>
      <RichtextControls_1.RichtextControlButton onClick={function () { return (0, table_richtext_support_1.insertColumn)(editor); }}>
        <ri_1.RiInsertColumnRight />
      </RichtextControls_1.RichtextControlButton>
      <RichtextControls_1.RichtextControlButton onClick={function () { return (0, table_richtext_support_1.deleteColumn)(editor); }}>
        <ri_1.RiDeleteColumn />
      </RichtextControls_1.RichtextControlButton>
      <RichtextControls_1.RichtextControlButton onClick={function () { return (0, table_richtext_support_1.insertRow)(editor); }}>
        <ri_1.RiInsertRowBottom />
      </RichtextControls_1.RichtextControlButton>
      <RichtextControls_1.RichtextControlButton onClick={function () { return (0, table_richtext_support_1.deleteRow)(editor); }}>
        <ri_1.RiDeleteRow />
      </RichtextControls_1.RichtextControlButton>
    </RichtextControls_1.RichtextControlGroup>);
}
exports.renderTableRichtextControls = renderTableRichtextControls;
