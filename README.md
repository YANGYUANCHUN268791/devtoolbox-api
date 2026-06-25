# DevToolBox API

Free REST API for developer tools. JSON formatting, Base64 encode/decode, UUID generation, CSV/JSON conversion, timestamps, HTML escaping and more.

## Quick Start

npm install @YANGYUANCHUN268791/devtoolbox-api
node server.js

## API Usage

POST /api/tool/json
Body: { "input": "{\"test\": 123}" }

POST /api/tool/base64Encode
Body: { "input": "Hello World" }

POST /api/tool/uuid
Body: { "input": "5" }

## Available Tools
json, jsonMin, base64Encode, base64Decode, urlEncode, urlDecode, uuid, strStats, timestamp, htmlEscape, htmlUnescape, csvJson, jsonCsv, hexEncode, hexDecode

## License
MIT