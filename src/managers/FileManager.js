import fs from "fs";
import path from "path";

export default class FileManager {
  constructor(filePath) {
    this.path = path.resolve(filePath);
  }

  async _readFile() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async _writeFile(data) {
    await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  _generateId(items) {
    return items.length > 0 ? items[items.length - 1].id + 1 : 1;
  }
}
