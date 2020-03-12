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
import { isRoad } from './map/ways/road'
import { determineBuildingHeight } from './map/ways/buildingShape'
import { buildingStillExists } from './map/ways/building'
import { MapSectorBottom } from './map/mapSector'
import { isPolygon } from './map/mapController'
import { getRoadsLineColor } from './map/ways/road'

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

    const blue = new Color3(0, 1, 1)
    const blue2 = new Color3(0, 0.5, 0.5)
    const green = new Color3(0, 1, 0)
    const green2 = new Color3(0, 0.5, 0)
    const yellow = new Color3(1, 1, 0)
    const yellow2 = new Color3(0.5, 0.5, 0)
    const pink = new Color3(1, 0, 1)
    const pink2 = new Color3(0.5, 0, 0.5)

    const white = new Color3(1, 1, 1)

    const gridMaterial = new GridMaterial('grid0', scene)
    gridMaterial.lineColor = blue
    gridMaterial.mainColor = blue2

    const gridMaterial1 = new GridMaterial('grid1', scene)
    gridMaterial1.lineColor = green
    gridMaterial1.mainColor = green2

    const gridMaterial2 = new GridMaterial('grid2', scene)
    gridMaterial2.lineColor = yellow
    gridMaterial2.mainColor = yellow2

    const gridMaterial3 = new GridMaterial('grid3', scene)
    gridMaterial3.lineColor = pink
    gridMaterial3.mainColor = pink2

    const wire1 = new StandardMaterial('wire0', scene)
    wire1.diffuseColor = blue
    wire1.wireframe = true

    const wire2 = new StandardMaterial('wire1', scene)
    wire2.diffuseColor = green
    wire2.wireframe = true

    const wire3 = new StandardMaterial('wire2', scene)
    wire3.diffuseColor = yellow
    wire3.wireframe = true

    const wire4 = new StandardMaterial('wire3', scene)
    wire4.diffuseColor = pink
    wire4.wireframe = true

    const mat1 = new StandardMaterial('terrain0', scene)
    mat1.diffuseColor = blue

    const mat2 = new StandardMaterial('terrain1', scene)
    mat2.diffuseColor = green

    const mat3 = new StandardMaterial('terrain2', scene)
    mat3.diffuseColor = yellow

    const mat4 = new StandardMaterial('terrain3', scene)
    mat4.diffuseColor = pink

    const node = new StandardMaterial('node', scene)
    node.diffuseColor = white

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

  debugSector(sector: MapSectorBottom) {
    const { minLat, minLon, maxLat, maxLon } = sector.bounds
    const convert = ({ east, north }) => ({ x: east, y: north })
    const PAD = 0.0001
    const points = [
      convert(sector.geoConv.geodetic2Enu(minLat + PAD, minLon + PAD, 0)),
      convert(sector.geoConv.geodetic2Enu(minLat + PAD, maxLon - PAD, 0)),
      convert(sector.geoConv.geodetic2Enu(maxLat - PAD, maxLon - PAD, 0)),
      convert(sector.geoConv.geodetic2Enu(maxLat - PAD, minLon + PAD, 0))
    ]
      .map(point => new Vector2(point.x, point.y))
      .map(v => {
        v.x += sector.position.x
        v.y += sector.position.z
        return v
      })

    const polygonTriangulation = new PolygonMeshBuilder(
      'sectorDebug' + sector.id,
      points,
      this.scene,
      earcut
    )
    const polygon = polygonTriangulation.build(false, 100)
    polygon.setMaterialByID('wire' + sector.idx)
    polygon.position.y = -50
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
      // I have to assume the sector this node is in, is already "rendered" in 3D space
      nodeBox.setParent(node.sector.transformNode)
      nodeBox.position.copyFrom(node.relativePosition)
      nodeBox.setMaterialByID(materialID)

      node.renderedRef = nodeBox
    }
  }

  addWay(way: MapWay, sector: MapSectorBottom) {
    return isPolygon(way)
      ? this.addPolygonWay(way, 'terrain' + sector.idx)
      : this.addLineWay(way)
  }

  addLineWay(way: MapWay) {
    const points = way.nodes.map(node => {
      const { x, z } = node.relativePosition.add(node.sector.position)

      const v = new Vector3(x, 0, z)

      return v
    })
    const lines = MeshBuilder.CreateLines(
      'way' + way.id,
      { points },
      this.scene
    )
    if (isRoad(way)) {
      lines.color = getRoadsLineColor(way)
    }

    return lines
  }

  addPolygonWay(way: MapWay, materialID: string = 'building') {
    // FIXME: Ways should rely on positions of already present nodes and their PARSED positions.
    // Way's nodes may be in other sectors, need to account for that.
    if ('building' in way.tags && !buildingStillExists(way)) return

    // console.groupCollapsed('addPolygonWay')
    const points = way.nodes.slice(0, -1).map(node => {
      const _sectorPos = node.sector.position.clone()
      _sectorPos.x = decimal(_sectorPos.x, 6)
      _sectorPos.y = decimal(_sectorPos.y, 6)
      _sectorPos.z = decimal(_sectorPos.z, 6)
      const _nodePos = node.relativePosition.clone()
      _nodePos.x = decimal(_nodePos.x, 6)
      _nodePos.y = decimal(_nodePos.y, 6)
      _nodePos.z = decimal(_nodePos.z, 6)

      // console.log(
      //   'way' + way.id,
      //   'sec' + node.sector.id,
      //   _sectorPos,
      //   'node' + node.id,
      //   _nodePos
      // )
      const { x, z } = node.relativePosition.add(node.sector.position)
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

    // console.groupEnd()
    return polygon
  }
}

export { Renderer }
