import { BJData, geoCoordMap, GZData, SHData } from "./constants";

let planePath =
  "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";

let convertData = function (data: any) {
  let res = [];
  for (let i = 0; i < data.length; i++) {
    let dataItem = data[i];
    let fromCoord = geoCoordMap[dataItem[0].name];
    let toCoord = geoCoordMap[dataItem[1].name];
    if (fromCoord && toCoord) {
      res.push({
        fromName: dataItem[0].name,
        toName: dataItem[1].name,
        coords: [fromCoord, toCoord],
      });
    }
  }
  return res;
};

const color = ["#a6c84c", "#ffa022", "#46bee9"];

export const buildSeries = () => {
  const series: any = [];
  [
    ["北京", BJData],
    ["上海", SHData],
    ["广州", GZData],
  ].forEach(function (item, i) {
    series.push(
      {
        name: item[0] + "出发",
        type: "effectScatter",
        coordinateSystem: "amap",
        zlevel: 2,
        rippleEffect: {
          brushType: "stroke",
        },
        symbolSize: function (val: any) {
          return val[2] / 4;
        },
        showEffectOn: "render",
        itemStyle: {
            color: color[i],
        },
        data: [
          {
            name: item[0],
            value: geoCoordMap[item[0]].concat([100]),
          },
        ],
      },
      {
        name: item[0] + "出发",
        type: "lines",
        coordinateSystem: "amap",
        zlevel: 1,
        effect: {
          show: true,
          period: 6,
          trailLength: 0.7,
          color: "#fff",
          symbolSize: 3,
        },
        lineStyle: {
            color: color[i],
            width: 0,
            curveness: 0.2,
        },
        data: convertData(item[1]),
      },
      {
        name: item[0] + "出发",
        type: "lines",
        coordinateSystem: "amap",
        zlevel: 2,
        effect: {
          show: true,
          period: 6,
          trailLength: 0,
          symbol: planePath,
          symbolSize: 15,
        },
        lineStyle: {
            color: color[i],
            width: 1,
            opacity: 0.4,
            curveness: 0.2,
        },
        data: convertData(item[1]),
      },
      {
        name: item[0] + "出发",
        type: "effectScatter",
        coordinateSystem: "amap",
        zlevel: 2,
        rippleEffect: {
          brushType: "stroke",
        },
        symbolSize: function (val: any) {
          return val[2] / 4;
        },
        showEffectOn: "render",
        itemStyle: {
            color: color[i],
        },
        data: item[1].map(function (dataItem: any) {
          return {
            name: dataItem[1].name,
            value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value]),
          };
        }),
      }
    );
  });
  return series;
};
