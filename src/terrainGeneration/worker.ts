import SimplexNoise, { RandomNumberGenerator } from "simplex-noise"
import { getStepping } from "../utils/mesh"

import { seeds } from "./seeds"

import { baseLayer } from "./layers/base"

const scaleX = 2
const scaleY = 1
const scaleZ = 2

const layers: { [key: string]: TerrainLayer } = {
  baseLayer
}

/**
 *
 * @param {Float32Array} points
 */
const calculateUnevenness = (points, step = 2) => {
  step = Math.max(1, Math.round(step))
  let min = points[0]
  let max = points[0]
  let curr = 0
  const loopLimit = points.length - step
  for (let i = step; i < loopLimit; i += step) {
    curr = points[i]
    if (curr < min) min = curr
    if (curr > max) max = curr
  }
  return Math.abs(max - min) / 100
}

const generateTerrain = (
  sizeX = 100,
  sizeY = 100,
  baseX = 0,
  baseY = 0,
  LOD = 0
) => {
  const stepX = getStepping(LOD, sizeX)
  const stepY = getStepping(LOD, sizeY)

  // Accommodate for the gaps between sectors
  sizeX += stepX
  sizeY += stepY

  const pointValues = new Float32Array((sizeX / stepX) * (sizeY / stepY))
  for (let Y = 0; Y < sizeY; Y += stepY) {
    for (let X = 0; X < sizeX; X += stepX) {
      const z =
        Object.values(layers)
          .map(layer =>
            layer.reduce(
              (z, generate) =>
                z +
                generate((X + baseX) * scaleX, (Y + baseY) * scaleZ) * scaleY,
              0
            )
          )
          .reduce((prev, curr) => prev + curr, 0) * 15

      pointValues[X / stepX + (Y / stepY) * Math.ceil(sizeY / stepY)] = z
    }
  }

  return {
    pointValues,
    uneveneness: calculateUnevenness(
      pointValues,
      (sizeX * sizeY) / getStepping(LOD) / 100
    )
  }
}

onmessage = e => {
  if (e.data.type === "init") {
    seeds[0] = new SimplexNoise(e.data.seed1)
    seeds[1] = new SimplexNoise(e.data.seed2)
  }
  if (e.data.type === "generateTerrain") {
    const mapData = generateTerrain(
      e.data.sizeX,
      e.data.sizeY,
      e.data.sectorX * e.data.sizeX,
      e.data.sectorY * e.data.sizeY,
      e.data.LOD
    )
    postMessage({
      pointValues: mapData.pointValues,
      sectorX: e.data.sectorX,
      sectorY: e.data.sectorY,
      uneveneness: mapData.uneveneness,
      LOD: e.data.LOD
    })
  }
}
