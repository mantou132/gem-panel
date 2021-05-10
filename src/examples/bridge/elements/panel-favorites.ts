import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore } from '../store';

@connectStore(bridgeStore)
@customElement('bridge-panel-favorites')
export class BridgePanelFavoritesElement extends GemElement {
  render() {
    return html``;
  }
}
