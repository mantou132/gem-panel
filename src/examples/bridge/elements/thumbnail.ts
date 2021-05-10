import { customElement, GemElement, html, property } from '@mantou/gem';
import { Item, Type } from '../store';

const colorMap: { [key in Type]: string } = {
  image: 'ccc',
  folder: '74d0fb',
  file: '666',
};

@customElement('bridge-thumbnail')
export class BridgeThumbnailElement extends GemElement {
  @property data: Item;

  render() {
    const { filename, src, type } = this.data;
    const color = colorMap[type];
    return html`
      <style>
        :host {
          display: grid;
          padding: 0.2em;
        }
        img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: contain;
        }
        .title {
          text-align: center;
          padding: 0.2em 1em;
        }
      </style>
      <img src=${src || `https://via.placeholder.com/60x60/${color}?text=${type}`} />
      <div class="title">${filename}</div>
    `;
  }
}
