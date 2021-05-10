import { render, html } from '@mantou/gem';

import { Layout, Panel, Window, theme } from '../../';

const panel1 = new Panel('p1', { title: 'p1 title', content: html`<div style="height: 1000px">p1 content</div>` });
const panel2 = new Panel('p2', { title: 'p2 title' });
const panel3 = new Panel('p3', { title: 'p3 title', content: html`p3 content` });
const panel4 = new Panel('p4', { title: 'p4 title', content: html`p4 content` });
const panel5 = new Panel('p5', { title: 'p5 title', content: html`p5 content` });
const panel6 = new Panel('p6', { title: 'p6 title', content: html`p6 content` });
const panel7 = new Panel('p7', { title: 'p7 title', content: html`<div style="height: 1000px">p7 content</div>` });
const panel8 = new Panel('p8', { title: 'p8 title', content: html`p8 content` });
const panel9 = new Panel('p9', { title: 'p9 title', content: html`p9 content` });

const window1 = new Window([panel1, panel4, panel5]);
const window2 = new Window([panel2]);
const window3 = new Window([panel6]);
const window4 = new Window([panel7], { position: [100, 100] });
const window5 = new Window([panel8]);
const window6 = new Window([panel9]);

const panels = [panel1, panel2, panel3, panel4, panel5, panel6, panel7, panel8, panel9];
const layout = new Layout([window4, window1, window2, window3, window5, window6]);

render(
  html`
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      gem-panel::part(window):focus {
        border-color: ${theme.focusColor};
      }
      gem-panel::part(fixed-window) {
        border-radius: 0;
      }
      gem-panel::part(panel-header) {
        gap: 0;
        padding-bottom: 0;
        background: ${theme.darkBackgroundColor};
      }
      gem-panel::part(panel-title) {
        padding: 0.4em 1em;
        border-bottom: none;
        background: ${theme.darkBackgroundColor};
      }
      gem-panel::part(panel-title-button) {
        border-radius: 0;
      }
      gem-panel::part(panel-active-title),
      gem-panel::part(panel-drag-title) {
        background: ${theme.backgroundColor};
      }
      gem-panel::part(menu) {
        border-radius: 0;
      }
    </style>
    <gem-panel .theme=${{}} .panels=${panels} .layout=${layout}></gem-panel>
  `,
  document.body,
);
