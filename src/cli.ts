import { program } from 'commander';
import { writeFileSync, mkdirSync } from 'fs';
import ora from 'ora';
import chalk from 'chalk';
import { inspectServer } from './inspector.js';
import { generateDiscovery } from './generator.js';
import { validateFile } from './validator.js';
 
program
  .name('mcp-discover')
  .description('Generate .well-known/mcp.json for any MCP server')
  .version('0.1.0');
 
// ── generate ─────────────────────────────────────────
program
  .command('generate')
  .description('Inspect an MCP server and generate mcp.json')
  .option('--url <url>',     'HTTP server URL, e.g. http://localhost:3001/mcp')
  .option('--command <cmd>', 'stdio server command, e.g. node')

  .option('--args <args>',   'comma-separated args for --command')
  .option('--out <path>',    'output path', '.well-known/mcp.json')
  .option('--homepage <url>','homepage URL to embed in the output')
  .action(async (opts: any) => {
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
        ? opts.out.split('/').slice(0,-1).join('/') : '.'
      if (dir !== '.') mkdirSync(dir, { recursive: true });
      writeFileSync(opts.out, JSON.stringify(doc, null, 2));
      spinner.succeed(chalk.green(`Generated: ${opts.out}`));
      console.log(chalk.gray(`  Tools:     ${caps.tools.length}`));
      console.log(chalk.gray(`  Resources: ${caps.resources.length}`));
      console.log(chalk.gray(`  Prompts:   ${caps.prompts.length}`));
    } catch (err) {
      spinner.fail(chalk.red((err as Error).message));
      process.exit(1);
    }
  });
 
// ── validate ─────────────────────────────────────────
program
  .command('validate')
  .description('Validate an existing mcp.json file')
  .argument('<file>', 'path to the mcp.json file')
  .action((file: string) => {
    const result = validateFile(file);
    if (result.valid) {
      console.log(chalk.green('Valid mcp.json'));
    } else {
      console.log(chalk.red('Invalid mcp.json:'));
      result.errors.forEach((e: any) => console.log(chalk.red(`  - ${e}`)));
      process.exit(1);
    }
  });
 
program.parse();

