#!/usr/bin/env node
import { program } from 'commander';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import os from 'os';
import path from 'path';
import https from 'https';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                }
                catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}
import ora from 'ora';
import chalk from 'chalk';
import { inspectServer } from './inspector.js';
import { generateDiscovery } from './generator.js';
import { validateFile } from './validator.js';
import { buildIndex, getCachePath } from './registry/index.js';
import { searchIndex } from './search.js';
program
    .name('mcp-discover')
    .description('Generate .well-known/mcp.json for any MCP server')
    .version(pkg.version);
// ── generate ─────────────────────────────────────────
program
    .command('generate')
    .description('Inspect an MCP server and generate mcp.json')
    .option('--url <url>', 'HTTP server URL, e.g. http://localhost:3001/mcp')
    .option('--command <cmd>', 'stdio server command, e.g. node')
    .option('--args <args>', 'comma-separated args for --command')
    .option('--out <path>', 'output path', '.well-known/mcp.json')
    .option('--homepage <url>', 'homepage URL to embed in the output')
    .action(async (opts) => {
    const spinner = ora('Connecting to MCP server...').start();
    try {
        const caps = await inspectServer({
            url: opts.url,
            command: opts.command,
            args: opts.args?.split(','),
        });
        spinner.text = 'Generating discovery document...';
        const doc = generateDiscovery(caps, { homepage: opts.homepage });
        const dir = opts.out.includes('/')
            ? opts.out.split('/').slice(0, -1).join('/') : '.';
        if (dir !== '.')
            mkdirSync(dir, { recursive: true });
        writeFileSync(opts.out, JSON.stringify(doc, null, 2));
        spinner.succeed(chalk.green(`Generated: ${opts.out}`));
        console.log(chalk.gray(`  Tools:     ${caps.tools.length}`));
        console.log(chalk.gray(`  Resources: ${caps.resources.length}`));
        console.log(chalk.gray(`  Prompts:   ${caps.prompts.length}`));
    }
    catch (err) {
        spinner.fail(chalk.red(err.message));
        process.exit(1);
    }
});
// ── validate ─────────────────────────────────────────
program
    .command('validate')
    .description('Validate an existing mcp.json file')
    .argument('<file>', 'path to the mcp.json file')
    .action((file) => {
    const result = validateFile(file);
    if (result.valid) {
        console.log(chalk.green('Valid mcp.json'));
    }
    else {
        console.log(chalk.red('Invalid mcp.json:'));
        result.errors.forEach((e) => console.log(chalk.red(`  - ${e}`)));
        process.exit(1);
    }
});
// ── index ─────────────────────────────────────────
program
    .command('index')
    .description('Build and cache the MCP server index')
    .option('--refresh', 'force rebuild the index')
    .option('--json', 'output the full index as JSON')
    .action(async (opts) => {
    const spinner = ora('Building MCP server index...').start();
    try {
        const index = await buildIndex(opts.refresh);
        spinner.succeed(chalk.green(`Index built: ${index.totalServers} servers found`));
        console.log(chalk.gray(`  Cache: ${getCachePath()}`));
        if (opts.json) {
            console.log(JSON.stringify(index, null, 2));
        }
    }
    catch (err) {
        spinner.fail(chalk.red(err.message));
        process.exit(1);
    }
});
// ── search ─────────────────────────────────────────
program
    .command('search')
    .description('Search MCP servers by keyword')
    .argument('[query]', 'search query')
    .option('--refresh', 'rebuild index before searching')
    .option('--json', 'output results as JSON')
    .action(async (query, opts) => {
    const spinner = ora('Loading index...').start();
    try {
        const index = await buildIndex(opts.refresh);
        spinner.stop();
        const results = searchIndex(index, query || '');
        if (opts.json) {
            console.log(JSON.stringify(results, null, 2));
            return;
        }
        if (results.totalFound === 0) {
            console.log(chalk.yellow('No servers found matching your query.'));
            return;
        }
        const toShow = results.servers.slice(0, 20);
        for (const server of toShow) {
            const badge = server.source === 'local' ? chalk.green(' [installed]') : '';
            const downloads = server.weeklyDownloads ? chalk.gray(` (${server.weeklyDownloads} weekly)`) : '';
            console.log(`${chalk.bold(server.name)}${badge}${downloads}`);
            console.log(`  ${server.description}`);
            if (server.keywords.length > 0) {
                const keywords = server.keywords.slice(0, 5).join(', ');
                console.log(chalk.gray(`  Keywords: ${keywords}`));
            }
            console.log(chalk.gray(`  Install: ${server.installCommand}`));
            console.log();
        }
        if (results.totalFound > 20) {
            console.log(chalk.gray(`...and ${results.totalFound - 20} more. Use --json to see all.`));
        }
    }
    catch (err) {
        spinner.fail(chalk.red(err.message));
        process.exit(1);
    }
});
// ── inspect ─────────────────────────────────────────
program
    .command('inspect')
    .description('Show detailed info about an MCP server')
    .argument('<name>', 'server name')
    .option('--json', 'output as JSON')
    .action(async (name, opts) => {
    const spinner = ora('Loading index...').start();
    try {
        const index = await buildIndex();
        spinner.stop();
        // Find server by exact name or last segment of scoped name
        let server = index.servers.find(s => s.name === name);
        if (!server && name.includes('/')) {
            const lastSegment = name.split('/').pop();
            server = index.servers.find(s => s.name.endsWith(`/${lastSegment}`));
        }
        if (!server) {
            console.log(chalk.red(`Server "${name}" not found in index.`));
            console.log(chalk.gray('Try running: mcp-discover index --refresh'));
            process.exit(1);
        }
        if (opts.json) {
            console.log(JSON.stringify(server, null, 2));
            return;
        }
        console.log(chalk.bold(server.name));
        console.log(`Version: ${server.version}`);
        console.log(`Source: ${server.source}`);
        if (server.homepage) {
            console.log(`Homepage: ${server.homepage}`);
        }
        if (server.weeklyDownloads) {
            console.log(`Weekly downloads: ${server.weeklyDownloads}`);
        }
        console.log(`Description: ${server.description}`);
        if (server.keywords.length > 0) {
            console.log(`Keywords: ${server.keywords.join(', ')}`);
        }
        console.log(`Install: ${server.installCommand}`);
    }
    catch (err) {
        spinner.fail(chalk.red(err.message));
        process.exit(1);
    }
});
// ── tools ─────────────────────────────────────────
program
    .command('tools')
    .description('Show tools available in an MCP server package')
    .argument('<package>', 'npm package name')
    .option('--refresh', 'skip cache and force fresh inspection')
    .option('--json', 'output raw JSON instead of formatted')
    .action(async (pkgName, opts) => {
    const sanitized = pkgName.replace(/[@/\s]/g, '-');
    const cacheDir = path.join(os.homedir(), '.mcp-discover', 'tools-cache');
    const cachePath = path.join(cacheDir, `${sanitized}.json`);
    // Check cache
    if (!opts.refresh && existsSync(cachePath)) {
        try {
            const cache = JSON.parse(readFileSync(cachePath, 'utf8'));
            const cachedAt = new Date(cache.cachedAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
            if (hoursDiff < 24) {
                if (opts.json) {
                    console.log(JSON.stringify(cache, null, 2));
                }
                else {
                    console.log(chalk.bold(`Tools from cache (${Math.round(hoursDiff)}h old):`));
                    cache.tools.forEach((tool) => {
                        console.log(`- ${chalk.bold(tool.name)}: ${tool.description || 'No description'}`);
                    });
                }
                return;
            }
        }
        catch (err) {
            // Invalid cache, continue
        }
    }
    // Fetch from npm registry
    const spinner = ora('Fetching package info from npm...').start();
    let homepage;
    try {
        const pkgData = await fetchJson(`https://registry.npmjs.org/${pkgName}`);
        homepage = pkgData.homepage || pkgData.repository?.url;
        if (homepage && homepage.startsWith('git+'))
            homepage = homepage.slice(4);
        if (homepage && homepage.endsWith('.git'))
            homepage = homepage.slice(0, -4);
    }
    catch (err) {
        spinner.fail(chalk.red('Failed to fetch package info'));
        process.exit(1);
    }
    if (!homepage) {
        spinner.fail(chalk.red('No homepage found for package'));
        process.exit(1);
    }
    // Try to fetch mcp.json
    spinner.text = 'Checking for mcp.json...';
    try {
        const mcpData = await fetchJson(`${homepage}/.well-known/mcp.json`);
        if (mcpData.tools && Array.isArray(mcpData.tools)) {
            spinner.succeed(chalk.green('Found mcp.json'));
            // Save cache
            mkdirSync(cacheDir, { recursive: true });
            const cacheData = {
                cachedAt: new Date().toISOString(),
                ...mcpData
            };
            writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
            // Print
            if (opts.json) {
                console.log(JSON.stringify(cacheData, null, 2));
            }
            else {
                console.log(chalk.bold('Tools:'));
                mcpData.tools.forEach((tool) => {
                    console.log(`- ${chalk.bold(tool.name)}: ${tool.description || 'No description'}`);
                });
            }
            return;
        }
    }
    catch (err) {
        // Not found, continue
    }
    // Not found, ask to install temporarily
    spinner.stop();
    console.log(chalk.yellow('mcp.json not found for this server.'));
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    await new Promise((resolve) => {
        rl.question('Press Enter to temporarily install and inspect, or Ctrl+C to cancel: ', () => {
            rl.close();
            resolve();
        });
    });
    const installSpinner = ora('Installing package globally...').start();
    let discovery;
    try {
        execSync(`npm install -g ${pkgName}`, { stdio: 'pipe' });
        installSpinner.text = 'Fetching package bin info...';
        // Fetch bin info after install
        const pkgData = await fetchJson(`https://registry.npmjs.org/${pkgName}`);
        const fallbackCommand = pkgName.split('/').pop() || pkgName;
        let commandName = fallbackCommand;
        if (pkgData.bin) {
            if (typeof pkgData.bin === 'string') {
                commandName = fallbackCommand; // string bin means use package name
            }
            else if (typeof pkgData.bin === 'object' && pkgData.bin) {
                commandName = Object.keys(pkgData.bin)[0];
            }
        }
        installSpinner.text = 'Inspecting server...';
        let caps;
        try {
            caps = await inspectServer({ command: commandName });
        }
        catch (inspectErr) {
            installSpinner.warn(chalk.yellow(`Could not connect to server — it may require configuration (API keys, env vars) to run`));
            console.log(chalk.gray(`Command attempted: ${commandName}`));
            // Still save empty cache to avoid retrying
            caps = { name: 'Unknown', version: '0.0.0', tools: [], resources: [], prompts: [] };
        }
        installSpinner.text = 'Generating discovery...';
        discovery = generateDiscovery(caps, { homepage });
    }
    finally {
        installSpinner.text = 'Uninstalling package...';
        try {
            execSync(`npm uninstall -g ${pkgName}`, { stdio: 'pipe' });
        }
        catch (uninstallErr) {
            // Ignore uninstall errors
        }
    }
    installSpinner.succeed(chalk.green('Inspection complete'));
    // Save cache
    mkdirSync(cacheDir, { recursive: true });
    const cacheData = {
        cachedAt: new Date().toISOString(),
        ...discovery
    };
    writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    // Print
    if (opts.json) {
        console.log(JSON.stringify(cacheData, null, 2));
    }
    else {
        console.log(chalk.bold('Tools:'));
        discovery.tools.forEach((tool) => {
            console.log(`- ${chalk.bold(tool.name)}: ${tool.description || 'No description'}`);
        });
    }
});
program.parse();
