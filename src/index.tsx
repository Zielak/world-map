import './styles.scss'

import './game'

// window["getCurrentSector"] = () =>
//   terrainController.getSectorFromPosition(camera.position.x, camera.position.z)

export const EVENTS = {
  updateCurrentSector: 'updateCurrentSector'
}

// const camElevation = 2.0
// scene.registerBeforeRender(() => {
//   webVRCamera.position.y =
//     terrainController.getHeightFromMap(
//       webVRCamera.position.x,
//       webVRCamera.position.z
//     ) + camElevation
// })
