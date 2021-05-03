import { render, html } from '@mantou/gem';

import { Config, Panel, Window } from '../../';

const panel1 = new Panel('p1 title', html`p1 content`);
const panel2 = new Panel('p2 title', html`p2 content`);
const panel3 = new Panel('p3 title', html`p3 content`);
const panel4 = new Panel('p4 title', html`p4 content`);
const panel5 = new Panel('p5 title', html`p5 content`);
const panel6 = new Panel('p6 title', html`p6 content`);
const panel7 = new Panel('p7 title', html`p7 content`);

const window1 = new Window([panel1, panel4, panel5]);
const window2 = new Window([panel2]);
const window3 = new Window([panel6]);
const window4 = new Window([panel7], { position: [10, 10] });
const window5 = new Window([panel6]);
const window6 = new Window([panel6]);
const config = new Config([window4, window1, window2, window3, window5, window6], [panel3]);

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
