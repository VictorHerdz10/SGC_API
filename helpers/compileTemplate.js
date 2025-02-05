import fs from 'fs';
import Handlebars from 'handlebars';

export const readTemplate = (templateName, data) => {
    const templatePath = `template/${templateName}.hbs`; // Asegúrate de que la ruta sea correcta
    const templateFile = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateFile);
    return template(data);
};