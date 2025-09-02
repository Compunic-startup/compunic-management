import fs from "fs";

const source = "dist/index.html";
const target = "dist/404.html";

try {
  fs.copyFileSync(source, target);
  console.log("✅ index.html copied to 404.html");
} catch (err) {
  console.error("❌ Failed to copy 404.html:", err);
}
