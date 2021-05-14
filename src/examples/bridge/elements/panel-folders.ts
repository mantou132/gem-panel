import { connectStore, customElement, GemElement, html, TemplateResult } from '@mantou/gem';
import { bridgeStore, fetchFolderContent, Item } from '../store';

@connectStore(bridgeStore)
@customElement('bridge-panel-folders')
export class BridgePanelFoldersElement extends GemElement {
  static openedFolders = new Set<Item>();

  #toggleFolder = (evt: Event, item: Item) => {
    evt.stopPropagation();
    const { openedFolders } = BridgePanelFoldersElement;
    if (openedFolders.has(item)) {
      openedFolders.delete(item);
    } else {
      openedFolders.add(item);
      fetchFolderContent(item);
    }
    this.update();
  };

  #renderList = (list: Item[]): TemplateResult => {
    if (!list.length) return html``;
    return html`
      <div class="folder">
        ${list
          .filter((item) => item.type === 'folder')
          .map(
            (item) => html`<div @click=${(evt: Event) => this.#toggleFolder(evt, item)}>
              <div>${item.filename}</div>
              ${BridgePanelFoldersElement.openedFolders.has(item)
                ? this.#renderList(Object.values(item.content || {}))
                : ''}
            </div>`,
          )}
      </div>
    `;
  };

  render() {
    return html`
      <style>
        .folder {
          padding-left: 1em;
        }
      </style>
      <div>Home</div>
      ${this.#renderList(Object.values(bridgeStore.content || {}))}
    `;
  }
}
