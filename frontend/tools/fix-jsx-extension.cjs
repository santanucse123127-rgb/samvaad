const fs = require("fs");
const path = require("path");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      if (full.endsWith("jsx") && !full.endsWith(".jsx")) {
        const newPath = full.slice(0, -3) + ".jsx";
        try {
          fs.renameSync(full, newPath);
          console.log("Fixed:", full, "->", newPath);
        } catch (err) {
          console.error("Failed to fix", full, err.message);
        }
      }
    }
  }
}

const root = path.join(__dirname, "..", "src");
if (!fs.existsSync(root)) {
  console.error("Source folder not found:", root);
  process.exit(1);
}
walk(root);
console.log("Done fixing extensions.");
