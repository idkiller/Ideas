import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";

export default class Ideas {
    private actorIndex: number;
    private assets: MRE.AssetContainer;

    constructor(private ctx: MRE.Context) {
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
    }

    private async started() {
        this.ctx.rpc.on("location-update", this.locationUpdated.bind(this));
    }

    private async createNote(txt: string, offset?: {x: number, y: number, z: number}, rotation? : {x: number, y: number, z: number}) {
        console.log("=============================== createNote start");
        this.actorIndex++;
        offset = (typeof offset === 'undefined') ? {x: 0, y: 0, z: 0} : offset;
        const gltf = await this.assets.loadGltf('postit.glb', 'box');
        const note = MRE.Actor.CreateFromPrefab(this.ctx, {
            firstPrefabFrom: gltf,
            actor: {
                name: 'note' + this.actorIndex,
                transform: {
                    app: { position: offset}
                }
            }
        });
        console.log(`position: {x: ${offset.x}, y: ${offset.y}, z: ${offset.z}}`);
        MRE.Actor.Create(this.ctx, {
            actor: {
                name: 'note-txt' + this.actorIndex,
                parentId: note.id,
                transform: {
                    local: {
                        position: {x: 0, y: 0, z: 0}
                    }
                },
                text: {
                    contents: txt,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    color: { r: 255 / 255, g: 0 / 255, b: 0 / 255 },
                    height: 0.1
                }
            }
        });
        console.log("=============================== createNote end");

        return note;
    }

    private locationUpdated(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log("=============================== 1");
        console.log(options);
        console.log(args);

        const position = {
            x: args[1],
            y: args[2],
            z: args[3]
        };

        this.createNote(`${args[0]}`, position);
        console.log("=============================== 2");
    }
}
