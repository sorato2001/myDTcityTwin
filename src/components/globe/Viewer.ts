//@ts-nocheck
/*
 * @Author: Lincong-pro
 * @Date: 2023-09-21 14:07:27
 * @LastEditors: 杨语涵 861896230@qq.com
 * @LastEditTime: 2024-06-21 15:14:56
 * @FilePath: \DTCity\src\DTGlobe\Viewer.ts
 * @Description:
 * Copyright (c) 2023 by VGE, All Rights Reserved.
 */
//@ts-ignore
import * as Cesium from 'cesium';
import model from '../../utils/city';

class DTScopeEngine {
  static initMountDom(id: string) {
    DTScopeEngine.id = id;
  }

  constructor() {
    // this.loading = true;

    if (typeof DTScopeEngine.viewer == 'undefined') {
      //@ts-ignore
      DTScopeEngine.viewer = Cesium.DTGlobeViewer.createViewer(Cesium, 'cesiumContainer', false, {
        geocoder: false,
        useDefaultRenderLoop: true, // 是否默认进行渲染
        targetFrameRate: 60,
        timeline: false, // 是否显示时间线控件
        animation: false, // 是否显示动画控件
        shouldAnimate: true,
        shadows: false,
        terrainShadows: Cesium.ShadowMode.DISABLED,
      });
      this.initViewer();
    }
  }

  /**
   * @description: 初始化地球
   * @return {void}
   */
  initViewer() {
    const viewer = DTScopeEngine.viewer as Cesium.Viewer;
    // Configure viewer parameters

    viewer.enviromentBrightness = 1.2;
    viewer._cesiumWidget._creditContainer.style.display = 'none';
    // Smooth the earth edge
    viewer.scene.postProcessStages.fxaa.enabled = true;

    //@ts-ignore
    viewer._cesiumWidget._supportsImageRenderingPixelated = Cesium.FeatureDetection.supportsImageRenderingPixelated();
    viewer._cesiumWidget._forceResize = true;
    //@ts-ignore
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      let vtxfDpr = window.devicePixelRatio;
      while (vtxfDpr >= 2.0) {
        vtxfDpr /= 2.0;
      }
      viewer.resolutionScale = vtxfDpr;
    }

    this.loadArcGIS();

    let loadModel = model();
    loadModel.loadModel();

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(119.9735728, 30.5139634, 700.4045645), // 设置位置
      orientation: {
        heading: 0.11630412326665596, // 方向
        pitch: -0.6264824664848176, // 倾斜角度
        roll: 0.00042085216725951113,
        range: 0,
      },
    });
  }

  /**
   * @description: 加载全球地形
   */
  loadCWT = function () {
    const options = {
      //@ts-ignore
      url: Cesium.IonResource.fromAssetId(1, {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlODE0MTRjZC0zZjQ3LTQxNTctYjE0NC05NGY1MjA0ZDgxYmMiLCJpZCI6OTg4MjAsImlhdCI6MTY4NTE2MjA1Mn0.FxQ9MoKycjkrZFuExULXjjgjHVxYTQ4qsSieZLLjWyQ',
        server: 'https://api.cesium.com',
      }),
      requestVertexNormals: true,
      requestWaterMask: true,
    };
    const viewer: Cesium.Viewer = DTScopeEngine.viewer; //@ts-ignore
    viewer.terrainProvider = new Cesium.CesiumTerrainProvider(options);
  };
  /**
   * @description: 加载ArcGIS影像
   */
  loadArcGIS = function () {
    const esri = new Cesium.ArcGisMapServerImageryProvider({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    });
    const viewer = DTScopeEngine.viewer;
    viewer.imageryLayers.addImageryProvider(esri);
  };
  /**
   * @description: 加载纯白底图
   */
  loadWorldOcean = function () {
    const viewer: Cesium.Viewer = DTScopeEngine.viewer; //@ts-ignore
    viewer.DTScene.createImagerLayer({
      name: 'baseImageLayer',
      label: 'World Ocean Base',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer', // @ts-ignore
      serviceType: Cesium.DTIMAGELAYERSERVICETYPE.ARCGISIMAGESERVICE,
      format: 'image/jpeg',
      maximumLevel: '18',
      tileMatrixSetID: 'GoogleMapsCompatible',
      style: 'default',
      layer: 'BasicLayer',
      tilingScheme: 1,
      visible: true,
    });
  };

  destroy() {
    DTScopeEngine.viewer.destroy();
    DTScopeEngine.viewer = undefined;
  }

  static viewer: undefined | Cesium.Viewer;
  static id: string;
}

export default DTScopeEngine;
