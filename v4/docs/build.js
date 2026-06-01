const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');

const INPUT_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = path.join(__dirname, '..');

const recurse = async (dirRel = '.') => {
    const inDir = path.join(INPUT_DIR, dirRel);
    const outDir = path.join(OUTPUT_DIR, dirRel);

    const fileNames = fs.readdirSync(inDir);
    for (const fileName of fileNames) {
        if (fileName.match(/^(\.|_)/)) continue;

        const inPath = path.join(inDir, fileName);
        let outPath = path.join(outDir, fileName);
        const stats = fs.statSync(inPath);

        if (stats.isDirectory()) {
            recurse(path.relative());
            continue;
        }

        if (fileName.endsWith('.ejs')) {
            const html = await ejs.renderFile(inPath, {
                renderMarkdownFile: mdPath => {
                    return marked.parse(fs.readFileSync(path.join(inDir, mdPath), 'utf-8'));
                }
            });
            outPath = outPath.replace('.ejs', '.html');
            fs.writeFileSync(outPath, html);
            console.log(`Wrote ${outPath}`);
            continue;
        }
    }
};
recurse();
