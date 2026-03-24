## Usage

Run `node merge.js [--force]` to merge `main.json` and all openapi files into a single `openapi.json`.

## Regex to replace paths
`\"\$ref\"\:\ \"(\#)(.+)\/(.+)\"`  
`\"\$ref\"\:\ \".$2\/$3.json\"`