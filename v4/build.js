const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');
const sass = require('sass');
const CleanCSS = require('clean-css');
const { minify: minifyJsAsync } = require('terser');
const { minify: minifyHtmlAsync } = require('html-minifier-terser');

const INPUT_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = path.join(__dirname, '.');

const minifyHtml = async html => {
    const result = await minifyHtmlAsync(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true, // Uses clean-css under the hood for inline styles
        minifyJS: true // Uses terser under the hood for inline scripts
    });
    return result;
};

// Recursively build source files
const recurse = async (dirRel = '.') => {
    const inDir = path.join(INPUT_DIR, dirRel);
    const outDir = path.join(OUTPUT_DIR, dirRel);

    // Loop through files in this directory
    const fileNames = fs.readdirSync(inDir);
    for (const fileName of fileNames) {
        // Skip files starting with . or _
        if (fileName.match(/^(\.|_)/)) continue;

        // Prep for build
        const inPath = path.join(inDir, fileName);
        let outPath = path.join(outDir, fileName);
        let outText = '';
        const stats = fs.statSync(inPath);

        // Recurse into directories
        if (stats.isDirectory()) {
            if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);
            recurse(path.relative(INPUT_DIR, inPath));
            continue;
        }

        // Build based on extension
        const ext = fileName.split('.').pop().toLowerCase();
        switch (ext) {
            case 'ejs': {
                outText = await minifyHtml(
                    await ejs.renderFile(inPath, {
                        renderMarkdownFile: mdPath => {
                            return marked.parse(fs.readFileSync(path.join(inDir, mdPath), 'utf-8'));
                        }
                    })
                );
                outPath = outPath.replace('.ejs', '.html');
                break;
            }
            case 'html': {
                outText = await minifyHtml(fs.readFileSync(inPath, 'utf-8'));
                break;
            }
            case 'scss': {
                const result = sass.compileString(fs.readFileSync(inPath, 'utf-8'), {
                    style: 'compressed'
                });
                outText = result.css;
                outPath = outPath.replace('.scss', '.css');
                break;
            }
            case 'css': {
                const output = new CleanCSS({
                    level: 1
                }).minify(fs.readFileSync(inPath, 'utf-8'));
                outText = output.styles;
            }
            case 'js': {
                const result = await minifyJsAsync(fs.readFileSync(inPath, 'utf-8'), {
                    mangle: true,
                    compress: true
                });
                outText = result.code;
                break;
            }
            case 'jpg':
            case 'jpeg':
            case 'png': {
                outPath = outPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                await sharp(inPath)
                    .resize({
                        width: 1000,
                        height: 1000,
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 80 })
                    .toFile(outPath);
                console.log(`Wrote ${outPath}`);
                break;
            }
            default: {
                continue;
            }
        }

        // Write output file
        if (outText) {
            fs.writeFileSync(outPath, outText);
            console.log(`Wrote ${outPath}`);
        }
    }
};
recurse();
