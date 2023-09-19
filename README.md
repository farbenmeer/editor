# @farbenmeer/editor

Hopefully one we can actually use across projects.

## Usage
This project is under construction. DO NOT USE THIS.

A future API might look like this:
### Setup
```bash
pnpm add @farbenmeer/editor
```

```tsx
import { Editor, imagePlugin } from "@farbenmeer/editor"

<Editor plugins={[imagePlugin]} onChange={(content) => doStuffWith(content)} />
```

## Development

### Setup
Three commands so far:
```bash
pnpm i
```
to install dependencies.
```bash
pnpm build
```
(which just runs `tsc`) to build a production build.
Output ends up in the `dist` folder.

```bash
pnpm dev
```
(which just runs `tsc` in watch mode) to keep the `dist`-folder up to date while working on stuff



### Styling
For now all styles go into `editor.css` and we just use plain CSS with no magic.