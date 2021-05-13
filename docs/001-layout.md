# Layout

`<gem-panel>` uses css grid for layout, and the initial layout uses the same grid properties as css for configuration:

```ts
// ...

const window1 = new Window([panel1, panel4, panel5], { gridArea: 'w1' });
const window2 = new Window([panel2], { gridArea: 'w2' });
const window3 = new Window([panel6], { gridArea: 'w3' });

const layout = new Layout([window1, window2, window3], {
  gridTemplateAreas: `
      "w1 w2 w2"
      "w1 w2 w2"
      "w3 w3 w3"
    `,
  gridTemplateColumns: '1fr 2fr 1fr',
  gridTemplateRows: '3fr 1fr 3fr',
});
```

When the `position` or `dimension` of the window are specified, the window will be displayed as a separate window from the grid.

```ts 6
// ...

const window1 = new Window([panel1, panel4, panel5], { gridArea: 'w1' });
const window2 = new Window([panel2], { gridArea: 'w2' });
const window3 = new Window([panel6], { gridArea: 'w3' });
const window4 = new Window([panel7], { position: [100, 100] });

const layout = new Layout([window1, window2, window3, window4], {
  gridTemplateAreas: `
      "w1 w2 w2"
      "w1 w2 w2"
      "w3 w3 w3"
    `,
  gridTemplateColumns: '1fr 2fr 1fr',
  gridTemplateRows: '3fr 1fr 3fr',
});

// ...
```

## Cache layout

Users can cache adjustments to panels, and it’s very simple, just add the `cache` attribute:

```ts
html`<gem-panel cache .panels=${panels} .layout=${layout}></gem-panel>`;
```

You can also set `cache-version`, which can avoid using outdated layouts, and can also be used in different layout modes:

```ts
html`
  <gem-panel
    .cache=${true}
    .cacheVersion=${layoutMode}
    .panels=${panels}
    .layout=${layout)}>
  </gem-panel>
`;
```

If there is an accident in the layout and it is cached, you can use `GemPanelElement.clearCache` to clean up the current cache
