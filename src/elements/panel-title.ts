import { html, GemElement, customElement, connectStore } from '@mantou/gem';
import { Config, Panel, Window } from '../lib/config';
import { closePanel, store } from '../store';

@customElement('gem-panel-title')
@connectStore(store)
export class GemPanelTitleElement extends GemElement {
  config: Config;
  window: Window;
  panel: Panel;

  #closeHandle = (evt: Event) => {
    evt.stopPropagation();
    closePanel(this);
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
