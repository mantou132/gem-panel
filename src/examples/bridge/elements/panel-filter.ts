import { connectStore, customElement, html } from '@mantou/gem';
import { BridgeBaseElement } from '../base-element';
import { bridgeStore, Item, Filter, toggleFilter, removeAllFilter } from '../store';

type Filters = { name: string; filters: { name: string; filter: Filter }[] }[];

@connectStore(bridgeStore)
@customElement('bridge-panel-filter')
export class BridgePanelFilterElement extends BridgeBaseElement {
  static filters: Filters = [
    {
      name: 'file type',
      filters: [
        {
          name: 'image',
          filter: (item: Item) => item.type === 'image',
        },
        {
          name: 'file',
          filter: (item: Item) => item.type === 'file',
        },
        {
          name: 'folder',
          filter: (item: Item) => item.type === 'folder',
        },
      ],
    },
    {
      name: 'orientation',
      filters: [
        {
          name: 'landscape',
          filter: (item: Item) => {
            if (item.type === 'image') {
              return (item.width as number) > (item.height as number);
            }
          },
        },
        {
          name: 'portrait',
          filter: (item: Item) => {
            if (item.type === 'image') {
              return (item.width as number) < (item.height as number);
            }
          },
        },
      ],
    },
  ];

  #toggleFilter = (filter: Filter) => {
    toggleFilter(filter);
  };

  #onContextMenu = ({ x, y }: MouseEvent) => {
    this.openContextMenu({
      activeElement: this,
      x,
      y,
      menu: [
        {
          text: 'clean all filter',
          handle: removeAllFilter,
        },
      ],
    });
  };

  mounted = () => {
    this.addEventListener('contextmenu', this.#onContextMenu);
  };

  render() {
    return html`
      <style>
        :host {
          display: block;
          min-height: 100%;
        }
      </style>
      ${BridgePanelFilterElement.filters.map(
        (filterGroup) => html`
          <details>
            <summary>${filterGroup.name}</summary>
            <ul>
              ${filterGroup.filters.map(
                ({ name, filter }) =>
                  html`<li @click=${() => this.#toggleFilter(filter)}>
                    ${bridgeStore.filters.has(filter) ? '0' : ''}${name}
                  </li>`,
              )}
            </ul>
          </details>
        `,
      )}
    `;
  }
}
