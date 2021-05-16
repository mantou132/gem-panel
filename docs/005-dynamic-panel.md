# Dynamic panel

Some complex webapps may have a plug-in system, they will dynamically load panels, the API exposed by `<gem-panel>` facilitates this.

```ts
// ...

const { panels } = fetch('user-profile');

panels.forEach((panel) => {
  genPanelElement.addPanel(
    new Panel(panel.name, {
      title: panel.title,
      content: panel.content,
    }),
  );
});
```

But dynamically added panels may be cached, so when all panels are dynamically loaded, you need to manually clear the invalid pannel:

```ts
// ...

genPanelElement.clearPanel();
```

Of course, you can also delete the panel while the webapp is running:

```ts
// ...

genPanelElement.deletePanel(panel);
```
