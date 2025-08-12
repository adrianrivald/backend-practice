import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

fs.readdirSync(__dirname).forEach((file) => {
  if (file === "index.js") return;
  if (!file.endsWith(".js")) return;

  const routeName = `/api/${file.replace(".js", "")}`;
  const filePath = path.join(__dirname, file);

  // Convert to file:// URL for dynamic import in ESM
  import(pathToFileURL(filePath)).then((module) => {
    router.use(routeName, module.default);
  });
});

export default router;
