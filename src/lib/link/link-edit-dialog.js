'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkEditDialog = void 0;
var Dialog = require("@radix-ui/react-dialog");
var InlineTextEditor_1 = require("src/components/form/editor/inline-text/InlineTextEditor");
var Button_1 = require("src/components/form/button/Button");
var react_1 = require("react");
function LinkEditDialog(_a) {
    var _b;
    var initial = _a.url, onSave = _a.onSave, onRemove = _a.onRemove, children = _a.children;
    var _c = (0, react_1.useState)(null), currentUrl = _c[0], setUrl = _c[1];
    var url = (_b = currentUrl !== null && currentUrl !== void 0 ? currentUrl : initial) !== null && _b !== void 0 ? _b : '';
    return (<Dialog.Root onOpenChange={function () {
            setUrl(null);
        }}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-slate-800/70 fixed inset-0 z-50"/>
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[51] p-8 rounded-md shadow-md shadow-slate-800 flex flex-col gap-6 w-full max-w-lg">
          <Dialog.Title className="text-lg flex gap-2 items-center">Link bearbeiten</Dialog.Title>
          <Dialog.Description>
            Zu folgender URL verlinken:
            <InlineTextEditor_1.InlineTextEditor type="url" placeholder="URL" className="p-4" value={url} onChange={setUrl}/>
          </Dialog.Description>
          <div className="flex gap-4 flex-col items-stretch sm:flex-row sm:items-start">
            <Dialog.Close asChild>
              <Button_1.Button>Abbrechen</Button_1.Button>
            </Dialog.Close>
            {initial && (<Dialog.Close onClick={onRemove} asChild>
                <Button_1.Button>Link entfernen</Button_1.Button>
              </Dialog.Close>)}
            <Dialog.Close onClick={function () { return currentUrl && onSave(currentUrl); }} asChild>
              <Button_1.Button primary disabled={!currentUrl}>
                Speichern
              </Button_1.Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>);
}
exports.LinkEditDialog = LinkEditDialog;
