import { loadRawContentEntries } from "../src/lib/content/file-loader";
import { validateContent } from "../src/lib/content/validation";

const result = validateContent(await loadRawContentEntries());
for (const warning of result.warnings) {
  console.warn(`CONTENT WARNING: ${warning}`);
}
