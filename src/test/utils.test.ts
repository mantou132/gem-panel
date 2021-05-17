import { expect } from '@open-wc/testing';
import {
  getNewFocusElementIndex,
  isEqualArray,
  distance,
  removeItem,
  swapPosition,
  detectPosition,
  findLimintPosition,
  isOutside,
  keyBy,
  exclude,
  getFlipMatrix,
} from '../lib/utils';

describe('utils test', () => {
  it('getNewFocusElementIndex', () => {
    expect(getNewFocusElementIndex(Array(4), 0, 0)).to.equal(0);
    expect(getNewFocusElementIndex(Array(4), 0, 1)).to.equal(0);
    expect(getNewFocusElementIndex(Array(4), 1, 0)).to.equal(0);
    expect(getNewFocusElementIndex(Array(4), 1, 1)).to.equal(1);
  });
  it('isEqualArray', () => {
    expect(isEqualArray([], [])).to.be.true;
    expect(isEqualArray([1], [1])).to.be.true;
    expect(isEqualArray([], [1])).to.be.false;
  });
  it('distance', () => {
    expect(distance(3, 4)).to.equal(5);
  });
  it('removeItem', () => {
    expect(removeItem([1, 2, 3, 4], 2)).to.eql([1, 3, 4]);
  });
  it('swapPosition', () => {
    expect(swapPosition([1, 2, 3, 4], 1, 2)).to.eql([2, 1, 3, 4]);
  });
  it('detectPosition', () => {
    expect(detectPosition([10, 10, 100, 100], [50, 15], 20)).to.equal('top');
    expect(detectPosition([10, 10, 100, 100], [105, 50], 20)).to.equal('right');
    expect(detectPosition([10, 10, 100, 100], [15, 50], 20)).to.equal('left');
    expect(detectPosition([10, 10, 100, 100], [50, 105], 20)).to.equal('bottom');
  });
  it('findLimintPosition', () => {
    expect(findLimintPosition([1, 2, 3, 4], 1)).to.eql({ index: 0, margin: 0 });
    expect(findLimintPosition([1, 2, 3, 4], 2)).to.eql({ index: 1, margin: 1 });
    expect(findLimintPosition([1, 2, 3, 4], 3)).to.eql({ index: 1, margin: 0 });
    expect(findLimintPosition([1, 2, 3, 4], 4)).to.eql({ index: 2, margin: 2 });
  });
  it('isOutside', () => {
    expect(isOutside({ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 10, height: 10 })).to.be.false;
    expect(isOutside({ x: 0, y: 0, width: 100, height: 100 }, { x: 100, y: 10, width: 10, height: 10 })).to.be.true;
    expect(isOutside({ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 100, width: 10, height: 10 })).to.be.true;
    expect(isOutside({ x: 10, y: 10, width: 100, height: 100 }, { x: 0, y: 0, width: 10, height: 10 })).to.be.true;
  });
  it('keyBy', () => {
    expect(keyBy([{ a: 1 }], 'a')).to.eql({ '1': { a: 1 } });
  });
  it('exclude', () => {
    const dataList = [{ a: 1 }, { a: 2 }];
    const dataObject = keyBy(dataList, 'a');
    expect(exclude(dataObject, 'a', [dataList[1]])).to.eql({ '1': { a: 1 } });
  });
  it('getFlipMatrix', () => {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const flipData = getFlipMatrix(data);
    expect(flipData[0][1]).to.equal(4);
    flipData[0][1] = 0;
    expect(data[1][0]).to.equal(0);

    expect(flipData[2][1]).to.equal(6);
    flipData[2][1] = 0;
    expect(data[1][2]).to.equal(0);
  });
});
