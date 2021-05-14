import { connectStore, customElement, html } from '@mantou/gem';
import { theme } from '../../../';

import { bridgeStore, Item, toggleFavorite, updatePath, updateSelection } from '../store';
import { getPathFolder } from '../utils';
import { BridgeBaseElement } from '../base-element';
import './thumbnail';

@connectStore(bridgeStore)
@customElement('bridge-panel-content')
export class BridgePanelContentElement extends BridgeBaseElement {
  #clickHandle = (item: Item) => {
    if (bridgeStore.selection.has(item)) {
      updateSelection([]);
    } else {
      updateSelection([item]);
    }
  };

  #dbClickHandle = (item: Item) => {
    if (item.type === 'folder') {
      updatePath([...bridgeStore.path, item.filename]);
    }
  };

  #openContextMenu = (evt: MouseEvent, item: Item) => {
    this.openContextMenu({
      activeElement: null,
      x: evt.x,
      y: evt.y,
      menu: [
        {
          text: bridgeStore.favorites.has(item) ? 'remove from favorites' : 'add to favorites',
          handle() {
            toggleFavorite(item);
          },
        },
      ],
    });
  };

  mounted = () => {
    this.effect(
      () => updatePath(bridgeStore.path),
      () => [bridgeStore.path],
    );
  };

  render() {
    const folder = getPathFolder((bridgeStore as unknown) as Item, bridgeStore.path);
    if (!folder.content) return html`<gem-panel-placeholder></gem-panel-placeholder>`;
    const items = Object.values(folder.content).filter((item) => {
      return [...bridgeStore.filters].every((filter) => filter(item) === true);
    });
    return html`
      <style>
        :host {
          display: grid;
          padding: 0.2em;
          gap: 1em;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        }
        .selected {
          outline: 2px solid ${theme.focusColor};
        }
      </style>
      ${items.map(
        (item) =>
          html`
            <bridge-thumbnail
              class=${bridgeStore.selection.has(item) ? 'selected' : ''}
              @click=${() => this.#clickHandle(item)}
              @dblclick=${() => this.#dbClickHandle(item)}
              @contextmenu=${(evt: MouseEvent) => this.#openContextMenu(evt, item)}
              .data=${item}
            ></bridge-thumbnail>
          `,
      )}
    `;
  }
}
