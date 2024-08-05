import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" }
  ],
  npmClient: 'pnpm',
  publicPath: '/umi-gaode-map-echarts-districtExplorer/dist/',
  base: '/umi-gaode-map-echarts-districtExplorer/dist/'
});