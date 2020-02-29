import { WebVRFreeCamera, StandardMaterial, MeshBuilder } from '@babylonjs/core'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3, Color3 } from '@babylonjs/core/Maths/math'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'

import { GridMaterial } from '@babylonjs/materials/grid'

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import '@babylonjs/core/Meshes/meshBuilder'

class Renderer {
  canvas: HTMLCanvasElement
  engine: Engine
  scene: Scene

  camera: FreeCamera
  // vrHelper: any
  // webVRCamera: WebVRFreeCamera

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

  private setupMaterials(gridTerrain = false) {
    const { scene } = this

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(3, 10, 9), scene)
    light.intensity = 0.8
    light.specular = new Color3(0.1, 0.3, 0.7)

    if (gridTerrain) {
      // Blue
      const gridMaterial = new GridMaterial('terrain0', scene)
      gridMaterial.lineColor = new Color3(0, 1, 1)

      // Green
      const gridMaterial1 = new GridMaterial('terrain1', scene)
      gridMaterial1.lineColor = new Color3(0, 1, 0)

      // Yellow
      const gridMaterial2 = new GridMaterial('terrain2', scene)
      gridMaterial2.lineColor = new Color3(1, 1, 0)

      // Pink
      const gridMaterial3 = new GridMaterial('terrain3', scene)
      gridMaterial3.lineColor = new Color3(1, 0, 1)
    } else {
      // Blue
      const mat1 = new StandardMaterial('terrain0', scene)
      mat1.diffuseColor = new Color3(0, 1, 1)

      // Green
      const mat2 = new StandardMaterial('terrain1', scene)
      mat2.diffuseColor = new Color3(0, 1, 0)

      // Yellow
      const mat3 = new StandardMaterial('terrain2', scene)
      mat3.diffuseColor = new Color3(1, 1, 0)

      // Pink
      const mat4 = new StandardMaterial('terrain3', scene)
      mat4.diffuseColor = new Color3(1, 0, 1)
    }

    const node = new StandardMaterial('node', scene)
    node.diffuseColor = new Color3(1, 1, 1)

    const highway = new StandardMaterial('highway', scene)
    highway.diffuseColor = new Color3(0.301, 0.329, 0.353)

    const amenity = new GridMaterial('amenity', scene)
    amenity.lineColor = new Color3(0.913, 0.118, 0.338)
  }

  private setupCameras() {
    // const { scene } = this
    this.camera = new FreeCamera('camera1', new Vector3(75, 20, 75), this.scene)
    this.camera.speed = 3
    this.camera.setTarget(new Vector3(25, 16, 25))
    this.camera.attachControl(this.canvas, true)

    // TODO: Focus on VR AFTER you get some OSM data rendering.
    // this.vrHelper = scene.createDefaultVRExperience({})
    // this.webVRCamera = this.vrHelper.webVRCamera
    // this.webVRCamera.position.set(75, 20, 75)
  }

  private setupInteraction() {
    const { camera } = this

    camera.keysUp = [38, 87]
    camera.keysDown = [40, 83]
    camera.keysLeft = [37, 65]
    camera.keysRight = [39, 68]
  }

  addNode(nodeId, x, y, z) {
    console.log('RENDERER:', `add node ${nodeId} at`, x, y, z)
    const nodeBox = MeshBuilder.CreateBox(
      `node_${nodeId}`,
      { size: 2 },
      this.scene
    )
    nodeBox.position.set(x, y, z)
    nodeBox.setMaterialByID('node')
  }
}

export { Renderer }
