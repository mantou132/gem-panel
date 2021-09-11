import { TemplateResult } from '@mantou/gem';
import { MenuItem } from '../elements/menu';
import { Window } from './layout';

export type PanelContent = TemplateResult | HTMLElement | string;
export type GetPanelContent = (panelName: string) => Promise<PanelContent>;

interface PanelDetail {
  title?: string;
  content?: PanelContent;
  placeholder?: PanelContent;
  getContent?: GetPanelContent;
  // null: disable menu button
  getMenu?: null | ((window: Window, panel: Panel, defaultMenus: MenuItem[]) => Promise<MenuItem[]>);
}

export class Panel implements PanelDetail {
  name: string;
  title?: string;
  content?: PanelContent;
  placeholder?: PanelContent;
  getContent?: GetPanelContent;
  getMenu?: null | ((window: Window, panel: Panel, defaultMenus: MenuItem[]) => Promise<MenuItem[]>);

  constructor(name: string, detail: PanelDetail) {
    this.name = name;
    Object.assign(this, detail);
  }
}
