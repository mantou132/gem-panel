import { TemplateResult, html } from '@mantou/gem';
import { getNewFocusElementIndex } from './utils';

type PannelContent = TemplateResult | string;

export class Panel {
  title: string;
  content: PannelContent;

  static parse(obj: Panel) {
    const { title, content } = obj;
    return new Panel(
      title,
      typeof content === 'string' ? html([content] as any) : html(content.strings, ...content.values),
    );
  }

  constructor(title = 'No title', content: PannelContent = `No content provided`) {
    this.title = title;
    this.content = typeof content === 'string' ? html([content] as any) : content;
  }
}

interface WindowOptional {
  gridArea?: string;
  current?: number;
}

export class Window implements WindowOptional {
  gridArea?: string;
  current?: number;
  panels: Panel[];

  static parse(obj: Window) {
    const { gridArea, current, panels = [] } = obj;
    return new Window(panels.map(Panel.parse), { gridArea, current });
  }

  constructor(panels: Panel[] = [], optional: WindowOptional = {}) {
    const { gridArea = '', current = 0 } = optional;
    this.gridArea = gridArea;
    this.current = current;
    this.panels = panels;
  }

  changeCurrent(index: number) {
    this.current = index;
  }
}

interface ConfigOptional {
  gridTemplateAreas?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
}

const defaultLayout: ConfigOptional[] = [
  {
    gridTemplateAreas: `"a"`,
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr',
  },
  {
    gridTemplateAreas: `"a b"`,
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr 1fr',
  },
  {
    gridTemplateAreas: `
      "a b"
      "a c"
    `,
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '1fr 1fr',
  },
  {
    gridTemplateAreas: `
      "a b"
      "c d"
    `,
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '1fr 1fr',
  },
  {
    gridTemplateAreas: `
      "a d"
      "b d"
      "b e"
      "c e"
    `,
    gridTemplateRows: '2fr 1fr 1fr 2fr',
    gridTemplateColumns: '1fr 1fr',
  },
  {
    gridTemplateAreas: `
      "a b"
      "c d"
      "e f"
    `,
    gridTemplateRows: '1fr 1fr 1fr',
    gridTemplateColumns: '1fr 1fr',
  },
  {
    gridTemplateAreas: `
      "a d"
      "a e"
      "b e"
      "b f"
      "c f"
      "c g"
    `,
    gridTemplateRows: '3fr 1fr 2fr 2fr 1fr 3fr',
    gridTemplateColumns: '1fr 1fr',
  },
];

export class Config implements ConfigOptional {
  gridTemplateAreas?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  windows: Window[];
  // hidden
  panels: Panel[];

  #areas: string[][];
  #rows: number[];
  #columns: number[];

  #findAreas = (window: Window) => {
    const areas: [number, number][] = [];
    this.#areas.forEach((row, y) => {
      row.forEach((area, x) => {
        if (area === window.gridArea) {
          areas.push([x, y]);
        }
      });
    });
    return areas;
  };

  #parseAreas = (gridTemplateAreas: string) => {
    this.#areas = gridTemplateAreas
      .split(/\s*["'\n]/)
      .filter((e) => e !== '')
      .map((e) => e.split(/\s+/));
  };

  #parseRows = (gridTemplateRows: string) => {
    this.#rows = this.#parseGridTemplate(gridTemplateRows);
  };

  #parseColumns = (gridTemplateColumns: string) => {
    this.#columns = this.#parseGridTemplate(gridTemplateColumns);
  };

  #parseGridTemplate = (gridTemplate: string) =>
    gridTemplate
      .split(/\s+/)
      .filter((e) => e !== '')
      .map(parseFloat);

  #stringifyGridTemplate = (arr: number[]) => arr.map((e) => `${e}fr`).join(' ');

  static parse(obj: any) {
    const {
      gridTemplateAreas,
      gridTemplateRows,
      gridTemplateColumns,
      windows = [],
      panels = [],
    } = obj as Partial<Config>;
    return new Config(windows.map(Window.parse), panels.map(Panel.parse), {
      gridTemplateAreas,
      gridTemplateRows,
      gridTemplateColumns,
    });
  }

  constructor(windows: Window[] = [], panels: Panel[] = [], optional: ConfigOptional = {}) {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns } = optional;
    const dl = defaultLayout[windows.length - 1] || defaultLayout[0];
    this.gridTemplateAreas = gridTemplateAreas || dl.gridTemplateAreas;
    this.#parseAreas(this.gridTemplateAreas!);
    this.gridTemplateRows = gridTemplateRows || dl.gridTemplateRows;
    this.#parseRows(this.gridTemplateRows!);
    this.gridTemplateColumns = gridTemplateColumns || dl.gridTemplateColumns;
    this.#parseColumns(this.gridTemplateColumns!);

    windows.forEach((w, i) => {
      if (!w.gridArea) {
        w.gridArea = [...new Set(this.#areas.flat())][i];
      }
    });

    this.windows = windows;
    this.panels = panels;
  }

  closePanel(window: Window, panel: Panel) {
    const panelIndex = window.panels.findIndex((e) => e === panel);
    const closerIndex = getNewFocusElementIndex(window.panels, window.current || 0, panelIndex);
    if (closerIndex >= 0) {
      window.current = closerIndex;
    } else {
      // TODO: remove window
    }
    window.panels.splice(panelIndex, 1);
    this.panels.push(panel);
  }

  moveHAxis(axisIndex: number, fr: number) {
    this.#rows[axisIndex - 1] += fr;
    this.#rows[axisIndex] -= fr;
    this.gridTemplateRows = this.#stringifyGridTemplate(this.#rows);
  }

  moveVAxis(axisIndex: number, fr: number) {
    this.#columns[axisIndex - 1] += fr;
    this.#columns[axisIndex] -= fr;
    this.gridTemplateColumns = this.#stringifyGridTemplate(this.#columns);
  }

  findHAxis(window: Window) {
    let index = 0;
    this.#areas.forEach((row, i) => {
      if (row.includes(window.gridArea!)) {
        index = i;
      }
    });
    return index;
  }

  findVAxis(window: Window) {
    let index = 0;
    this.#areas.forEach((row) => {
      const i = row.lastIndexOf(window.gridArea!);
      if (i > index) index = i;
    });
    return index;
  }

  getWindowHeight(window: Window) {
    const areas = this.#findAreas(window);
    return [...new Set(areas.map((area) => area[1]))].reduce((p, c) => {
      return p + this.#rows[c];
    }, 0);
  }

  getWindowWidth(window: Window) {
    const areas = this.#findAreas(window);
    return [...new Set(areas.map((area) => area[0]))].reduce((p, c) => {
      return p + this.#columns[c];
    }, 0);
  }
}
