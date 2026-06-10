const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const chokidar = require('chokidar');

const xmlFilePath = './public/language_spider-solitaire.xml'; // Update this to your actual XML file path
const outputFilePath = './src/config/Language.ts'; // Update this to your desired output path

// Function to read XML and generate TypeScript config
function generateConfigFromXML() {
    fs.readFile(xmlFilePath, (err, data) => {
        if (err) {
            console.error('Error reading XML file:', err);
            return;
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error('Error parsing XML file:', err);
                return;
            }

            // Collecting all unique keys across languages
            const uniqueKeys = new Set();
            result.languages.language.forEach(lang => {
                Object.keys(lang).forEach(key => {
                    if (key !== '$') { // Skip the attribute key
                        uniqueKeys.add(key);
                    }
                });
            });

            // Generating TypeScript config content
            let tsContent = 'export const LanguageConfig = {\n';
            uniqueKeys.forEach(key => {
                tsContent += `    ${key}: "${key}",\n`;
            });
            tsContent += '};\n';

            // Write the TypeScript config to file
            fs.writeFile(outputFilePath, tsContent, err => {
                if (err) {
                    console.error('Error writing TypeScript file:', err);
                    return;
                }
                console.log('LanguageConfig.ts has been generated successfully!');
            });
        });
    });
}


// Initial generation
generateConfigFromXML();

// Watch for changes in the XML file
chokidar.watch(xmlFilePath).on('change', (event, path) => {
    generateConfigFromXML();
});
