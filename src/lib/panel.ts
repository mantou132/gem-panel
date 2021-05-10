import { TemplateResult } from '@mantou/gem';
import { MenuItem } from '../elements/menu';
import { Window } from './layout';

export type PanelContent = TemplateResult | HTMLElement | string;
export type GetPanelContent = (panelName: string) => Promise<PanelContent>;

interface PanelDetail {
  title?: string;
  content?: PanelContent;
  placeholder?: PanelContent;
  windowType?: string;
  getContent?: GetPanelContent;
  getMenu?: (window: Window, panel: Panel) => Promise<MenuItem[]>;
}
export class Panel {
  name: string;
  detail: PanelDetail;

  get title() {
    return this.detail.title;
  }

  get content() {
    return this.detail.content;
  }

  get placeholder() {
    return this.detail.placeholder;
  }

  get windowType() {
    return this.detail.windowType;
  }

  get getContent() {
    return this.detail.getContent;
  }

  get getMenu() {
    return this.detail.getMenu;
  }

  constructor(name: string, detail: PanelDetail) {
    this.name = name;
    this.detail = detail;
  }
}
