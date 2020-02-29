export const parseBounds = ({
  $_minlat,
  $_minlon,
  $_maxlat,
  $_maxlon
}: OSMBounds): MapBounds => {
  return {
    minLat: $_minlat,
    minLon: $_minlon,
    maxLat: $_maxlat,
    maxLon: $_maxlon,
    centerLat: ($_maxlat - $_minlat) / 2 + $_minlat,
    centerLon: ($_maxlon - $_minlon) / 2 + $_minlon
  }
}
