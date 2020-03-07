import earcut from 'earcut'
import {
  StandardMaterial,
  MeshBuilder,
  PolygonMeshBuilder
} from '@babylonjs/core'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { Vector3, Color3, Vector2 } from '@babylonjs/core/Maths/math'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { GridMaterial } from '@babylonjs/materials/grid'

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import '@babylonjs/core/Meshes/meshBuilder'

import { decimal } from '../utils/numbers'

import { MapNode } from './map/nodes/nodes'
import { MapWay } from './map/ways/ways'
import { determineBuildingHeight } from './map/ways/buildingShape'
import { buildingStillExists } from './map/ways/building'

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

  private setupMaterials() {
    const { scene } = this

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(3, 10, 9), scene)
    light.intensity = 0.8
    light.specular = new Color3(0.1, 0.3, 0.7)

    // Blue
    const gridMaterial = new GridMaterial('grid0', scene)
    gridMaterial.lineColor = new Color3(0, 1, 1)
    gridMaterial.mainColor = new Color3(0, 0.5, 0.5)

    // Green
    const gridMaterial1 = new GridMaterial('grid1', scene)
    gridMaterial1.lineColor = new Color3(0, 1, 0)
    gridMaterial1.mainColor = new Color3(0, 0.5, 0)

    // Yellow
    const gridMaterial2 = new GridMaterial('grid2', scene)
    gridMaterial2.lineColor = new Color3(1, 1, 0)
    gridMaterial2.mainColor = new Color3(0.5, 0.5, 0)

    // Pink
    const gridMaterial3 = new GridMaterial('grid3', scene)
    gridMaterial3.lineColor = new Color3(1, 0, 1)
    gridMaterial3.mainColor = new Color3(0.5, 0, 0.5)

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

    const node = new StandardMaterial('node', scene)
    node.diffuseColor = new Color3(1, 1, 1)

    const highway = new StandardMaterial('highway', scene)
    highway.diffuseColor = new Color3(0.301, 0.329, 0.353)

    const building = new StandardMaterial('building', scene)
    building.diffuseColor = new Color3(0.39, 0.39, 0.4)
    building.backFaceCulling = false

    const amenity = new GridMaterial('amenity', scene)
    amenity.lineColor = new Color3(0.913, 0.118, 0.338)
  }

  private setupCameras() {
    // const { scene } = this
    const camera = new FreeCamera(
      'camera1',
      new Vector3(0, 3000, 0),
      this.scene
    )
    this.camera = camera
    camera.speed = 15
    camera.setTarget(new Vector3(0, 0, 0))
    camera.attachControl(this.canvas, true)

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

  addNode(node: MapNode, materialID: string = 'building') {
    // if (this.standalone) {
    if (node.tags?.test === 'yes') {
      const size = node.tags?.test === 'yes' ? 40 : 2

      const nodeBox = MeshBuilder.CreateBox(
        'node_' + node.id,
        { size },
        this.scene
      )
      nodeBox.position.copyFrom(node.relativePosition)
      nodeBox.setMaterialByID(materialID)

      node.renderedRef = nodeBox
      // I have to assume the sector this node is in, is already "rendered" in 3D space
      node.renderedRef.parent = node.sector.transformNode
    }
  }

  addTestNode(
    nodeId,
    position: Vector3,
    size: number = 2,
    materialID: string = 'building'
  ) {
    // console.log('RENDERER:', `add node ${nodeId} at`, x, y, z)
    const nodeBox = MeshBuilder.CreateBox(
      `node_${nodeId}`,
      { size },
      this.scene
    )
    nodeBox.position.copyFrom(position)
    nodeBox.setMaterialByID(materialID)

    return nodeBox
  }

  addPolygonWay(way: MapWay, materialID: string = 'building') {
    // FIXME: Ways should rely on positions of already present nodes and their PARSED positions.
    // Way's nodes may be in other sectors, need to account for that.
    if ('building' in way.tags && !buildingStillExists(way)) return

    const points = way.nodes.slice(0, -1).map(node => {
      const _sectorPos = node.sector.position.clone()
      _sectorPos.x = decimal(_sectorPos.x, 6)
      _sectorPos.y = decimal(_sectorPos.y, 6)
      _sectorPos.z = decimal(_sectorPos.z, 6)
      const _nodePos = node.relativePosition.clone()
      _nodePos.x = decimal(_nodePos.x, 6)
      _nodePos.y = decimal(_nodePos.y, 6)
      _nodePos.z = decimal(_nodePos.z, 6)

      console.log(
        'way' + way.id,
        'sec' + node.sector.id,
        _sectorPos,
        'node' + node.id,
        _nodePos
      )
      const { x, z } = node.relativePosition.subtract(node.sector.position)
      return new Vector2(x, z)
    })

    const polygonTriangulation = new PolygonMeshBuilder(
      'way' + way.id,
      points,
      this.scene,
      earcut
    )
    const height = determineBuildingHeight(way)
    const polygon = polygonTriangulation.build(false, height)
    polygon.setMaterialByID(materialID)
    polygon.position.y = height

    return polygon
  }
}

export { Renderer }
