import { seeds } from "../seeds"

function ridgeNoise(nx, ny) {
  return 2 * (0.5 - Math.abs(0.5 - seeds[0].noise2D(nx, ny)))
}

export const baseLayer: TerrainLayer = [
  // Base */
  (x, y) =>
    seeds[0].noise2D(x / 8000, y / 8000) *
    seeds[1].noise2D(x / 1400, y / 1400) *
    5,
  // baseRidged */
  (x, y) => {
    const amplitude = seeds[0].noise2D(y / 3000, x / 3000) / 2 + 0.5
    const scale = 2000

    const e0 = 1 * ridgeNoise((1 * x) / scale, (1 * y) / scale)
    const e1 = 0.5 * ridgeNoise((2 * x) / scale, (2 * y) / scale) * e0
    const e2 = 0.25 * ridgeNoise((4 * x) / scale, (4 * y) / scale) * (e0 + e1)
    const e = e0 + e1 + e2
    return Math.pow(e, 3) * amplitude
  },
  // lumpsOfSmallBumps */
  (x, y) => {
    return (
      ridgeNoise(x / 40, y / 40) *
      Math.min(0, seeds[0].noise2D(x / 400, y / 400)) *
      0.1
    )
  },
  // dirtDetail */
  (x, y) => {
    const tmpSandSmoothness =
      Math.max(0, seeds[1].noise2D(x / 200, y / 200)) * 0.1
    const tmpSandWaves1 = seeds[0].noise2D(y / 500, x / 500)
    const tmpSandWaves2 = seeds[1].noise2D(y / 500, x / 500)

    return (
      seeds[0].noise2D(
        x / ((Math.sin(tmpSandWaves1) + 2) * 10),
        y / ((Math.cos(tmpSandWaves2) + 2) * 10)
      ) * tmpSandSmoothness
    )
  }
  //*/
]
