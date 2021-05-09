A custom element`<gem-panel>`, let you easily create layout similar to Adobe After Effects.

[Demo](https://gem-panel.vercel.app/)

## Docs

- [API](./api-docs.md)

## Features

- Drag to adjust the grid
- Drag to move the panel and window
- Drag and drop to adjust the panel sorting
- Add commands to the panel
- Cache layout
- Custom style, [example](./screenshots/style.png)
- Async load panel content
- Typescript support
- Lightweight, ~20kb(br)

## Install

```bash
npm i gem-panel
```

## Example

```ts
import { Config, Panel, Window } from 'gem-panel';
import { render, html } from '@mantou/gem';

const panel1 = new Panel('p1 title', html`p1 content`);
const panel2 = new Panel('p2 title');
const panel3 = new Panel('p3 title', html`<p3-panel></p3-panel>`);
const panel4 = new Panel('p4 title', html`<p4-panel></p4-panel>`);
const panel5 = new Panel('p5 title', html`<p5-panel></p5-panel>`);
const panel6 = new Panel('p6 title', html`<p6-panel></p6-panel>`);

const window1 = new Window([panel1, panel4, panel5]);
const window2 = new Window([panel2]);
const window3 = new Window([panel6]);

const config = new Config([window1, window2, window3], [panel3]);

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
      .theme=${{ backgroundColor: 'red' }}
      .config=${config}
      .openPanelMenuBefore=${(panel, window) => []}
      cache
      cache-version="1"
      @panel-change=${({ detail }) => {}}
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
