const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// ============ TOOL FUNCTIONS ============
const tools = {
  json: {
    name: 'JSON Formatter',
    desc: 'Format, validate, and compress JSON',
    fn: (input) => {
      try { return JSON.stringify(JSON.parse(input), null, 2); }
      catch(e) { throw new Error('Invalid JSON: ' + e.message); }
    }
  },
  jsonMin: {
    name: 'JSON Minify',
    desc: 'Compress JSON to single line',
    fn: (input) => {
      try { return JSON.stringify(JSON.parse(input)); }
      catch(e) { throw new Error('Invalid JSON: ' + e.message); }
    }
  },
  base64Encode: {
    name: 'Base64 Encode',
    desc: 'Encode text to Base64',
    fn: (input) => Buffer.from(input).toString('base64')
  },
  base64Decode: {
    name: 'Base64 Decode',
    desc: 'Decode Base64 to text',
    fn: (input) => Buffer.from(input, 'base64').toString('utf8')
  },
  urlEncode: {
    name: 'URL Encode',
    desc: 'Encode text for URL',
    fn: (input) => encodeURIComponent(input)
  },
  urlDecode: {
    name: 'URL Decode',
    desc: 'Decode URL encoded text',
    fn: (input) => decodeURIComponent(input)
  },
  uuid: {
    name: 'UUID Generator',
    desc: 'Generate multiple UUIDs (v4)',
    fn: (input) => {
      const count = Math.min(parseInt(input) || 5, 50);
      const r = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return Array.from({ length: count }, () => r()).join('\n');
    }
  },
  strStats: {
    name: 'String Statistics',
    desc: 'Analyze text: chars, words, lines, bytes',
    fn: (input) => {
      return [
        `Characters (total): ${input.length}`,
        `Characters (no space): ${input.replace(/\s/g, '').length}`,
        `Words: ${input.trim() ? input.trim().split(/\s+/).length : 0}`,
        `Lines: ${input.split('\n').length}`,
        `Bytes: ${Buffer.byteLength(input, 'utf8')}`
      ].join('\n');
    }
  },
  timestamp: {
    name: 'Timestamp Converter',
    desc: 'Convert unix timestamp / ISO date',
    fn: (input) => {
      const t = input.trim();
      if (!t) {
        const n = Date.now();
        return `Now (ms): ${n}\nNow (s): ${Math.floor(n/1000)}\nISO: ${new Date().toISOString()}\nLocal: ${new Date().toLocaleString()}`;
      }
      if (/^\d+$/.test(t)) {
        const n = parseInt(t);
        const d = t.length > 12 ? new Date(n) : new Date(n * 1000);
        return `From ${t.length > 12 ? 'ms' : 's'}: ${d.toLocaleString()}\nISO: ${d.toISOString()}`;
      }
      const d = new Date(t);
      if (isNaN(d.getTime())) throw new Error('Invalid date format');
      return `Unix (s): ${Math.floor(d.getTime()/1000)}\nUnix (ms): ${d.getTime()}\nISO: ${d.toISOString()}\nLocal: ${d.toLocaleString()}`;
    }
  },
  htmlEscape: {
    name: 'HTML Escape',
    desc: 'Escape HTML special characters',
    fn: (input) => input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
  },
  htmlUnescape: {
    name: 'HTML Unescape',
    desc: 'Unescape HTML entities',
    fn: (input) => input.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'")
  },
  csvJson: {
    name: 'CSV to JSON',
    desc: 'Convert CSV to JSON array (first line = headers)',
    fn: (input) => {
      const lines = input.trim().split('\n');
      if (lines.length < 2) throw new Error('Need at least 2 lines (header + 1 data row)');
      const headers = lines[0].split(',').map(h => h.trim());
      const result = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, j) => { obj[h] = vals[j] || ''; });
        result.push(obj);
      }
      return JSON.stringify(result, null, 2);
    }
  },
  jsonCsv: {
    name: 'JSON to CSV',
    desc: 'Convert JSON array to CSV',
    fn: (input) => {
      const data = JSON.parse(input);
      if (!Array.isArray(data) || !data.length) throw new Error('Need non-empty JSON array');
      const headers = Object.keys(data[0]);
      const lines = [headers.join(',')];
      data.forEach(row => {
        lines.push(headers.map(h => {
          const v = row[h];
          if (v === null || v === undefined) return '';
          const s = String(v);
          return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
        }).join(','));
      });
      return lines.join('\n');
    }
  },
  hexEncode: {
    name: 'Hex Encode',
    desc: 'Convert text to hexadecimal',
    fn: (input) => Array.from(Buffer.from(input, 'utf8')).map(b => b.toString(16).padStart(2,'0')).join(' ')
  },
  hexDecode: {
    name: 'Hex Decode',
    desc: 'Convert hexadecimal to text',
    fn: (input) => Buffer.from(input.trim().replace(/\s+/g,''), 'hex').toString('utf8')
  }
};

// ============ ROUTES ============

// Home page
app.get('/', (req, res) => {
  res.render('index', { tools: Object.keys(tools).map(k => ({ id: k, ...tools[k] })) });
});

// API endpoint
app.post('/api/tool/:toolName', (req, res) => {
  const tool = tools[req.params.toolName];
  if (!tool) return res.status(404).json({ error: 'Tool not found' });
  const { input, isPro } = req.body || {};
  if (input === undefined) return res.status(400).json({ error: 'Input required' });
  try {
    const result = tool.fn(input || '');
    // Free tier: limit some features
    if (!isPro) {
      if (req.params.toolName === 'uuid' && (input || '5').trim() !== '' && parseInt(input) > 5) {
        return res.json({ result: result, proNote: 'Free tier: max 5 UUIDs. Pro version: unlimited.' });
      }
    }
    res.json({ result, tool: tool.name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// All tools list
app.get('/api/tools', (req, res) => {
  res.json(Object.keys(tools).map(k => ({ id: k, name: tools[k].name, desc: tools[k].desc })));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), tools: Object.keys(tools).length });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`DevToolBox Pro running on http://localhost:${PORT}`);
  console.log(`Available tools: ${Object.keys(tools).length}`);
});

module.exports = app;
