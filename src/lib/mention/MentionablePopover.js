"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionablePopover = void 0;
var clsx_1 = require("clsx");
function MentionableEntry(_a) {
    var mentionable = _a.mentionable, selected = _a.selected, onSelect = _a.onSelect;
    return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div role="option" aria-selected={selected} tabIndex={0} className={(0, clsx_1.default)({
            "fm-editor-mentionable-popover-entry": true,
            "fm-editor-mentionable-popover-selected": selected,
        })} onClick={function (ev) {
            ev.preventDefault();
            onSelect(mentionable);
        }}>
      <span className="fm-editor-mentionable-popover-title">
        {mentionable.title}
      </span>
    </div>);
}
function MentionableGroup(_a) {
    var group = _a.group, selected = _a.selected, onSelect = _a.onSelect;
    if (!group.suggestions.length)
        return null;
    return (<div className="fm-editor-mentionable-popover-group">
      <h3 className="fm-editor-mentionable-popover-heading">{group.title}</h3>
      <div>
        {group.suggestions.map(function (entry) { return (<MentionableEntry mentionable={entry} selected={selected === entry} key={entry.title} onSelect={onSelect}/>); })}
      </div>
    </div>);
}
function MentionablePopover(_a) {
    var mentionables = _a.mentionables, selected = _a.selected, busy = _a.busy, onSelect = _a.onSelect, className = _a.className;
    return (<div role="group" className={(0, clsx_1.default)(className, {
            "fm-editor-mentionable-popover": true,
            "fm-editor-mentionable-popover-busy": busy,
        })}>
      {mentionables.map(function (group) { return (<MentionableGroup key={group.title} group={group} onSelect={onSelect} selected={selected}/>); })}
    </div>);
}
exports.MentionablePopover = MentionablePopover;
