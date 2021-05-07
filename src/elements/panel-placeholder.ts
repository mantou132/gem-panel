import { html, GemElement, customElement, attribute } from '@mantou/gem';
import { theme } from '../lib/theme';

@customElement('gem-panel-placeholder')
export class GemPanelPlaceholderElement extends GemElement {
  @attribute exportparts = 'panel-loader';

  render = () => {
    return html`
      <style>
        :host {
          height: 100%;
          display: flex;
          place-content: center;
          place-items: center;
        }
        .loader {
          width: 3em;
          height: 0.4em;
          background: linear-gradient(
            0.25turn,
            ${theme.primaryColor} 0,
            ${theme.primaryColor} 0.8em,
            currentColor 0.8em,
            currentColor 100%
          );
          animation: pan 1s linear infinite alternate;
        }
        @keyframes pan {
          to {
            background-position-x: 2.2em;
          }
        }
      </style>
      <div part="panel-loader" class="loader"></div>
    `;
  };
}
