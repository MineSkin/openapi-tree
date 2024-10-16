/// Uses a main.json file to merge all json files in the same directory into a single openapi.json file

const fs = require("fs").promises;
const path = require("path");

// https://swagger.io/specification/
const ROOT_KEYS = [
    'info',
    'servers',
    'paths',
    'webhooks',
    'components',
    'security',
    'tags',
    'externalDocs'
];

(async () => {
    // read main.json
    const main = await readJson('main.json');

    const output = { ...main };

    for (const key of ROOT_KEYS) {
        await processDir(output[key], key, '');
    }

    for (const key of ROOT_KEYS) {
        await cleanUpRefs(output, key, true);
    }

    // write openapi.json
    await fs.writeFile('openapi.json', JSON.stringify(output, null, 2), {
        encoding: 'utf8',
        flag: 'wx'
    });
})();

async function processDir(output, path_, parent) {
    console.debug(`Processing ${ path_ } ${ parent }`);
    let dir;
    try {
        dir = await fs.readdir(path_);
    } catch (e) {
        console.log(e);
        return;
    }
    if(!output) {
        output = {};
    }
    for (const file of dir) {
        const base = path.basename(file);
        const joined = path.join(path_, file);
        const stat = await fs.stat(joined);
        if (stat.isDirectory()) {
            let out;
            if (parent === '') {
                out = output;
            } else {
                if (!output[base]) {
                    output[base] = {};
                }
                out = output[base];
            }
            await processDir(out, joined, base);
        } else {
            const content = await readJson(joined);
            // merge with main
            if (!output[parent]) {
                output[parent] = {};
            }
            console.debug(`Merging ${ file } into ${ parent }`);
            await cleanUpRefs(content, path_);
            output[parent][file.replace('.json', '')] = content;

        }
    }
}

async function cleanUpRefs(obj, contextPath0, strict = false) {
    let contextPath = contextPath0;
    console.debug(`Cleaning up refs ${ strict }`);
    for (const key in obj) {
        if (key === '$ref') {
            console.log('context', contextPath)
            const val = obj[key];
            console.log(val);
            if (strict) {
                if (val.startsWith(`./${ contextPath }/`)) {
                    obj[key] = val.replace(`./${ contextPath }/`, `#/${ contextPath }/`).replace('.json', '');
                    console.debug('replace strict')
                } else if (val.startsWith(`../${ contextPath }/`)) {
                    contextPath = contextPath.split('/').slice(0, -1).join('/');
                    obj[key] = val.replace(`../${ contextPath }/`, `#/${ contextPath }/`).replace('.json', '');
                    console.debug('replace strict up')
                }
            } else {
                if (val.startsWith(`../`)) {
                    contextPath = contextPath.split('/').slice(0, -1).join('/');
                    obj[key] = val.replace(`../`, `#/${ contextPath }/`).replace('.json', '');
                    console.debug('replace up')
                } else if (val.startsWith(`./`)) {
                    obj[key] = val.replace(`./`, `#/${ contextPath }/`).replace('.json', '');
                    console.debug('replace')
                }
            }
        } else if (typeof obj[key] === 'object') {
            await cleanUpRefs(obj[key], contextPath0, strict);
        }
    }
}

async function readJson(file) {
    console.debug(`Reading ${ file }`);
    return JSON.parse(await fs.readFile(file, 'utf8'));
}