import { MapBounds } from '../bounds'

describe('canFitBounds', () => {
  const bounds = new MapBounds(-10, -10, 10, 10)

  describe('fits', () => {
    test('other wholly inside', () => {
      expect(bounds.canFitBounds(new MapBounds(-1, -1, 1, 1))).toBe(true)
    })
    test('other on lat- edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-10, -1, -9, 1))).toBe(true)
    })
    test('other on lat+ edge', () => {
      expect(bounds.canFitBounds(new MapBounds(9, -1, 10, 1))).toBe(true)
    })
    test('other on lon- edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-1, -10, 1, -9))).toBe(true)
    })
    test('other on lon+ edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-1, 9, 1, 10))).toBe(true)
    })
  })

  describe(`doesn't fit`, () => {
    test('other wholly overflows all edges', () => {
      expect(bounds.canFitBounds(new MapBounds(-11, -11, 11, 11))).toBe(false)
    })
    test('other over lat- edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-11, -1, -9, 1))).toBe(false)
    })
    test('other over lat+ edge', () => {
      expect(bounds.canFitBounds(new MapBounds(9, -1, 11, 1))).toBe(false)
    })
    test('other over lon- edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-1, -11, 1, -9))).toBe(false)
    })
    test('other over lon+ edge', () => {
      expect(bounds.canFitBounds(new MapBounds(-1, 9, 1, 11))).toBe(false)
    })
  })
})
