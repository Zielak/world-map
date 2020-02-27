import { WebVRFreeCamera, StandardMaterial } from '@babylonjs/core'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import { GridMaterial } from '@babylonjs/materials/grid'

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import '@babylonjs/core/Meshes/meshBuilder'

class Viewport {
  canvas: HTMLCanvasElement
  engine: Engine
  scene: Scene

  camera: FreeCamera
  vrHelper: any
  webVRCamera: WebVRFreeCamera

  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    this.engine = new Engine(this.canvas)
    this.scene = new Scene(this.engine)

    this.setupMaterials()
    this.setupCameras()
    this.setupInteraction()

    // Render every frame
    this.engine.runRenderLoop(() => {
      this.scene.render()
    })
  }

  setupMaterials(grid = false) {
    const { scene } = this

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(3, 10, 9), scene)
    light.intensity = 0.8
    light.specular = new Color3(0.1, 0.3, 0.7)

    if (grid) {
      // Blue
      const gridMaterial = new GridMaterial('grid0', scene)
      gridMaterial.lineColor = new Color3(0, 1, 1)

      // Green
      const gridMaterial1 = new GridMaterial('grid1', scene)
      gridMaterial1.lineColor = new Color3(0, 1, 0)

      // Yellow
      const gridMaterial2 = new GridMaterial('grid2', scene)
      gridMaterial2.lineColor = new Color3(1, 1, 0)

      // Pink
      const gridMaterial3 = new GridMaterial('grid3', scene)
      gridMaterial3.lineColor = new Color3(1, 0, 1)
    } else {
      // Blue
      const mat1 = new StandardMaterial('grid0', scene)
      mat1.diffuseColor = new Color3(0, 1, 1)

      // Green
      const mat2 = new StandardMaterial('grid1', scene)
      mat2.diffuseColor = new Color3(0, 1, 0)

      // Yellow
      const mat3 = new StandardMaterial('grid2', scene)
      mat3.diffuseColor = new Color3(1, 1, 0)

      // Pink
      const mat4 = new StandardMaterial('grid3', scene)
      mat4.diffuseColor = new Color3(1, 0, 1)
    }
  }

  setupCameras() {
    const { scene } = this
    this.camera = new FreeCamera('camera1', new Vector3(75, 20, 75), this.scene)
    this.camera.speed = 1.5
    this.camera.setTarget(new Vector3(25, 16, 25))
    this.camera.attachControl(this.canvas, true)

    this.vrHelper = scene.createDefaultVRExperience({})
    this.webVRCamera = this.vrHelper.webVRCamera
    this.webVRCamera.position.set(75, 20, 75)
  }

  setupInteraction() {
    const { camera } = this

    camera.keysUp.push(87)
    camera.keysDown.push(83)
    camera.keysLeft.push(65)
    camera.keysRight.push(68)
  }
}

export { Viewport }
