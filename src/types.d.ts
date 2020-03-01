type GeodeticCoords = {
  latitude: number
  longitude: number
  altitude: number
}
type EcefCoords = {
  x: number
  y: number
  z: number
}
type NedCoords = {
  north: number
  east: number
  down: number
}
type EnuCoords = {
  east: number
  north: number
  up: number
}

// ===============

type MinimapSectorProps = {
  x: number
  y: number
  bestLod: number
  terrains: number
  current: boolean
}

type EUpdateCurrentSector = {
  currentX: number
  currentY: number
  minimap: MinimapSectorProps[]
}
