
import fs from "fs";
import path from "path";

export default class FileManager {
  constructor(filePath) {
    this.path = path.resolve(filePath);

    
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(path.dirname(this.path), { recursive: true });
      fs.writeFileSync(this.path, "[]", "utf-8");
      console.log(`🆕 Archivo creado: ${this.path}`);
    }
  }

  async _readFile() {
    try {
      const data = await fs.promises.readFile(this.path, "utf-8");
      return JSON.parse(data || "[]");
    } catch (error) {
      console.error("⚠️ Error al leer el archivo:", error.message);
      return [];
    }
  }

  async _writeFile(data) {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("❌ Error al escribir el archivo:", error.message);
    }
  }

  _generateId(items) {
    
    if (items.length === 0) return 1;

    const last = items[items.length - 1];
    return typeof last.id === "number" ? last.id + 1 : Date.now().toString();
  }
}
