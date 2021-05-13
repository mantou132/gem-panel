# Context menu

By default, each panel comes with a context menu, which contains the menu items "Close panel" and "Close panel group":

![screenshot](https://raw.githubusercontent.com/mantou132/gem-panel/master/screenshots/style.png)

## Custom panel menu

`<gem-panel>` allows you to specify the context menu of the panel when defining the panel, and the content can be customized according to the WebApp status:

```ts 6-10
// ...

const p1 = new Panel('p1', {
  title: 'p1 title',
  content: 'p1 content',
  async getMenu(currentWindow: Window, currentPanel: Panel, defaultMenus: MenuItem[]) {
    const menus: MenuItem[] = [...defaultMenus];
    // Add custom menu item
    return menus;
  },
});
```

## Custom context menu

`<gem-panel>` does not prevent the default system context menu, but it is easy to use the context menu of `<gem-panel>` instead.

```ts 7-15
// ...

@customElement('app-panel1')
export class AppPanel1ContentElement extends GemElement {
  mounted = () => {
    this.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
      gemPanelElement.openContextMenu(null, evt.x, evt.y, [
        {
          text: 'Test',
          handle() {
            alert('test');
          },
        },
      ]);
    });
  };
}
```
