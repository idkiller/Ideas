import path from "path";
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';

const __dirname = path.dirname(import.meta.url.substring(8));

function main() {
    const server = new MRE.WebHost({
        baseDir: path.resolve(__dirname, '../public')
    });

    server.adapter.onConnection(ctx => new App(ctx));
}

const delay = 1000;
const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');

if (isDebug) {
    setTimeout(main, delay);
}
else {
    main();
}