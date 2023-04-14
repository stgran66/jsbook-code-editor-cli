import path from 'path';
import { Command } from 'commander';
import { serve } from '@js-notebook/local-api';

interface LocalApiError {
  code: string;
}

const isProduction = process.env.NODE_ENV === 'production';

export const serveCommand = new Command()
  .command('serve [filename]')
  .description('Open a file for editing')
  .option('-p, --port <number>', 'port to run server on', '4005')
  .action(async (filename = 'notebook.js', options: { port: string }) => {
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === 'string';
    };

    try {
      const dir = path.join(process.cwd(), path.dirname(filename));
      await serve(
        parseInt(options.port),
        path.basename(filename),
        dir,
        !isProduction
      );
      console.log(
        `Opened ${filename}. Navigate to http://localhost:${options.port} to edit the file.`
      );
    } catch (err) {
      if (isLocalApiError(err)) {
        if (err.code === 'EADDRINUS') {
          console.log('Port is in use, please try another port');
        }
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log('Unknown error', err);
      }
      process.exit(1);
    }
  });
