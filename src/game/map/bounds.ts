import { middle, isWithin } from '../../utils/numbers'

export class MapBounds {
  centerLat: number
  centerLon: number

  constructor(
    public minLat: number,
    public minLon: number,
    public maxLat: number,
    public maxLon: number
  ) {
    this.centerLat = middle(minLat, maxLat)
    this.centerLon = middle(minLon, maxLon)
  }

  get sizeLat() {
    return Math.abs(this.maxLat - this.minLat)
  }

  get sizeLon() {
    return Math.abs(this.maxLon - this.minLon)
  }

  /**
   * Can the `other` bounds completely fit inside THIS bounds.
   * @param other
   * @returns `false` is at least one of the edges cross outside of this bounds
   */
  canFit(other: MapBounds) {
    const { minLat, minLon, maxLat, maxLon } = this

    return (
      isWithin(other.minLat, minLat, maxLat) &&
      isWithin(other.maxLat, minLat, maxLat) &&
      isWithin(other.minLon, minLon, maxLon) &&
      isWithin(other.maxLon, minLon, maxLon)
    )
  }
}

export const parseBounds = ({
  $_minlat,
  $_minlon,
  $_maxlat,
  $_maxlon
}: OSMBounds): MapBounds => {
  return new MapBounds($_minlat, $_minlon, $_maxlat, $_maxlon)
}
