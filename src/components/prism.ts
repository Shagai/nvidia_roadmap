import Prism from "prismjs/components/prism-core.js";

const previousPrism = Reflect.get(globalThis, "Prism");
Reflect.set(globalThis, "Prism", Prism);
await import("prismjs/components/prism-clike.js");
await import("prismjs/components/prism-c.js");
await import("prismjs/components/prism-cpp.js");
await import("prismjs/components/prism-bash.js");

if (previousPrism === undefined) {
  Reflect.deleteProperty(globalThis, "Prism");
} else {
  Reflect.set(globalThis, "Prism", previousPrism);
}

export { Prism };
