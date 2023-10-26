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
(which runs `next dev` for the example project in the app-folder)



### Styling
For now all styles go into `editor.css` and we just use plain CSS with no magic.