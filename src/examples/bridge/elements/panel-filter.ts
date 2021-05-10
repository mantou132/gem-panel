import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore, getCurrentFolder, Type } from '../store';

const orientations = ['landscape', 'portrait'] as const;
type Orientation = typeof orientations[number];

@connectStore(bridgeStore)
@customElement('bridge-panel-filter')
export class BridgePanelFilterElement extends GemElement {
  render() {
    const folder = getCurrentFolder();
    if (!folder.content) return null;
    const items = Object.values(folder.content);
    const types: Set<Type> = new Set();
    const orientations: Set<Orientation> = new Set();
    items.forEach((item) => {
      types.add(item.type);
      if (item.type === 'image') {
        orientations.add(item.width! > item.height! ? 'landscape' : 'portrait');
      }
    });
    return html`
      <details>
        <summary>File type</summary>
        <ul>
          ${[...types].map((type) => html`<li>${type}</li>`)}
        </ul>
      </details>
      <details>
        <summary>Orientation</summary>
        <ul>
          ${[...orientations].map((orientation) => html`<li>${orientation}</li>`)}
        </ul>
      </details>
    `;
  }
}
