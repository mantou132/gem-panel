import { TemplateResult, html } from '@mantou/gem';
import { getNewFocusElementIndex, isEqualArray, removeItem } from './utils';

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
  position?: [number, number];
  zIndex?: number;
  dimension?: [number, number];
}

export class Window implements WindowOptional {
  gridArea?: string;
  current?: number;
  position?: [number, number];
  zIndex?: number;
  dimension?: [number, number];
  panels: Panel[];

  static parse(obj: Window) {
    const { gridArea, current, panels = [] } = obj;
    return new Window(panels.map(Panel.parse), { gridArea, current });
  }

  constructor(panels: Panel[] = [], optional: WindowOptional = {}) {
    const { gridArea = '', current = 0, position, dimension, zIndex = 1 } = optional;
    this.gridArea = gridArea;
    this.current = current;
    this.panels = panels;
    this.zIndex = zIndex;
    if (position || dimension) {
      this.position = position || [100, 100];
      this.dimension = dimension || [300, 150];
    }
  }

  changeCurrent(index: number) {
    this.current = index;
  }

  changePanelSort(p1: Panel, p2: Panel) {
    const p1Index = this.panels.findIndex((e) => e === p1);
    const p2Index = this.panels.findIndex((e) => e === p2);
    [this.panels[p1Index], this.panels[p2Index]] = [p2, p1];
    if (this.current === p1Index) {
      this.changeCurrent(p2Index);
    } else if (this.current === p2Index) {
      this.changeCurrent(p1Index);
    }
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

  #findAreas = (window: Window | string) => {
    const areaName = typeof window === 'string' ? window : window.gridArea;
    const areas: [number, number][] = [];
    this.#areas.forEach((row, y) => {
      row.forEach((area, x) => {
        if (area === areaName) {
          areas.push([x, y]);
        }
      });
    });
    return areas;
  };

  #findAreasBoundary = (areas: [number, number][]) => {
    const rows = [...new Set(areas.map((area) => area[1]))];
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const columns = [...new Set(areas.map((area) => area[0]))];
    const minColumn = Math.min(...columns);
    const maxColumn = Math.max(...columns);
    return { minRow, maxRow, minColumn, maxColumn, rows, columns };
  };

  #parseAreas = (gridTemplateAreas: string) => {
    this.#areas = gridTemplateAreas
      .split(/\s*["'\n]/)
      .filter((e) => e.trim() !== '')
      .map((e) => e.split(/\s+/));
  };

  #stringifyGridTemplateAreas = () => {
    this.gridTemplateAreas = this.#areas.map((row) => `"${row.join(' ')}"`).join(' ');
  };

  #optimizationAreas = () => {
    const optimizationRow = () => {
      for (let i = 0; i < this.#areas.length - 1; i++) {
        if (isEqualArray(this.#areas[i], this.#areas[i + 1])) {
          this.#areas.splice(i, 1);
          const deleteRows = this.#rows.splice(i, 2);
          const mergeRow = deleteRows.reduce((p, c) => p + c);
          this.#rows.splice(i, 0, mergeRow);
          optimizationRow();
          break;
        }
      }
    };
    optimizationRow();

    const optimizationColumn = () => {
      for (let i = 0; i < this.#areas[0].length - 1; i++) {
        const currentCol = this.#areas.map((row) => row[i]);
        const nextCol = this.#areas.map((row) => row[i + 1]);
        if (isEqualArray(currentCol, nextCol)) {
          this.#areas.forEach((row) => row.splice(i, 1));
          const deleteColumns = this.#columns.splice(i, 2);
          const mergeColumn = deleteColumns.reduce((p, c) => p + c);
          this.#columns.splice(i, 0, mergeColumn);
          break;
        }
      }
    };
    optimizationColumn();
    this.#stringifyGridTemplateAreas();
    this.#stringifyGridTemplateRows();
    this.#stringifyGridTemplateColumns();
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

  #stringifyGridTemplateRows = () => {
    this.gridTemplateRows = this.#stringifyGridTemplate(this.#rows);
  };

  #stringifyGridTemplateColumns = () => {
    this.gridTemplateColumns = this.#stringifyGridTemplate(this.#columns);
  };

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

  constructor(allWindows: Window[] = [], panels: Panel[] = [], optional: ConfigOptional = {}) {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns } = optional;
    const windows = allWindows.filter(({ position, dimension }) => !position && !dimension);
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

    this.windows = allWindows;
    this.panels = panels;
  }

  moveWindowPosition(window: Window, [x, y]: [number, number]) {
    const [originX = 0, originY = 0] = window.position || [];
    window.position = [originX + x, originY + y];
  }

  focusWindow(window: Window) {
    const maxZIndex = Math.max(...this.windows.map((w) => w.zIndex || 0));
    window.zIndex = maxZIndex + 1;
  }

  removeWindow(window: Window, rect?: [number, number, number, number]) {
    if (rect) {
      const [x, y, w, h] = rect;
      window.position = [x, y];
      window.dimension = [w, h];
      this.focusWindow(window);
    } else {
      removeItem(this.windows, window);
    }
    this.panels.push(...window.panels);
    const areas = this.#findAreas(window);
    const { minRow, maxRow, minColumn, maxColumn, rows, columns } = this.#findAreasBoundary(areas);
    const topAreas = [...new Set(columns.map((column) => this.#areas[minRow - 1]?.[column]).filter((e) => !!e))];
    const leftAreas = [...new Set(rows.map((row) => this.#areas[row][minColumn - 1]).filter((e) => !!e))];
    const rightAreas = [...new Set(rows.map((row) => this.#areas[row][maxColumn + 1]).filter((e) => !!e))];
    const bottomAreas = [...new Set(columns.map((column) => this.#areas[maxRow + 1]?.[column]).filter((e) => !!e))];
    const predicateCol = (area: string) => {
      const areas = this.#findAreas(area);
      const boundary = this.#findAreasBoundary(areas);
      return boundary.minColumn >= minColumn && boundary.maxColumn <= maxColumn;
    };
    const predicateRow = (area: string) => {
      const areas = this.#findAreas(area);
      const boundary = this.#findAreasBoundary(areas);
      return boundary.minRow >= minRow && boundary.maxRow <= maxRow;
    };
    if (topAreas.length && topAreas.every(predicateCol)) {
      areas.forEach(([x, y]) => {
        this.#areas[y][x] = this.#areas[minRow - 1][x];
      });
    } else if (leftAreas.length && leftAreas.every(predicateRow)) {
      areas.forEach(([x, y]) => {
        this.#areas[y][x] = this.#areas[y][minColumn - 1];
      });
    } else if (rightAreas.length && rightAreas.every(predicateRow)) {
      areas.forEach(([x, y]) => {
        this.#areas[y][x] = this.#areas[y][maxColumn + 1];
      });
    } else if (bottomAreas.length && bottomAreas.every(predicateCol)) {
      areas.forEach(([x, y]) => {
        this.#areas[y][x] = this.#areas[maxRow + 1][x];
      });
    }
    this.#optimizationAreas();
  }

  mergeWindow(window: Window, target: Window) {
    removeItem(this.windows, window);
    const targetLen = target.panels.length;
    target.panels.push(...window.panels);
    target.changeCurrent(targetLen + (window.current || 0));
  }

  createIndependentWindow(window: Window, panel: Panel, [x, y, w, h]: [number, number, number, number]) {
    const newWindow = new Window([panel], { position: [x, y], dimension: [w, h] });
    this.focusWindow(newWindow);
    this.windows.push(newWindow);
    this.closePanel(window, panel);
    return newWindow;
  }

  closePanel(window: Window, panel: Panel) {
    const panelIndex = window.panels.findIndex((e) => e === panel);
    const closerIndex = getNewFocusElementIndex(window.panels, window.current || 0, panelIndex);
    window.panels.splice(panelIndex, 1);
    this.panels.push(panel);
    if (closerIndex >= 0) {
      window.changeCurrent(closerIndex);
    } else {
      this.removeWindow(window);
    }
  }

  moveHAxis(axisIndex: number, fr: number) {
    this.#rows[axisIndex - 1] += fr;
    this.#rows[axisIndex] -= fr;
    this.#stringifyGridTemplateRows();
  }

  moveVAxis(axisIndex: number, fr: number) {
    this.#columns[axisIndex - 1] += fr;
    this.#columns[axisIndex] -= fr;
    this.#stringifyGridTemplateColumns();
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
