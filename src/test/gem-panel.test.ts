import { expect, fixture } from '@open-wc/testing';
import { GemPanelElement } from '../elements/root';
import { Layout, Window } from '../lib/layout';
import { Panel } from '../lib/panel';

describe('<gem-panel> test', () => {
  it('constructor empty param', () => {
    const ele = new GemPanelElement();
    expect(ele.panels).to.eql(undefined);
    expect(ele.layout).to.eql(undefined);
    expect(ele.hiddenPanels).to.eql([]);
    expect(ele.showPanels).to.eql([]);
    expect(ele.activePanels).to.eql([]);
  });
  it('constructor', async () => {
    const p1 = new Panel('p1', { title: 'p1 title', content: 'p1 content' });
    const panels = [p1];
    const layout = new Layout([new Window([p1])]);
    const ele = new GemPanelElement({ panels, layout });
    expect(ele.panels).to.eql(panels);
    expect(ele.layout).to.eql(layout);
    expect(ele.hiddenPanels).to.eql([]);
    expect(ele.showPanels).to.eql([]);
    expect(ele.activePanels).to.eql([]);
    await fixture(ele);
    expect(ele.showPanels).to.eql(panels);
    expect(ele.activePanels).to.eql(panels);
  });
});
