import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore } from '../store';

@connectStore(bridgeStore)
@customElement('bridge-panel-folders')
export class BridgePanelFoldersElement extends GemElement {
  render() {
    return html`folders`;
  }
}
