import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore, Item, Filter, toggleFilter } from '../store';

type Filters = { name: string; filters: { name: string; filter: Filter }[] }[];

@connectStore(bridgeStore)
@customElement('bridge-panel-filter')
export class BridgePanelFilterElement extends GemElement {
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
              return item.width! > item.height!;
            }
          },
        },
        {
          name: 'portrait',
          filter: (item: Item) => {
            if (item.type === 'image') {
              return item.width! < item.height!;
            }
          },
        },
      ],
    },
  ];

  #toggleFilter = (filter: Filter) => {
    toggleFilter(filter);
  };

  render() {
    return html`
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
