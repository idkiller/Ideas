import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";

export default class Ideas {

    constructor(private ctx: MRE.Context) {
        this.ctx.onStarted(() => this.started());
    }

    private async started() {
        this.ctx.rpc.on("location-update", this.locationUpdated);

        setInterval(() => {
            this.ctx.rpc.send({
                "procName" : "memo-update"
            },
            {
                "LocationName": "foobar123",
                "ObjectTypeName": "asdf456",
                "Text": Math.random().toString(36).substring(7),
                Color: 0xffffff
            })
        }, 5000);
    }

    private locationUpdated(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(options);
        console.log(args);
    }
}