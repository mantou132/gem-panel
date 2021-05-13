# Use in other frameworks

`<gem-panel>` is a custom element that can be used in any front-end frameworks.

## React

```tsx
// ...

const panel1Ele = document.createElement('div');
div.style = 'display: contents';
ReactDOM.render(<Panel1 />, div);
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '...';
div.append(link);
const panel1 = new Panel('p1', { title: 'p1 title', content: panel1Ele });

// ...

function GemPanel(props) {
  const ref = useRef();

  useEffect(() => {
    const { current } = ref;
    Object.assign(current, props);
  });

  return <gem-panel ref={ref}></gem-panel>;
}
```

## Vue

Binding property:

```vue
<gem-panel :panels.prop="panels" :layout.prop="layout"></gem-panel>
```

template compilation config:

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
