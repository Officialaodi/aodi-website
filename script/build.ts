import { execSync } from "child_process";
import { cpSync, mkdirSync, existsSync, writeFileSync } from "fs";

async function buildAll() {
  console.log("Building Next.js app...");
  
  execSync("npm run build", {
    cwd: "./apps/web",
    stdio: "inherit",
  });

  console.log("Creating production server entry point...");
  
  if (!existsSync("dist")) {
    mkdirSync("dist", { recursive: true });
  }

  const serverEntry = `
const path = require('path');

const port = process.env.PORT || 5000;
process.env.PORT = port;
process.env.HOSTNAME = '0.0.0.0';

const serverPath = path.join(__dirname, '..', 'apps', 'web', '.next', 'standalone', 'server.js');

console.log('Starting Next.js server on port ' + port + '...');

require(serverPath);
`;

  writeFileSync("dist/index.cjs", serverEntry);
  
  console.log("Copying static files for standalone...");
  
  const staticSrc = "./apps/web/.next/static";
  const staticDest = "./apps/web/.next/standalone/apps/web/.next/static";
  
  if (existsSync(staticSrc)) {
    mkdirSync(staticDest, { recursive: true });
    cpSync(staticSrc, staticDest, { recursive: true });
  }
  
  const publicSrc = "./apps/web/public";
  const publicDest = "./apps/web/.next/standalone/apps/web/public";
  
  if (existsSync(publicSrc)) {
    mkdirSync(publicDest, { recursive: true });
    cpSync(publicSrc, publicDest, { recursive: true });
  }
  
  console.log("Build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
