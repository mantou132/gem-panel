# Framework integration

`<gem-panel>` use [ShadowDOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM), so it is most appropriate to use custom elements for the panel content. e.g:

```ts
const panel = new Panel('id', {
  title: 'title',
  content: new MyElement(),
});
```

There is a disadvantage of directly specifying the content as a custom element instance, they are resident in memory, but can use lit-html template to solve this problem:

```ts
const panel = new Panel('id', {
  title: 'title',
  content: html`<my-element></my-element>`,
});
```

If you want to use `<gem-panel>` in other frameworks, you need to use the `renderContent` factory function:

```ts
const panel = new Panel('id', {
  title: 'title',
  async getContent(panelName) {
    return renderContent(panelName, (ele) => {
      // ...
    });
  },
});
```

## React example

```tsx 7
import { renderContent } from 'gem-panel';
// ...

const panel1 = new Panel('p1', {
  title: 'p1 title',
  async getContent(panelName) {
    return renderContent(panelName, (ele) => ReactDOM.render(<Panel1 />, ele));
  },
});

// ...

function GemPanel({ panels, layout }) {
  const ref = useRef();

  useEffect(() => {
    const { current } = ref;
    current.panels = panels;
    current.layout = layout;
  });

  return <gem-panel ref={ref}></gem-panel>;
}
```

## Vue example

Binding property:

```html
<gem-panel :panels.prop="panels" :layout.prop="layout"></gem-panel>
```

```js 7
import { renderContent } from 'gem-panel';
// ...

const panel1 = new Panel('p1', {
  title: 'p1 title',
  async getContent(panelName) {
    return renderContent(panelName, (el) => new Vue({ el, components: { 'component-a': ComponentA } }));
  },
});

// ...

export default {
  data: {
    panels: panels,
    layout: layout,
  },
};
```

Template compilation config:

```js
{
  // in webpack config
  rules: [
    {
      test: /\.vue$/,
      use: 'vue-loader',
      options: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'gem-panel',
        },
      },
    },
    // ...
  ];
}
```
