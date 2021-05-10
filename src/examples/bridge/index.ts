import { render, html } from '@mantou/gem';

import './elements/root';

render(
  html`
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
    </style>
    <bridge-root></bridge-root>
  `,
  document.body,
);
