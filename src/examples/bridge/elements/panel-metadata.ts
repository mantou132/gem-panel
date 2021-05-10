import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore, Item } from '../store';

@connectStore(bridgeStore)
@customElement('bridge-panel-metadata')
export class BridgePanelMetadataElement extends GemElement {
  render() {
    const [item] = [...bridgeStore.selection];
    if (!item) return null;
    const keys: (keyof Item)[] = ['filename', 'type', 'modifiedTime'];
    return html` ${keys.map((key) => html`<div>${key}: ${item[key]}</div>`)} `;
  }
}
