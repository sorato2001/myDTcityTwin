/*
 * @Author: 杨语涵 861896230@qq.com
 * @Date: 2024-04-10 10:36:54
 * @LastEditors: 杨语涵 861896230@qq.com
 * @LastEditTime: 2024-06-21 14:49:13
 * @FilePath: \DTCity\src\utils\city.ts
 * @Description:
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import DTScopeEngine from '@/DTGlobe/Viewer';
import * as Cesium from 'Cesium';
import { ClassificationType } from 'Cesium';
// eslint-disable-next-line no-duplicate-imports

import { default as proj4 } from 'proj4';
import { Flood_URL, Floor_URL, Roughcast_URL, Building_URL } from './url.js';
import log from 'video.js/dist/types/utils/log';
class City {
  //加载模型
  loadModel() {
    let viewer = DTScopeEngine.viewer;
    let roughcast = viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: Roughcast_URL,
      })
    );
    // console.log(111);
    // viewer.flyTo(roughcast);

    //@ts-ignore
    // const tileset = cesium.Cesium3DTileset.fromUrl('http://192.168.1.56:10086/test1/tileset.json');
    // viewer.scene.primitives.add(tileset);
    // let dtScene = viewer.DTScene;
    // let oneLayer = dtScene.createDT3DTilesLayer({
    //   name: 'xsxqmodels',
    //   label: '分层分户模型',
    //   url: 'http://192.168.1.56:10086/test1/tileset.json',
    //   classificationType: ClassificationType.CESIUM_3D_TILE,
    //   folderPath: '模型/测试数据', //@ts-ignore
    //   modelType: Cesium.DT3DTILESETTYPE.DSM,
    //   visible: 'true',
    // });
    // //@ts-ignore
    // viewer.DTScene.addLayer(oneLayer);
    // let finemould = viewer.scene.primitives.add(
    //   new Cesium.Cesium3DTileset({
    //     url: 'http://192.168.1.56:10086/finemould/tileset.json',
    //   })
    // );

    // oneLayer.clickEvent((featureInfo, feature) => {
    //      if (Cesium.defined(feature)) {
    //         oneLayer.highlightManager.setFeatureColorByIDs([featurreInfo.guid], new Cesium.Color(1, 0.0, 1.0, 0.8));
    //      }
    //  });
    // let finemould = viewer.scene.primitives.add(
    //   new Cesium.Cesium3DTileset({
    //     url: 'http://192.168.1.56:10086/finemould/tileset.json',
    //   })
    // );
    // viewer.flyTo(finemould);
    // console.log(finemould);
  }

  //加载单体房屋数据并设置点击功能
  GeoJsonBuilding() {
    let viewer = DTScopeEngine.viewer;
    const promise = Cesium.GeoJsonDataSource.load(Building_URL);
    promise.then((datasource) => {
      viewer.dataSources.add(datasource); // 加载这个geojson资源
      const entities = datasource.entities.values;
      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        //@ts-ignore
        entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND; // 贴地
        // entity.polygon.height = 5; // 距地高度0米
        //@ts-ignore
        entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND; //拉伸
        //@ts-ignore
        entity.polygon.extrudedHeight = entity.properties.height._value; // 拉伸高度
        //@ts-ignore
        entity.polygon.material = Cesium.Color.WHITE.withAlpha(0.05);
        //@ts-ignore
        entity.polygon.outline = false;
      }
    });

    //注册点击事件
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //初始化上一次高亮的建筑
    let entityBuild;
    handler.setInputAction(function (e) {
      let pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        //将上一次的建筑颜色变为无色
        if (entityBuild) {
          entityBuild.material.color = Cesium.Color.WHITE.withAlpha(0.1);
        }
        //再高亮这次的建筑
        entityBuild = pick.id.polygon;
        entityBuild.material.color = Cesium.Color.LIME.withAlpha(0.5);
      } else {
        //如果没选中则同样改为无色
        if (entityBuild) {
          entityBuild.material.color = Cesium.Color.WHITE.withAlpha(0.1);
        }
      }
      // let cartographic = Cesium.Cartographic.fromCartesian(e.position.getValue());
      // let lon = Cesium.Math.toDegrees(cartographic.longitude);
      // let lat = Cesium.Math.toDegrees(cartographic.latitude);
      // let elev = viewer.scene.globe.getHeight(cartographic);
      console.log(e.position);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //加载楼层数据并设置点击功能
  GeoJsonFloor() {
    let viewer = DTScopeEngine.viewer;
    const promise = Cesium.GeoJsonDataSource.load(Floor_URL);
    promise.then((datasource) => {
      viewer.dataSources.add(datasource); // 加载这个geojson资源
      const entities = datasource.entities.values;
      for (let index = 0; index < entities.length; index++) {
        const entity = entities[index];
        //@ts-ignore
        entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND; // 贴地
        //@ts-ignore
        entity.polygon.height = entity.properties.s_height._value; // 距地高度0米
        //@ts-ignore
        entity.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND; //拉伸
        //@ts-ignore
        entity.polygon.extrudedHeight = entity.properties.height._value; // 拉伸高度
        switch (index) {
          case 0:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.RED.withAlpha(0.8);
            break;
          case 1:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.ORANGE.withAlpha(0.8);
            break;
          case 2:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.8);
            break;
          case 3:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.GREEN.withAlpha(0.8);
            break;
          case 4:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.CYAN.withAlpha(0.8);
            break;
          case 5:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.BLUE.withAlpha(0.8);
            break;
          case 6:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.PURPLE.withAlpha(0.8);
            break;
          case 7:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.PINK.withAlpha(0.8);
            break;
          case 8:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.WHITE.withAlpha(0.8);
            break;
          case 9:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.RED.withAlpha(0.8);
            break;
          case 10:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.ORANGE.withAlpha(0.8);
            break;
          case 11:
            //@ts-ignore
            entity.polygon.material = Cesium.Color.CYAN.withAlpha(0.8);
            break;
        }

        //@ts-ignore
        entity.polygon.outline = false;
        //@ts-ignore
        console.log(entity.polygon.extrudedHeight, entity.polygon.height, entity.properties.order._value);
      }
    });

    // //注册点击事件
    // let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // //初始化上一次高亮的建筑
    // let entityBuild;
    // handler.setInputAction(function (e) {
    //   let pick = viewer.scene.pick(e.position);
    //   if (pick && pick.id) {
    //     //将上一次的建筑颜色变为无色
    //     if (entityBuild) {
    //       entityBuild.material.color = Cesium.Color.WHITE.withAlpha(0.1);
    //     }
    //     //再高亮这次的建筑
    //     entityBuild = pick.id.polygon;
    //     entityBuild.material.color = Cesium.Color.RED.withAlpha(0.5);
    //   } else {
    //     //如果没选中则同样改为无色
    //     if (entityBuild) {
    //       entityBuild.material.color = Cesium.Color.WHITE.withAlpha(0.1);
    //     }
    //   }
    //   // let cartographic = Cesium.Cartographic.fromCartesian(e.position.getValue());
    //   // let lon = Cesium.Math.toDegrees(cartographic.longitude);
    //   // let lat = Cesium.Math.toDegrees(cartographic.latitude);
    //   // let elev = viewer.scene.globe.getHeight(cartographic);
    //   console.log(entityBuild.id);
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  //淹没模拟
  floodSimulation() {
    let viewer = DTScopeEngine.viewer;
    //更改坐标系为4326
    Cesium.GeoJsonDataSource.crsNames['urn:ogc:def:crs:EPSG::3857'] = Cesium.GeoJsonDataSource.crsNames['EPSG:3857'] = function (coordinates) {
      const firstProjection =
        'PROJCS["WGS 84 / Pseudo-Mercator",GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]],PROJECTION["Mercator_1SP"],PARAMETER["central_meridian",0],PARAMETER["scale_factor",1],PARAMETER["false_easting",0],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["X",EAST],AXIS["Y",NORTH],EXTENSION["PROJ4","+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"],AUTHORITY["EPSG","3857"]]';
      const secondProjection =
        'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';

      const xa = coordinates[0];
      const ya = coordinates[1];

      const newCoordinates = proj4(firstProjection, secondProjection, [xa, ya]);
      return Cesium.Cartesian3.fromDegrees(newCoordinates[0], newCoordinates[1], 0);
    };
    let positionList = [[]];
    let promise = Cesium.GeoJsonDataSource.load(Flood_URL);
    promise.then(function (dataSource) {
      //@ts-ignore
      let array = dataSource.entities._entities._array;
      for (let i = 0; i < array.length; i++) {
        let positions = array[i]._polygon._hierarchy._value.positions;
        let t = [];
        for (let j = 0; j < positions.length; j++) {
          let cartesian3 = new Cesium.Cartesian3(positions[j].x, positions[j].y, positions[j].z);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let lng = Cesium.Math.toDegrees(cartographic.longitude);
          let alt = cartographic.height + 5;
          t.push(lng, lat, alt);
        }
        positionList.push(t);
      }
      // 先创建一个instances数组，用于存放GeometryInstance
      let instances = [];
      for (let i = 1; i < positionList.length; i++) {
        // 创建几何实例
        let geometry = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(positionList[i])),
          //extrudedHeight: 0,//注释掉此属性可以只显示水面
          perPositionHeight: true, //注释掉此属性水面就贴地了
        });
        // 创建GeometryInstance，将几何实例赋值给geometry
        let instance = new Cesium.GeometryInstance({
          geometry,
        });
        // 存入instances数组
        instances.push(instance);
      }
      // 加载primitive，通过geometryInstances可以将多个PolygonGeometry一次性加载出来
      let waterprimitive = new Cesium.Primitive({
        show: true,
        allowPicking: false,
        geometryInstances: instances,
        // 使用MaterialAppearance自定义材质，缺点不能单独设置某一个geometry
        // 想要通过MaterialAppearance给每个几何实例都设置单独的外观也是可以实现的
        // 可以给每个GeometryInstance都实例化一个Primitive，在将所有的primitive放入viewer.scene.primitives
        // 但是这样也会造成卡顿，primitive的性能优势就不能体现出来了
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: new Cesium.Material({
            fabric: {
              type: 'Water',
              uniforms: {
                normalMap: 'data/waterNormals.jpg',
                frequency: 1000.0,
                animationSpeed: 0.01,
                amplitude: 10.0,
              },
            },
          }),
          fragmentShaderSource:
            'varying vec3 v_positionMC;\n' +
            'varying vec3 v_positionEC;\n' +
            'varying vec2 v_st;\n' +
            'void main()\n' +
            '{\n' +
            'czm_materialInput materialInput;\n' +
            'vec3 normalEC = normalize(czm_normal3D * czm_geodeticSurfaceNormal(v_positionMC, vec3(0.0), vec3(1.0)));\n' +
            '#ifdef FACE_FORWARD\n' +
            'normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n' +
            '#endif\n' +
            'materialInput.s = v_st.s;\n' +
            'materialInput.st = v_st;\n' +
            'materialInput.str = vec3(v_st, 0.0);\n' +
            'materialInput.normalEC = normalEC;\n' +
            'materialInput.tangentToEyeMatrix = czm_eastNorthUpToEyeCoordinates(v_positionMC, materialInput.normalEC);\n' +
            'vec3 positionToEyeEC = -v_positionEC;\n' +
            'materialInput.positionToEyeEC = positionToEyeEC;\n' +
            'czm_material material = czm_getMaterial(materialInput);\n' +
            '#ifdef FLAT\n' +
            'gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n' +
            '#else\n' +
            'gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);\n' +
            'gl_FragColor.a=0.85;\n' +
            '#endif\n' +
            '}\n',
        }),
      });
      viewer.scene.primitives.add(waterprimitive);
      // waterprimitive.destroy();
    });
  }
}
export default function city() {
  return new City();
}
