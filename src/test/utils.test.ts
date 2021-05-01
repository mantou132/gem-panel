import { expect } from '@open-wc/testing';
import add from '../lib/utils';

describe('utils 测试', () => {
  it('2 add 3 = 5', () => {
    expect(add(2, 3)).to.equal(5);
  });
});
