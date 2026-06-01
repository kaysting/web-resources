const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const marked = require('marked');
const sass = require('sass');
const { minify: minifyJsAsync } = require('terser');
const { minify: minifyHtmlAsync } = require('html-minifier-terser');

const INPUT_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = path.join(__dirname, '.');

/**
 * Parses SCSS and outputs minified CSS.
 * @param {string} scssString - The SCSS code.
 * @returns {string} Minified CSS code.
 */
function processScss(scssString) {
    try {
        // We use compileString and set the style to 'compressed' to minify the output.
        const result = sass.compileString(scssString, {
            style: 'compressed'
        });
        return result.css;
    } catch (error) {
        console.error('SCSS Compilation Error:', error.message);
        throw error;
    }
}

/**
 * Minifies JavaScript code.
 * @param {string} jsString - The raw JavaScript code.
 * @returns {Promise<string>} Minified JavaScript code.
 */
async function processJs(jsString) {
    try {
        const result = await minifyJsAsync(jsString, {
            // Terser options can go here (e.g., mangling variable names)
            mangle: true,
            compress: true
        });
        return result.code;
    } catch (error) {
        console.error('Terser Minification Error:', error.message);
        throw error;
    }
}

/**
 * Minifies HTML code, including any inline CSS/JS.
 * @param {string} htmlString - The raw HTML code.
 * @returns {Promise<string>} Minified HTML code.
 */
async function processHtml(htmlString) {
    try {
        const result = await minifyHtmlAsync(htmlString, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true, // Uses clean-css under the hood for inline styles
            minifyJS: true // Uses terser under the hood for inline scripts
        });
        return result;
    } catch (error) {
        console.error('HTML Minification Error:', error.message);
        throw error;
    }
}

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
                outText = await ejs.renderFile(inPath, {
                    renderMarkdownFile: mdPath => {
                        return marked.parse(fs.readFileSync(path.join(inDir, mdPath), 'utf-8'));
                    }
                });
                outPath = outPath.replace('.ejs', '.html');
                break;
            }
            case 'scss': {
                outText = processScss(fs.readFileSync(inPath, 'utf-8'));
                outPath = outPath.replace('.scss', '.css');
                break;
            }
            case 'js': {
                outText = await processJs(fs.readFileSync(inPath, 'utf-8'));
                break;
            }
            default: {
                continue;
            }
        }

        // Write output file
        fs.writeFileSync(outPath, outText);
        console.log(`Wrote ${outPath}`);
    }
};
recurse();
