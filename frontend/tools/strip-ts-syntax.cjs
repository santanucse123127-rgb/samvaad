const fs = require("fs");
const path = require("path");

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (entry.isFile() && full.endsWith(".jsx")) cb(full);
  }
}

function stripFile(file) {
  let s = fs.readFileSync(file, "utf8");

  // remove 'type' modifier in imports: import { a, type B } -> import { a }
  s = s.replace(/,?\s*type\s+[^,}]+(?=[,}])/g, "");

  // remove export interface/type blocks (simple heuristic)
  s = s.replace(
    /export\s+(interface|type)\s+[^{=]+(?:=[^{;]+)?\{[\s\S]*?\}\s*/g,
    ""
  );
  s = s.replace(/export\s+type\s+[^;]+;\s*/g, "");

  // remove standalone interface declarations in .jsx files (robust)
  s = s.replace(/interface\s+\w+[^{]*\{[\s\S]*?\}\s*/g, "");
  // remove standalone type aliases anywhere
  s = s.replace(/type\s+\w+[\s\S]*?;\s*/g, "");

  // remove React generic forwardRef and plain forwardRef generics (handle multiline)
  s = s.replace(/React\.forwardRef<[\s\S]*?>\s*\(/g, "React.forwardRef(");
  s = s.replace(/forwardRef<[\s\S]*?>\s*\(/g, "forwardRef(");

  // remove type annotations in parameter destructuring like }: FooProps,
  s = s.replace(/}\s*:\s*[\s\S]*?(?=[,)])/g, "}");

  // remove non-null assertion operator
  s = s.replace(/!\b/g, "");

  // remove 'as const' occurrences (harmless in JS but kept optional)
  s = s.replace(/\s+as\s+const/g, "");

  fs.writeFileSync(file, s, "utf8");
  console.log("Processed", file);
}

const root = path.join(__dirname, "..", "src");
walk(root, stripFile);
console.log("Stripping complete.");
