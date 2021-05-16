import { Emitter, GemElement, globalemitter } from '@mantou/gem';
import { MenuItem } from '../../';

export type ContextMenuDetail = { activeElement: HTMLElement | null; x: number; y: number; menu: MenuItem[] };

// Provide some general methods
export class BridgeBaseElement extends GemElement {
  @globalemitter openContextMenu: Emitter<ContextMenuDetail>;
}
