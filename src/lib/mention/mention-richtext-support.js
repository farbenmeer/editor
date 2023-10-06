"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMentionPluginOptions = exports.mentionPlugin = exports.optionsKey = exports.useMentionableTypeahead = exports.insertMention = exports.MentionPopoverProvider = exports.Mention = exports.isMention = exports.MentionContext = void 0;
var dom_1 = require("@floating-ui/dom");
var react_1 = require("@floating-ui/react");
var memoize_one_1 = require("memoize-one");
var react_2 = require("react");
var slate_1 = require("slate");
var slate_react_1 = require("slate-react");
var MentionablePopover_1 = require("./MentionablePopover");
exports.MentionContext = (0, react_2.createContext)({
    open: function () {
        throw new Error("Needs to be inside RichtextEditor");
    },
    Component: function () {
        throw new Error("Needs to be inside RichtextEditor");
    },
});
var isMention = function (element) { return "type" in element && element.type === "mention"; };
exports.isMention = isMention;
var Mention = function (_a) {
    var attributes = _a.attributes, element = _a.element, children = _a.children;
    var _b = (0, react_2.useContext)(exports.MentionContext), open = _b.open, Component = _b.Component;
    return (<span {...attributes} contentEditable={false} className="fm-editor-mention" aria-describedby="mention-popover" onMouseEnter={function (ev) { return open(element, ev.currentTarget); }} onMouseLeave={function () { return open(); }}>
      <Component mentionable={element}/>
      {children}
    </span>);
};
exports.Mention = Mention;
function MentionPopoverProvider(_a) {
    var children = _a.children, Component = _a.Component, Popover = _a.Popover;
    var _b = (0, react_2.useState)(), mention = _b[0], setMention = _b[1];
    var _c = (0, react_1.useFloating)({
        placement: "bottom-start",
        open: !!mention,
        whileElementsMounted: dom_1.autoUpdate,
        middleware: [(0, dom_1.shift)(), (0, react_1.flip)()],
    }), refs = _c.refs, floatingStyles = _c.floatingStyles;
    var value = (0, react_2.useMemo)(function () {
        return Component && {
            open: function (mention, target) {
                setMention(mention !== null && mention !== void 0 ? mention : null);
                refs.setReference(target !== null && target !== void 0 ? target : null);
            },
            Component: Component,
        };
    }, [Component, refs]);
    if (!value) {
        return children;
    }
    return (<exports.MentionContext.Provider value={value}>
      {children}
      {mention && Popover && (<div ref={refs.setFloating} style={__assign(__assign({}, floatingStyles), { zIndex: 10 })}>
          <Popover mentionable={mention}/>
        </div>)}
    </exports.MentionContext.Provider>);
}
exports.MentionPopoverProvider = MentionPopoverProvider;
var insertMention = function (editor, mentionable) {
    slate_1.Transforms.insertNodes(editor, __assign(__assign({}, mentionable), { type: "mention", children: [{ text: "" }] }));
    slate_1.Transforms.move(editor);
};
exports.insertMention = insertMention;
function useMentionableTypeahead(_a) {
    var editor = _a.editor, suggest = _a.suggest, defaultOnChange = _a.onChange, defaultOnKeyDown = _a.onKeyDown;
    var _b = (0, react_2.useState)(), target = _b[0], setTarget = _b[1];
    var _c = (0, react_2.useState)(""), search = _c[0], setSearch = _c[1];
    var _d = (0, react_2.useState)([]), results = _d[0], setResults = _d[1];
    var _e = (0, react_2.useState)(false), busy = _e[0], setBusy = _e[1];
    var _f = (0, react_2.useState)(), selected = _f[0], setSelected = _f[1];
    var combinedResults = (0, react_2.useMemo)(function () { return results.flatMap(function (group) { return group.suggestions; }); }, [results]);
    // Suggestion Popover
    var suggestionsOpen = !!(target && combinedResults.length);
    var _g = (0, react_1.useFloating)({
        placement: "bottom-start",
        open: suggestionsOpen,
        whileElementsMounted: dom_1.autoUpdate,
        middleware: [(0, dom_1.shift)(), (0, react_1.flip)()],
    }), refs = _g.refs, floatingStyles = _g.floatingStyles;
    var insertSelected = (0, react_2.useCallback)(function (mentionable) {
        if (!target || !(mentionable !== null && mentionable !== void 0 ? mentionable : selected))
            return;
        slate_1.Transforms.select(editor, target);
        (0, exports.insertMention)(editor, mentionable !== null && mentionable !== void 0 ? mentionable : selected);
        setTarget(undefined);
        setSearch("");
    }, [target, selected, editor]);
    var onKeyDown = (0, react_2.useCallback)(function (event) {
        if (!target || !combinedResults.length)
            return defaultOnKeyDown === null || defaultOnKeyDown === void 0 ? void 0 : defaultOnKeyDown(event);
        var index = combinedResults.indexOf(selected);
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setSelected(combinedResults[(index + 1) % combinedResults.length]);
                break;
            case "ArrowUp":
                event.preventDefault();
                setSelected(combinedResults[(index - 1 + combinedResults.length) % combinedResults.length]);
                break;
            case "Tab":
            case "Enter":
                event.preventDefault();
                insertSelected();
                break;
            case "Escape":
                event.preventDefault();
                setTarget(undefined);
                break;
        }
    }, [combinedResults, insertSelected, selected, target, defaultOnKeyDown]);
    (0, react_2.useEffect)(function () {
        if (!target || !combinedResults.length)
            return;
        var domRange = slate_react_1.ReactEditor.toDOMRange(editor, target);
        refs.setReference(domRange);
    }, [target, combinedResults, editor, refs]);
    (0, react_2.useEffect)(function () {
        if (!suggest)
            return;
        setBusy(true);
        suggest(search)
            .then(setResults)
            .then(function () { return setBusy(false); })
            .catch(function () { return setBusy(false); });
    }, [search, suggest]);
    var popover = (0, react_2.useMemo)(function () {
        return (<>
        {suggestionsOpen && (<div ref={refs.setFloating} style={floatingStyles} key="mentionable">
            <MentionablePopover_1.MentionablePopover mentionables={results} busy={busy} selected={selected} onSelect={function (mentionable) {
                    setSelected(mentionable);
                    insertSelected(mentionable);
                }}/>
          </div>)}
      </>);
    }, [
        suggestionsOpen,
        refs.setFloating,
        floatingStyles,
        results,
        busy,
        selected,
        insertSelected,
    ]);
    var onChange = (0, react_2.useCallback)(function (value) {
        var selection = editor.selection;
        if (!selection || !slate_1.Range.isCollapsed(selection)) {
            setTarget(undefined);
            return defaultOnChange === null || defaultOnChange === void 0 ? void 0 : defaultOnChange(value);
        }
        var start = slate_1.Range.edges(selection)[0];
        var wordBefore = slate_1.Editor.before(editor, start, { unit: "word" });
        var before = wordBefore && slate_1.Editor.before(editor, wordBefore);
        var beforeRange = before && slate_1.Editor.range(editor, before, start);
        var beforeText = beforeRange && slate_1.Editor.string(editor, beforeRange);
        var beforeMatch = beforeText && beforeText.match(/@(\w*)$/);
        if (beforeMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            return;
        }
        setTarget(undefined);
        defaultOnChange === null || defaultOnChange === void 0 ? void 0 : defaultOnChange(value);
    }, [defaultOnChange, editor]);
    return { popover: popover, onKeyDown: onKeyDown, onChange: onChange };
}
exports.useMentionableTypeahead = useMentionableTypeahead;
exports.optionsKey = Symbol("mentionPluginContext");
function rawMentionPlugin(options) {
    var _a;
    return _a = {
            name: "mention",
            isVoid: true,
            markableVoid: true,
            isInline: true,
            component: exports.Mention,
            isElement: exports.isMention
        },
        _a[exports.optionsKey] = options,
        _a;
}
exports.mentionPlugin = (0, memoize_one_1.default)(rawMentionPlugin, function (_a, _b) {
    var newOptions = _a[0];
    var oldOptions = _b[0];
    return newOptions.component === oldOptions.component &&
        newOptions.suggest === oldOptions.suggest &&
        newOptions.popover === oldOptions.popover;
});
function getMentionPluginOptions(plugin) {
    var _a;
    var options = (_a = plugin === null || plugin === void 0 ? void 0 : plugin[exports.optionsKey]) !== null && _a !== void 0 ? _a : null;
    return options;
}
exports.getMentionPluginOptions = getMentionPluginOptions;
