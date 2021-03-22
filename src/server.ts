import { resolve as resolvePath } from 'path';
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import App from './app';

function main() {
    const server = new MRE.WebHost({
        baseDir: resolvePath(__dirname, '../public')
    });

    server.adapter.onConnection(ctx => {
        console.log("CONNECTED ---- SAME CTX??? ");
        new App(ctx);
    });
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