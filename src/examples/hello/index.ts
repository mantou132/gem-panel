import { render, html } from '@mantou/gem';

import { MenuItem, GemPanelElement, Layout, Panel, Window } from '../../';

const getMenu = async (window: Window, _panel: Panel, defaultMenus: MenuItem[]) => {
  const menus: MenuItem[] = [...defaultMenus];
  const gemPanelEle = document.querySelector<GemPanelElement>('gem-panel');
  if (gemPanelEle) {
    gemPanelEle.hiddenPanels.forEach((panel) => {
      menus.unshift({
        text: `open "${panel.title}"`,
        handle: () => gemPanelEle.openPanelInWindow(panel, window),
      });
    });
  }
  return menus;
};

const panel1 = new Panel('p1', {
  title: 'p1 title',
  getMenu,
  content: html`<div style="height: 1000px">p1 content</div>`,
});

const panel2 = new Panel('p2', {
  title: 'p2 title',
  getMenu,
  async getContent() {
    await new Promise((res) => setTimeout(res, 1000));
    return html`
      <iframe
        src="https://ghbtns.com/github-btn.html?user=mantou132&repo=gem-panel&type=watch&count=true&size=large"
        frameborder="0"
        scrolling="0"
        width="170"
        height="30"
        title="GitHub"
      ></iframe>
    `;
  },
});

const panel3 = new Panel('p3', { title: 'p3 title', getMenu, content: html`p3 content` });
const panel4 = new Panel('p4', { title: 'p4 title', getMenu, content: html`p4 content` });
const panel5 = new Panel('p5', { title: 'p5 title', getMenu, content: html`p5 content` });
const panel6 = new Panel('p6', { title: 'p6 title', getMenu, content: html`p6 content` });

const panel7 = new Panel('p7', {
  title: 'p7 title',
  getMenu,
  content: html`<div style="height: 1000px">p7 content</div>`,
});

const panel8 = new Panel('p8', { title: 'p8 title', getMenu, content: html`p8 content` });
const panel9 = new Panel('p9', { title: 'p9 title', getMenu, content: html`p9 content` });

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
    </style>
    <gem-panel .panels=${panels} .layout=${layout} .theme=${{}} .cache=${false} .cacheVersion=${''}></gem-panel>
  `,
  document.body,
);
