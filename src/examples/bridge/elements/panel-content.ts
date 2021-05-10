import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import '../../../';
import { theme } from '../../../lib/theme';

import { bridgeStore, getCurrentFolder, Item, updatePath, updateSelection } from '../store';
import './thumbnail';

@connectStore(bridgeStore)
@customElement('bridge-panel-content')
export class BridgePanelContentElement extends GemElement {
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

  mounted = () => {
    this.effect(
      () => updatePath(bridgeStore.path),
      () => [bridgeStore.path],
    );
  };

  render() {
    const folder = getCurrentFolder();
    if (!folder.content) return html`<gem-panel-placeholder></gem-panel-placeholder>`;
    const items = Object.values(folder.content);
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
          html`<bridge-thumbnail
            class=${bridgeStore.selection.has(item) ? 'selected' : ''}
            @click=${() => this.#clickHandle(item)}
            @dblclick=${() => this.#dbClickHandle(item)}
            .data=${item}
          ></bridge-thumbnail>`,
      )}
    `;
  }
}
