# gem-panel

## Properties

| Property              | Attribute       | Modifiers | Type                                                                                                                                                                                                                                                                 | Default  |
| --------------------- | --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `cache`               | `cache`         |           | `boolean`                                                                                                                                                                                                                                                            |          |
| `cacheVersion`        | `cache-version` |           | `string`                                                                                                                                                                                                                                                             |          |
| `config`              |                 |           | `Config \| undefined`                                                                                                                                                                                                                                                | "config" |
| `theme`               |                 |           | `Partial<SomeType<{ fontSize: string; fontFamily: string; primaryColor: string; secondaryColor: string; focusColor: string; borderColor: string; backgroundColor: string; darkBackgroundColor: string; windowGap: string; panelContentGap: string; }>> \| undefined` |          |
| `openPanelMenuBefore` |                 |           | `OpenPanelMenuBeforeCallback \| undefined`                                                                                                                                                                                                                           |          |
| `activePanels`        |                 | readonly  | `Panel[]`                                                                                                                                                                                                                                                            |          |
| `hiddenPanels`        |                 | readonly  | `Panel[]`                                                                                                                                                                                                                                                            |          |
| `showPanels`          |                 | readonly  | `Panel[]`                                                                                                                                                                                                                                                            |          |

## Methods

| Method               | Type                                                   |
| -------------------- | ------------------------------------------------------ |
| `clearCache`         | `(): void`                                             |
| `closePanel`         | `(arg: string \| Panel): void`                         |
| `addPanel`           | `(panel: Panel): void`                                 |
| `deletePanel`        | `(arg: string \| Panel): void`                         |
| `loadContentInPanel` | `(arg: string \| Panel, content: PannelContent): void` |
| `openHiddenPanel`    | `(arg: string \| Panel): void`                         |
| `openPanelInWindow`  | `(arg: string \| Panel, window: Window): void`         |
| `updateAllPanel`     | `(): void`                                             |

## Events

| Event          |
| -------------- |
| `panel-change` |

## Parts

| Part                 |
| -------------------- |
| `window`             |
| `fixed-window`       |
| `cell-window`        |
| `window-bar`         |
| `panel-header`       |
| `panel-title`        |
| `panel-active-title` |
| `panel-drag-title`   |
| `panel-content`      |
| `panel-button`       |
| `panel-loader`       |
| `menu`               |
| `menu-item`          |

## Type

```ts
export declare const theme: {
  fontSize: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  focusColor: string;
  borderColor: string;
  backgroundColor: string;
  darkBackgroundColor: string;
  windowGap: string;
  panelContentGap: string;
};
export declare type Theme = Partial<typeof theme>;
export declare type PannelContent = TemplateResult | string;
export declare class Panel {
  title: string;
  content?: PannelContent;
  constructor(title?: string, content?: PannelContent);
}
interface WindowOptional {
  gridArea?: string;
  current?: number;
  position?: [number, number];
  zIndex?: number;
  dimension?: [number, number];
}
export declare class Window implements WindowOptional {
  constructor(panels?: Panel[], optional?: WindowOptional);
}
interface ConfigOptional {
  gridTemplateAreas?: string;
  gridTemplateRows?: string;
  gridTemplateColumns?: string;
}
export declare class Config implements ConfigOptional {
  constructor(allWindows?: Window[], panels?: Panel[], optional?: ConfigOptional);
}
```
