import { TemplateResult, html, randomStr } from '@mantou/gem';
import { DEFAULT_DIMENSION, DEFAULT_GAP, DEFAULT_POSITION } from './const';
import { Side } from '../elements/window';
import { findLimintPosition, getNewFocusElementIndex, isEqualArray, removeItem } from './utils';

type PannelContent = TemplateResult | string;

let id = 1;

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

  static parse({ gridArea, current, panels = [], position, dimension }: Window) {
    return new Window(panels.map(Panel.parse), { gridArea, current, position, dimension });
  }

  constructor(panels: Panel[] = [], optional: WindowOptional = {}) {
    const { gridArea = '', current = 0, position, dimension, zIndex = 1 } = optional;
    this.gridArea = gridArea;
    this.current = current;
    this.panels = panels;
    this.zIndex = zIndex;
    if (position || dimension) {
      this.position = position || DEFAULT_POSITION;
      this.dimension = dimension || DEFAULT_DIMENSION;
    }
  }

  isGridWindow() {
    return !this.position && !this.dimension;
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

  setGridArea(area: string) {
    this.position = undefined;
    this.dimension = undefined;
    this.gridArea = area;
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

  #areas: string[][]; // Optimization: Flip the object to modify it
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
    const height = rows.map((rowIndex) => this.#rows[rowIndex]).reduce((p, c) => p + c, 0);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const columns = [...new Set(areas.map((area) => area[0]))];
    const width = columns.map((columnIndex) => this.#columns[columnIndex]).reduce((p, c) => p + c, 0);
    const minColumn = Math.min(...columns);
    const maxColumn = Math.max(...columns);
    return { minRow, maxRow, minColumn, maxColumn, rows, columns, height, width };
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

  #stringifyGridTemplate = () => {
    this.#stringifyGridTemplateAreas();
    this.#stringifyGridTemplateRows();
    this.#stringifyGridTemplateColumns();
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
    this.#stringifyGridTemplate();
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

  #stringifyGridTemplateAxis = (arr: number[]) => arr.map((e) => `${e}fr`).join(' ');

  #stringifyGridTemplateRows = () => {
    this.gridTemplateRows = this.#stringifyGridTemplateAxis(this.#rows);
  };

  #stringifyGridTemplateColumns = () => {
    this.gridTemplateColumns = this.#stringifyGridTemplateAxis(this.#columns);
  };

  static parse(str: string) {
    const obj = JSON.parse(str) as Partial<Config> | null;
    if (!obj) return;
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, windows = [], panels = [] } = obj;
    return new Config(windows.map(Window.parse), panels.map(Panel.parse), {
      gridTemplateAreas,
      gridTemplateRows,
      gridTemplateColumns,
    });
  }

  constructor(allWindows: Window[] = [], panels: Panel[] = [], optional: ConfigOptional = {}) {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns } = optional;
    const windows = allWindows.filter((w) => w.isGridWindow());
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

  changeWindowDimension(window: Window, [x, y]: [number, number]) {
    const [originW = 0, originH = 0] = window.dimension || [];
    window.dimension = [originW + x, originH + y];
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

  createWindow(window: Window, hoverWindow: Window, side: Side) {
    const areas = this.#findAreas(hoverWindow);
    const { rows, columns, width, height } = this.#findAreasBoundary(areas);
    const gridArea = `a${randomStr()}${id++}`;

    if (side === 'top' || side === 'bottom') {
      const heightRows = rows.map((rowIndex) => this.#rows[rowIndex]);
      const { index, margin } = findLimintPosition(heightRows, height / 2);
      const limitRowIndex = rows[index];
      this.#areas.splice(limitRowIndex, 0, [...this.#areas[limitRowIndex]]);
      columns.forEach((columnIndex) => {
        rows.forEach((rowIndex, i) => {
          if (side === 'top') {
            if (i <= index) {
              this.#areas[rowIndex][columnIndex] = gridArea;
            }
          } else {
            if (i >= index) {
              this.#areas[rowIndex + 1][columnIndex] = gridArea;
            }
          }
        });
      });
      this.#rows.splice(limitRowIndex, 1, this.#rows[limitRowIndex] - margin, margin);
    }
    if (side === 'right' || side === 'left') {
      const widthColumns = columns.map((columnIndex) => this.#columns[columnIndex]);
      const { index, margin } = findLimintPosition(widthColumns, width / 2);
      const limitColumnIndex = columns[index];
      this.#areas.forEach((row) => row.splice(limitColumnIndex, 0, row[limitColumnIndex]));
      rows.forEach((rowIndex) => {
        this.#areas[rowIndex][side === 'left' ? limitColumnIndex : limitColumnIndex + 1] = gridArea;
        columns.forEach((columnIndex, i) => {
          if (side === 'left') {
            if (i <= index) {
              this.#areas[rowIndex][columnIndex] = gridArea;
            }
          } else {
            if (i >= index) {
              this.#areas[rowIndex][columnIndex + 1] = gridArea;
            }
          }
        });
      });
      this.#columns.splice(limitColumnIndex, 1, this.#columns[limitColumnIndex] - margin, margin);
    }

    window.setGridArea(gridArea);
    this.#stringifyGridTemplate();
  }

  createIndependentWindow(window: Window | null, panel: Panel, [x, y, w, h]: [number, number, number, number]) {
    const newWindow = new Window([panel], { position: [x, y], dimension: [w, h] });
    this.focusWindow(newWindow);
    this.windows.push(newWindow);
    if (window) this.closePanel(window, panel);
    return newWindow;
  }

  openHiddenPanel(panel: Panel) {
    removeItem(this.panels, panel);
    const getPosition = (position: [number, number]): [number, number] => {
      const window = this.windows.find((w) => w.position && isEqualArray(w.position, position));
      return window ? getPosition([position[0] + DEFAULT_GAP, position[1] + DEFAULT_GAP]) : position;
    };
    this.createIndependentWindow(null, panel, [...getPosition(DEFAULT_POSITION), ...DEFAULT_DIMENSION]);
  }

  openPanelInWindow(panel: Panel, window: Window) {
    window.changeCurrent(window.panels.push(panel) - 1);
    removeItem(this.panels, panel);
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

  moveSide(window: Window, side: Side, [movementXPercent, movementYPercent, gapWPercent, gapHPercent]: number[]) {
    const { minRow, minColumn, maxRow, maxColumn, width, height } = this.#findAreasBoundary(this.#findAreas(window));

    if (side === 'top' || side === 'bottom') {
      const movementY = movementYPercent * height;
      const gapY = gapHPercent * height;
      const index = side === 'top' ? minRow : maxRow + 1;
      const newRow = this.#rows[index - 1] + movementY;
      const newNextRow = this.#rows[index] - movementY;
      if (newRow < 0) {
        if (-newRow - gapY < 0) return;
        this.#rows[index - 2] += newRow;
        this.#rows[index - 1] = -newRow - gapY;
        this.#rows[index] = newNextRow + newRow + gapY;
        this.#areas[index - 1].forEach((_, columnIndex) => {
          if (columnIndex < minColumn || columnIndex > maxColumn) {
            this.#areas[index - 1][columnIndex] = this.#areas[index - 2][columnIndex];
          } else {
            this.#areas[index - 1][columnIndex] = this.#areas[index][columnIndex];
          }
        });
      } else if (newNextRow < 0) {
        if (-newNextRow - gapY < 0) return;
        this.#rows[index - 1] = newRow + newNextRow + gapY;
        this.#rows[index] = -newNextRow - gapY;
        this.#rows[index + 1] += newNextRow;
        this.#areas[index].forEach((_, columnIndex) => {
          if (columnIndex < minColumn || columnIndex > maxColumn) {
            this.#areas[index][columnIndex] = this.#areas[index + 1][columnIndex];
          } else {
            this.#areas[index][columnIndex] = this.#areas[index - 1][columnIndex];
          }
        });
      } else {
        this.#rows[index - 1] = newRow;
        this.#rows[index] = newNextRow;
      }
    } else {
      const movementX = movementXPercent * width;
      const gapX = gapWPercent * width;
      const index = side === 'left' ? minColumn : maxColumn + 1;
      const newColumn = this.#columns[index - 1] + movementX;
      const newNextColumn = this.#columns[index] - movementX;
      if (newColumn < 0) {
        if (-newColumn - gapX < 0) return;
        this.#columns[index - 2] += newColumn;
        this.#columns[index - 1] = -newColumn - gapX;
        this.#columns[index] = newNextColumn + newColumn + gapX;
        this.#areas.forEach((_, rowIndex) => {
          if (rowIndex < minRow || rowIndex > maxRow) {
            this.#areas[rowIndex][index - 1] = this.#areas[rowIndex][index - 2];
          } else {
            this.#areas[rowIndex][index - 1] = this.#areas[rowIndex][index];
          }
        });
      } else if (newNextColumn < 0) {
        if (-newNextColumn - gapX < 0) return;
        this.#columns[index - 1] = newColumn + newNextColumn + gapX;
        this.#columns[index] = -newNextColumn - gapX;
        this.#columns[index + 1] += newNextColumn;
        this.#areas.forEach((_, rowIndex) => {
          if (rowIndex < minRow || rowIndex > maxRow) {
            this.#areas[rowIndex][index] = this.#areas[rowIndex][index + 1];
          } else {
            this.#areas[rowIndex][index] = this.#areas[rowIndex][index - 1];
          }
        });
      } else {
        this.#columns[index - 1] += movementX;
        this.#columns[index] -= movementX;
      }
    }
    this.#stringifyGridTemplate();
  }
}
