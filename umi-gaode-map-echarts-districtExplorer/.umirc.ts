import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "index" }
  ],
  npmClient: 'pnpm',
  publicPath: '/examples/umi-gaode-map-echarts-districtExplorer/demo/',
  base: '/examples/umi-gaode-map-echarts-districtExplorer/demo/',
  outputPath: 'demo',
});