import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { Panel, Window } from '../lib/config';
import { closePanel, store } from '../lib/store';

@customElement('gem-panel-title')
@connectStore(store)
export class GemPanelTitleElement extends GemElement {
  window: Window;
  panel: Panel;

  #closeHandle = (evt: Event) => {
    const { window, panel } = this;
    evt.stopPropagation();
    closePanel({ window, panel });
  };

  render = () => {
    return html`
      <style>
        .close-btn:hover {
          background: gray;
        }
      </style>
      <slot></slot>
      <span class="close-btn" @click=${this.#closeHandle}>x</span>
    `;
  };
}
