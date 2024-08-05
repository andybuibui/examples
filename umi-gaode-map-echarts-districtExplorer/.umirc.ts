import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" }
  ],
  npmClient: 'pnpm',
  publicPath: '/examples/umi-gaode-map-echarts-districtExplorer/dist/',
  base: '/examples/umi-gaode-map-echarts-districtExplorer/dist/'
});