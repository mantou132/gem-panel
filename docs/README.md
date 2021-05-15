# Introduction

`<gem-panel>` is a custom element developed using [gem](https://github.com/mantou132/gem). It can quickly create a user interface similar to Adobe After Effects -- an interface that allows users to freely organize panels.

![screenshot](https://raw.githubusercontent.com/mantou132/gem-panel/master/screenshots/style.png)

## Install

use NPM:

```bash
npm i gem-panel
```

or use ESM:

```js
import * as GemPanel from 'https://cdn.skypack.dev/gem-panel';
```

## Usage

First, you need to define all the panels used by the WebApp:

```ts
import { Layout, Panel, Window } from 'gem-panel';

const panel1 = new Panel('p1', { title: 'p1 title', content: `p1 content` });
const panel2 = new Panel('p2', { title: 'p2 title' });
const panel3 = new Panel('p3', { title: 'p3 title', content: `p3-content` });
const panel4 = new Panel('p4', { title: 'p4 title', content: `p4-content` });
const panel5 = new Panel('p5', { title: 'p5 title', content: `p5-content` });
const panel6 = new Panel('p6', { title: 'p6 title', content: `p6-content` });

const panels = [panel1, panel2, panel3, panel4, panel5, panel6];
```

The first parameter of the `Panel` constructor is the name of the panel, which is the unique identifier of the panel, and subsequent adjustments to the panel are based on the panel name.

Then we define the initial layout of the WebApp:

```ts
const window1 = new Window([panel1, panel4, panel5]);
const window2 = new Window([panel2]);
const window3 = new Window([panel6]);
const layout = new Layout([window1, window2, window3]);
```

The layout defines three windows, and put some panels in these windows, `<gem-panel>` will use the built-in grid system for layout.

Finally, we add panels and layout to the `<gem-panel>` as propertys, and insert `<gem-panel>` into the document:

```ts
import { render, html } from '@mantou/gem';

//...

render(html`<gem-panel .panels=${panels} .layout=${layout}></gem-panel>`, document.body);
```

or use `GemPanelElement` constructor:

```ts
import { GemPanelElement } from 'gem-panel';

// ...

document.body.append(new GemPanelElement({ panels, layout }));
```

Now that you have completed a basic user interface using `<gem-panel>`, the following chapters will introduce the use of `<gem-panel>` to accomplish some amazing things.
