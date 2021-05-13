# Custom style

`<gem-panel>` can use js and css to customize styles in various aspects.

## Theme

Although the theme of `<gem-panel>` is implemented with css custom properties, it is configured with js, which has the advantage of type detection and can avoid the duplication of property names.

```ts
import { Theme } from 'gem-panel';

// ...

const theme: Theme = {
  fontSize: '14px',
  fontFamily: 'Source Sans Pro,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
  primaryColor: '#bfbfbf',
  secondaryColor: '#939393',
  focusColor: '#3392d9',
  borderColor: '#333',
  backgroundColor: '#222222',
  darkBackgroundColor: '#151515',
  windowGap: '4px',
  panelContentGap: '4px',
}
html`
  <gem-panel
    .theme=${theme}
    .panels=${panels}
    .layout=${layout)}>
  </gem-panel>
`;
```

You can also use the theme of `<gem-panel>` in your own code:

```ts
import { theme } from 'gem-panel';

html`
  <style>
    :host {
      background: ${theme.darkBackgroundColor};
    }
  </style>
`;
```

## Parts

`<gem-panel>` is implemented using WebCompontents, and internal elements all use ShadowDOM, so ordinary css cannot be used to customize the internal style of `<gem-panel>`.

But `<gem-panel>` exports many parts, which can be styled using css part:

```ts 5-7
// ...

html`
  <style>
    gem-panel::part(window):focus {
      border-color: ${theme.focusColor};
    }
  </style>
  <gem-panel .panels=${panels} .layout=${layout}></gem-panel>
`;
```

View all parts defined by `<gem-panel>` [here](./008-api.md#parts).

## Custom current panel style

While specifying the content of the panel, you can add `<style>`, which will be applied to the window displayed by the current panel:

```ts 6-10
// ...

const panel3 = new Panel('p3', {
  title: 'p3 title',
  content: html`
    <style>
      :host::part(panel-content) {
        padding: 0;
      }
    </style>
    p3 content
  `,
});
```
