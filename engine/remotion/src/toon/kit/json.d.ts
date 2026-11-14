// shots.json is imported by each video's story file (the bundler loads JSON natively)
declare module "*/shots.json" {
  const plan: import("./story").ShotsJson;
  export default plan;
}
