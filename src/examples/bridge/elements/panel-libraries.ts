import { connectStore, customElement, GemElement, html } from '@mantou/gem';
import { bridgeStore } from '../store';

@connectStore(bridgeStore)
@customElement('bridge-panel-libraries')
export class BridgePanelLibrariesElement extends GemElement {
  render() {
    return html`libraries`;
  }
}
