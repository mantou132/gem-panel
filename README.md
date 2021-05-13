A custom element`<gem-panel>`, let you easily create layout similar to Adobe After Effects.

## Demo

- [Custom style](https://gem-panel-example-style.vercel.app/)
- [Adobe Bridge simulation](https://gem-panel-example-bridge.vercel.app/)

## Features

- Drag to adjust the grid
- Drag to move the panel and window
- Drag and drop to adjust the panel sorting
- Add commands to the panel
- Cache layout
- Custom style, [screenshot](./screenshots/style.png)
- Async load panel content
- Typescript support
- Lightweight, ~20kb(br)

## Install

```bash
npm i gem-panel
```

## Example

```ts
import { Layout, Panel, Window } from 'gem-panel';
import { render, html } from '@mantou/gem';

const panel1 = new Panel('p1', { title: 'p1 title', content: html`p1 content` });
const panel2 = new Panel('p2', { title: 'p2 title' });
const panel3 = new Panel('p3', { title: 'p3 title', content: html`<p3-panel></p3-panel>` });
const panel4 = new Panel('p4', { title: 'p4 title', content: html`<p4-panel></p4-panel>` });
const panel5 = new Panel('p5', { title: 'p5 title', content: html`<p5-panel></p5-panel>` });
const panel6 = new Panel('p6', { title: 'p6 title', content: html`<p6-panel></p6-panel>` });

const panels = [panel1, panel2, panel3, panel4, panel5, panel6];
const layout = new Layout([new Window([panel1, panel4, panel5]), new Window([panel2]), new Window([panel6])]);

render(
  html`
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
      }
      gem-panel::part(fixed-window) {
        box-shadow: 0 0.3em 1em rgb(0 0 0 / 40%);
      }
    </style>
    <gem-panel
      .panels=${panels}
      .layout=${layout}
      .theme=${{ backgroundColor: 'red' }}
      cache
      cache-version="1"
    ></gem-panel>
  `,
  document.body,
);
```

## Develop

```bash
# install dependencies
npm i
# development
npm run example
# test
npm run test
```
