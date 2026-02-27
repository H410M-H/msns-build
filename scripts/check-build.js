import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

console.log("Running build check...");
try {
  execSync("npm run check", { stdio: "inherit", cwd: projectRoot });
  console.log("Type check passed!");
  execSync("npm run build", { stdio: "inherit", cwd: projectRoot });
  console.log("Build successful!");
} catch (error) {
  console.error("Build failed");
  process.exit(1);
}
