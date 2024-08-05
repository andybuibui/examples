import { useEffect, useRef } from "react";
import styles from "../style.less";
import AMapLoader from "@amap/amap-jsapi-loader";
import * as echarts from "echarts";
import { buildSeries } from "./utils";
import { colors } from "./constants";
import { Empty } from "antd";

export default ({ showDistrict, mapkey }: { showDistrict: boolean, mapkey: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const districtExplorerRef = useRef<any>(null);
  const currentAreaNodeRef = useRef<any>(null);

  //绘制某个区域的边界
  function renderAreaPolygons(areaNode: any) {
    //更新地图视野
    mapRef.current.setBounds(areaNode.getBounds(), null, null, true);

    //清除已有的绘制内容
    districtExplorerRef.current.clearFeaturePolygons();

    //绘制子区域
    districtExplorerRef.current.renderSubFeatures(
      areaNode,
      function (feature: any, i: any) {
        const fillColor = colors[i % colors.length];
        const strokeColor = colors[colors.length - 1 - (i % colors.length)];

        return {
          cursor: "default",
          bubble: true,
          strokeColor: strokeColor, //线颜色
          strokeOpacity: 1, //线透明度
          strokeWeight: 1, //线宽
          fillColor: fillColor, //填充色
          fillOpacity: 0.35, //填充透明度
        };
      }
    );

    //绘制父区域
    districtExplorerRef.current.renderParentFeature(areaNode, {
      cursor: "default",
      bubble: true,
      strokeColor: "black", //线颜色
      strokeOpacity: 1, //线透明度
      strokeWeight: 1, //线宽
      fillColor: areaNode.getSubFeatures().length ? null : colors[0], //填充色
      fillOpacity: 0.35, //填充透明度
    });
  }

  //切换区域后刷新显示内容
  function refreshAreaNode(areaNode: any) {
    districtExplorerRef.current.setHoverFeature(null);
    renderAreaPolygons(areaNode);
  }

  //加载区域
  const loadAreaNode = (adcode: any, callback: any) => {
    districtExplorerRef.current.loadAreaNode(
      adcode,
      (error: any, areaNode: any) => {
        if (error) {
          if (callback) {
            callback(error);
          }
          console.error(error);
          return;
        }
        if (callback) {
          callback(null, areaNode);
        }
      }
    );
  };

  //切换区域
  const switch2AreaNode = (adcode: any, callback?: any) => {
    if (
      currentAreaNodeRef.current &&
      "" + currentAreaNodeRef.current.getAdcode() === "" + adcode
    ) {
      return;
    }

    loadAreaNode(adcode, (error: any, areaNode: any) => {
      if (error) {
        if (callback) {
          callback(error);
        }

        return;
      }

      currentAreaNodeRef.current = areaNode;

      //设置当前使用的定位用节点
      districtExplorerRef.current.setAreaNodesForLocating([
        currentAreaNodeRef.current,
      ]);

      refreshAreaNode(areaNode);

      if (callback) {
        callback(null, areaNode);
      }
    });
  };

  //根据Hover状态设置相关样式
  const toggleHoverFeature = (feature: any, isHover: any) => {
    if (!feature) {
      return;
    }
    const props = feature.properties;
    //更新相关多边形的样式
    const polys = districtExplorerRef.current.findFeaturePolygonsByAdcode(
      props.adcode
    );
    for (let i = 0, len = polys.length; i < len; i++) {
      polys[i].setOptions({
        fillOpacity: isHover ? 0.5 : 0.2,
      });
    }
  };

  const loadDistrictExplorer = () => {
    AMapUI.loadUI(["geo/DistrictExplorer"], (DistrictExplorer: any) => {
      //创建一个实例
      districtExplorerRef.current = new DistrictExplorer({
        map: mapRef.current,
        eventSupport: true, //打开事件支持
        preload: [100000], //预加载全国
      });
      console.log(districtExplorerRef.current);
      districtExplorerRef.current.on(
        "featureMouseout featureMouseover",
        (e: any, feature: any) => {
          toggleHoverFeature(feature, e.type === "featureMouseover");
        }
      );
      //feature被点击
      districtExplorerRef.current.on(
        "featureClick",
        (_e: any, feature: any) => {
          const props = feature.properties;
          //切换聚焦区域
          switch2AreaNode(props.adcode);
        }
      );

      //外部区域被点击
      districtExplorerRef.current.on("outsideClick", (e: any) => {
        districtExplorerRef.current.locatePosition(
          e.originalEvent.lnglat,
          (_error: any, routeFeatures: any) => {
            if (routeFeatures && routeFeatures.length > 1) {
              //切换到省级区域
              switch2AreaNode(routeFeatures[1].properties.adcode);
            } else {
              //切换到全国
              switch2AreaNode(100000);
            }
          },
          {
            levelLimit: 2,
          }
        );
      });

      switch2AreaNode(100000);
    });
  };

  const loadMap = () => {
    const chart: any = echarts.init(ref.current);
    const series = buildSeries();
    const options = {
      amap: {
        center: [104.114129, 37.550339],
        zoom: 5,
        roam: true,
        renderOnMoving: false,
      },
      color: ["gold", "aqua", "lime"],
      title: {
        text: "航班飞行模拟",
        left: "center",
        textStyle: {
          color: "red",
        },
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        top: "bottom",
        left: "right",
        data: ["北京出发", "上海出发", "广州出发"],
        textStyle: {
          color: "#fff",
        },
      },
      series,
    };
    chart.setOption(options);
    const map = chart.getModel().getComponent("amap").getAMap();
    mapRef.current = map;
    if(showDistrict) {
        loadDistrictExplorer()
    }
  };

  useEffect(() => {
    AMapLoader.reset()
    AMapLoader.load({
      key: mapkey,
      plugins: ["AMap.Scale", "AMap.ToolBar", "AMap.RangingTool"],
      version: "2.0",
      AMapUI: {
        version: "1.1",
        plugins: ["overlay/SimpleMarker"],
      },
    }).then(loadMap);
  }, []);

  const destroy = () => {
    if (districtExplorerRef.current) {
      districtExplorerRef.current.setHoverFeature(null);
      //清除已有的绘制内容
      districtExplorerRef.current.clearFeaturePolygons();
      districtExplorerRef.current.offAll();
      districtExplorerRef.current.destroy();
      currentAreaNodeRef.current = null;
      districtExplorerRef.current = null;
    }
  };
  // f8a250c26e674b53a112203d96c7d547
  useEffect(() => {
    if (!mapRef.current) return;
    if (!districtExplorerRef.current && showDistrict) {
      loadDistrictExplorer();
    }
    destroy();
    return () => {
        console.log(4567890);
      destroy();
    };
  }, [showDistrict]);

  return (
    <div className={styles.mapWrapper}>
      <Empty description="Please input A valid AMap JSAPI key" />
      <div ref={ref} className={styles.map}></div>
    </div>
  );
};
