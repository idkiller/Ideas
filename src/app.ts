import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";
import { Payloads } from "@microsoft/mixed-reality-extension-sdk/built/internal";

export default class Ideas {
    private text: MRE.Actor = null;
    private assets: MRE.AssetContainer;

    constructor(private ctx: MRE.Context) {
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
    }

    private async started() {
        /*
        this.ctx.rpc.on("location-update", this.locationUpdated);
        new Promise((resolve, reject) => {
            this.ctx.internal.sendPayload({
                type: 'app2engine-rpc',
                procName: "memo-update",
                args: [{
                    "LocationName": "foobar123",
                    "ObjectTypeName": "asdf456",
                    "Text": Math.random().toString(36).substring(7),
                    Color: 0xffffff
                }]
            } as Payloads.AppToEngineRPC, {resolve, reject});
        });
        */
       this.text = MRE.Actor.Create(this.ctx, {
        actor: {
            name: 'Text',
            transform: {
                app: { position: { x: 0, y: 0.5, z: 0 } }
            },
            text: {
                contents: "Hello World!",
                anchor: MRE.TextAnchorLocation.MiddleCenter,
                color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
                height: 0.3
            }
        }
    });
    }

    private locationUpdated(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(options);
        console.log(args);
    }
}