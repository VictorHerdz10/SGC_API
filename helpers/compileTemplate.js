import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

// Obtener __dirname en un módulo de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readTemplate = (templateName, data) => {
    // Ruta a la plantilla
    const templatePath = path.join(__dirname, '../template', `${templateName}.hbs`); // Asegúrate de que la ruta sea correcta
    const templateFile = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateFile);
    return template(data);
};