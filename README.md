A custom element`<gem-panel>`, let you easily create layout similar to Adobe After Effects.

## example

```ts
import { render, html } from '@mantou/gem';
import { Config, Panel, Window } from 'gem-panel';

const panel1 = new Panel('p1 title', html`p1 content`);
const panel2 = new Panel('p2 title', html`p2 content`);
const panel3 = new Panel('p3 title', html`p3 content`);
const panel4 = new Panel('p4 title', html`p4 content`);
const panel5 = new Panel('p5 title', html`p5 content`);
const panel6 = new Panel('p6 title', html`p6 content`);

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
    </style>
    <gem-panel .config=${config}></gem-panel>
  `,
  document.body,
);
```

## develop

```bash
# install dependencies
npm i
# development
npm run test
# build project
npm run example
```
