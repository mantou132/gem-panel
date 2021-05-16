# Async load

In a complex WebApp, there may be many panels, and the panel itself may be more complicated, so `<gem-panel>` allows asynchronous loading of panel content, which will be loaded asynchronously when the panel is displayed for the first time, which can greatly improve the WebApp performance:

```ts
// ...

const p1 = new Panel('p1', {
  title: 'p1 title',
  async getContent() {
    await import('./panel-content');
    return html`<bridge-panel-content></bridge-panel-content>`;
  },
});
```

When loading, the panel content will temporarily display `<gem-panel-placeholder>`, such as the `p2` panel in the figure below:

![screenshot](https://raw.githubusercontent.com/mantou132/gem-panel/master/screenshots/style.png)

In order to unify the user experience, `<gem-panel>` allows to customize the `placeholder` of the panel:

```ts 5
// ...

const p1 = new Panel('p1', {
  title: 'p1 title',
  placeholder: html`<my-placeholder></my-placeholder>`,
  async getContent() {
    await import('./panel-content');
    return html`<bridge-panel-content></bridge-panel-content>`;
  },
});
```
