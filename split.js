/////////////////////////////
//// Output of this is *very* rough
//// USE AT YOUR OWN RISK
/////////////////////////////

const fs = require("fs").promises;
const path = require("path");

const SPLIT_PATHS = [
    'components.schemas',
    'components.parameters',
    'components.responses'
];

const MAX_DEPTH = 2;

(async () => {
    // read openapi.json
    const openapi = await readJson('openapi.json');

    for (const splitPath of SPLIT_PATHS) {
        const keys = splitPath.split('.');
        let current = openapi;
        for (const key of keys) {
            if (current[key]) {
                current = current[key];
            } else {
                current = null;
                break;
            }
        }
        if (current) {
            await processObject(current, splitPath.replace(/\./g, '/'), '', 1);
        }
    }
})();

async function processObject(obj, dir, parent, depth) {
    if (depth >= MAX_DEPTH) return;

    const dirPath = path.join(dir, parent);
    await fs.mkdir(dirPath, { recursive: true });

    for (const key in obj) {
        const value = obj[key];
        const filePath = path.join(dirPath, `${key}.json`);

        if (typeof value === 'object') {
            await fs.writeFile(filePath, JSON.stringify(updateRefs(value, dirPath), null, 2), {
                encoding: 'utf8',
                flag: 'wx'
            });
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            // await processObject(value, dir, key, depth + 1);
        } else {
            await fs.writeFile(filePath, JSON.stringify(value, null, 2), {
                encoding: 'utf8',
                flag: 'wx'
            });
        }
    }
}

function updateRefs(obj, dirPath) {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
        if (key === '$ref' && typeof obj[key] === 'string') {
            const refPath = obj[key].replace(/^#\//, '').replace(/\//g, path.sep) + '.json';
            obj[key] = './' + path.relative(dirPath, refPath).replace(/\\/g, '/');
        } else if (typeof obj[key] === 'object') {
            obj[key] = updateRefs(obj[key], dirPath);
        }
    }
    return obj;
}

async function readJson(file) {
    return JSON.parse(await fs.readFile(file, 'utf8'));
}