import { html, GemElement } from '@mantou/gem';

export default class Switch extends GemElement {
  get content() {
    return 'content';
  }
  render() {
    return html`lib-switch`;
  }
}

customElements.define('lib-switch', Switch);
