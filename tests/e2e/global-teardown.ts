import * as fs from "fs";
import * as path from "path";

export default async function globalTeardown() {
  // Auth stateファイルは次回のテストで再生成されるので、古いものを残さない
  const authDir = path.join(process.cwd(), "playwright", ".auth");
  if (fs.existsSync(authDir)) {
    for (const file of fs.readdirSync(authDir)) {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(authDir, file));
      }
    }
  }

  console.log("✅ Global teardown complete");
}
