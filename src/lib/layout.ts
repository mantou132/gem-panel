import { randomStr } from '@mantou/gem';

import { MoveSideArgs, Side } from '../elements/window-handle';

import { Panel } from './panel';
import {
  WINDOW_DEFAULT_DIMENSION,
  WINDOW_DEFAULT_GAP,
  WINDOW_DEFAULT_POSITION,
  WINDOW_MIN_HEIGHT,
  WINDOW_MIN_WIDTH,
} from './const';
import {
  findLimintPosition,
  getFlipMatrix,
  getNewFocusElementIndex,
  isEqualArray,
  removeItem,
  swapPosition,
} from './utils';

interface WindowOptional {
  type?: string;
  gridArea?: string;
  current?: number;
  position?: [number, number];
  zIndex?: number;
  dimension?: [number, number];
}

export class Window implements WindowOptional {
  id: string;
  type?: string;
  gridArea?: string;
  current: number;
  position?: [number, number];
  zIndex: number; // No cache
  dimension?: [number, number];
  panels: string[];

  static parse({ gridArea, current = 0, panels = [], position, dimension, type }: Window) {
    return new Window(panels, { gridArea, current, position, dimension, type });
  }

  constructor(panels: (string | Panel)[] = [], optional: WindowOptional = {}) {
    const { gridArea = '', current = 0, position, dimension, zIndex = 1, type } = optional;
    this.id = randomStr();
    this.zIndex = zIndex + 10;
    this.current = current;
    this.gridArea = gridArea;
    this.type = type;
    this.panels = [...new Set(panels.map((p) => (typeof p === 'string' ? p : p.name)))];
    if (position || dimension) {
      this.position = position || WINDOW_DEFAULT_POSITION;
      this.dimension = dimension || WINDOW_DEFAULT_DIMENSION;
    }
  }

  isGridWindow() {
    return !this.position && !this.dimension;
  }

  changeCurrent(index: number) {
    this.current = index;
  }

  changePanelSort(p1: string, p2: string) {
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

interface LayoutOptional {
  gridTemplateAreas?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
}

const defaultLayout: Required<LayoutOptional>[] = [
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

export class Layout implements LayoutOptional {
  gridTemplateAreas?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
  windows: Window[];

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

  #getNewGridArea = () => `a${randomStr()}${Layout.id++}`;

  static parse(str: string) {
    const obj = JSON.parse(str) as Partial<Layout> | null;
    if (!obj) return;
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns, windows = [] } = obj;
    return new Layout(windows.map(Window.parse), {
      gridTemplateAreas,
      gridTemplateRows,
      gridTemplateColumns,
    });
  }
  static id = 1;

  constructor(allWindows: Window[] = [], optional: LayoutOptional = {}) {
    const { gridTemplateAreas, gridTemplateRows, gridTemplateColumns } = optional;
    const windows = allWindows.filter((w) => w.isGridWindow());
    const dl = defaultLayout[windows.length - 1] || defaultLayout[0];
    this.gridTemplateAreas = gridTemplateAreas || dl.gridTemplateAreas;
    this.#parseAreas(this.gridTemplateAreas);
    this.gridTemplateRows = gridTemplateRows || dl.gridTemplateRows;
    this.#parseRows(this.gridTemplateRows);
    this.gridTemplateColumns = gridTemplateColumns || dl.gridTemplateColumns;
    this.#parseColumns(this.gridTemplateColumns);

    windows.forEach((w, i) => {
      if (!w.gridArea) {
        w.gridArea = [...new Set(this.#areas.flat())][i];
      }
    });

    this.windows = allWindows;
  }

  moveWindow(window: Window, [x, y]: [number, number]) {
    const [originX = 0, originY = 0] = window.position || [];
    window.position = [Math.max(originX + x, 0), Math.max(originY + y, 0)];
  }

  changeWindowRect(window: Window, [mx, my, mw, mh]: [number, number, number, number]) {
    const [originX = 0, originY = 0] = window.position || [];
    const [originW = 0, originH = 0] = window.dimension || [];
    const w = originW + mw;
    const h = originH + mh;
    const x = w < WINDOW_MIN_WIDTH ? originX : originX + mx;
    const y = h < WINDOW_MIN_HEIGHT ? originY : originY + my;
    window.position = [Math.max(x, 0), Math.max(y, 0)];
    window.dimension = [w < WINDOW_MIN_WIDTH || x < 0 ? originW : w, h < WINDOW_MIN_HEIGHT || y < 0 ? originH : h];
  }

  focusWindow(window: Window) {
    if (window.isGridWindow()) return false;
    const maxZIndex = Math.max(...this.windows.filter((w) => w !== window).map((w) => w.zIndex));
    if (window.zIndex > maxZIndex) return false;
    window.zIndex = maxZIndex + 1;
    return true;
  }

  removeWindow(window: Window, newWindowRect?: [number, number, number, number]) {
    if (newWindowRect) {
      const [x, y, w, h] = newWindowRect;
      window.position = [x, y];
      window.dimension = [w, h];
      this.focusWindow(window);
    } else {
      removeItem(this.windows, window);
    }
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
    swapPosition(this.windows, window, target);
    [target.id, window.id] = [window.id, target.id];
    removeItem(this.windows, window);
    const targetLen = target.panels.length;
    target.panels = [...new Set([...target.panels, ...window.panels])];
    target.changeCurrent(targetLen + window.current);
    this.focusWindow(target);
  }

  createGridWindow(window: Window, hoverWindow: Window, side: Side) {
    const areas = this.#findAreas(hoverWindow);
    const { rows, columns, width, height } = this.#findAreasBoundary(areas);
    const gridArea = this.#getNewGridArea();

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

  createIndependentWindow(window: Window | null, panelName: string, [x, y, w, h]: [number, number, number, number]) {
    const newWindow = new Window([panelName], { position: [x, y], dimension: [w, h] });
    this.focusWindow(newWindow);
    this.windows.push(newWindow);
    if (window) {
      if (panelName === window.panels[window.current]) {
        // `repeat` 在 chrome 中不能复用元素，所以手动调整位置
        swapPosition(this.windows, window, newWindow);
        [newWindow.id, window.id] = [window.id, newWindow.id];
      }
      this.closePanel(window, panelName);
    }
    return newWindow;
  }

  openHiddenPanel(panelName: string) {
    const getPosition = (position: [number, number]): [number, number] => {
      const window = this.windows.find((w) => w.position && isEqualArray(w.position, position));
      return window ? getPosition([position[0] + WINDOW_DEFAULT_GAP, position[1] + WINDOW_DEFAULT_GAP]) : position;
    };
    const newWindow = this.createIndependentWindow(null, panelName, [
      ...getPosition(WINDOW_DEFAULT_POSITION),
      ...WINDOW_DEFAULT_DIMENSION,
    ]);
    this.focusWindow(newWindow);
  }

  openPanelInWindow(window: Window, panelName: string) {
    window.changeCurrent(window.panels.push(panelName) - 1);
    this.focusWindow(window);
  }

  closePanel(window: Window, panelName: string) {
    const panelIndex = window.panels.findIndex((e) => e === panelName);
    const closerIndex = getNewFocusElementIndex(window.panels, window.current, panelIndex);
    window.panels.splice(panelIndex, 1);
    if (closerIndex >= 0) {
      window.changeCurrent(closerIndex);
    } else {
      this.removeWindow(window);
    }
  }

  moveSide(window: Window, side: Side, args: MoveSideArgs) {
    const { minRow, minColumn, maxRow, maxColumn, width, height } = this.#findAreasBoundary(this.#findAreas(window));

    const move = (
      rowsFr: number[],
      areas: string[][],
      minRowIndex: number,
      maxRowIndex: number,
      minColumnIndex: number,
      maxColumnIndex: number,
      movementYPx: number,
      heightPx: number,
      heightFr: number,
      maxHeightPx: number,
    ) => {
      const movement = (movementYPx / heightPx) * heightFr;
      const gap = (args.gap / heightPx) * heightFr;
      const index = side === 'top' || side === 'left' ? minRowIndex : maxRowIndex + 1;
      const shrinked = rowsFr[index - 1] + movement;
      const growed = rowsFr[index] - movement;

      const unit = heightPx / heightFr;
      const checkIndex = movementYPx > 0 ? index : index - 1;
      const area = [...new Set(areas[checkIndex])];
      for (let i = 0; i < area.length; i++) {
        const siblingHeightPx =
          this.#findAreasBoundary(this.#findAreas(area[i]))[side === 'top' || side === 'bottom' ? 'height' : 'width'] *
          unit;
        if (siblingHeightPx < maxHeightPx) return;
      }

      if (shrinked < 0 || growed < 0) {
        let small = 0;
        let big = 0;
        let r1 = 0;
        let r2 = 0;
        let r3 = 0;
        if (shrinked < 0) {
          [small, big, r3, r2, r1] = [shrinked, growed, index - 2, index - 1, index];
        } else if (growed < 0) {
          [small, big, r3, r2, r1] = [growed, shrinked, index + 1, index, index - 1];
        }
        if (-small - gap < 0) return;
        rowsFr[r1] = big + small + gap;
        rowsFr[r2] = -small - gap;
        rowsFr[r3] += small;
        areas[r2].forEach((_, columnIndex) => {
          if (columnIndex < minColumnIndex || columnIndex > maxColumnIndex) {
            areas[r2][columnIndex] = areas[r3][columnIndex];
          } else {
            areas[r2][columnIndex] = areas[r1][columnIndex];
          }
        });
      } else {
        rowsFr[index - 1] = shrinked;
        rowsFr[index] = growed;
      }
    };

    if (side === 'top' || side === 'bottom') {
      move(
        this.#rows,
        this.#areas,
        minRow,
        maxRow,
        minColumn,
        maxColumn,
        args.movementY,
        args.height,
        height,
        WINDOW_MIN_HEIGHT,
      );
    } else {
      move(
        this.#columns,
        getFlipMatrix(this.#areas),
        minColumn,
        maxColumn,
        minRow,
        maxRow,
        args.movementX,
        args.width,
        width,
        WINDOW_MIN_WIDTH,
      );
    }
    this.#stringifyGridTemplate();
  }
}
