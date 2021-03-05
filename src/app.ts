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
        //this.ctx.rpc.on("location-update", this.locationUpdated.bind(this));
        this.actorIndex = 0;

        await this.createNote("0, 0, 0", {x: -1, y: 0, z: 1}, {x: 0, y: 0, z: 0});
        await this.createNote("90, 0, 0", {x: 0, y: 0, z: 1}, {x: 90, y: 0, z: 0});
        await this.createNote("0, 90, 0", {x: 1, y: 0, z: 1}, {x: 0, y: 90, z: 0});
        await this.createNote("0, 0, 90", {x: 2, y: 0, z: 1}, {x: 0, y: 0, z: 90});
    }

    private async createNote(txt: string, offset?: {x: number, y: number, z: number}, rotation? : {x: number, y: number, z: number}) {
        console.log("=============================== createNote start");
        this.actorIndex++;
        offset = (typeof offset === 'undefined') ? {x: 0, y: 0, z: 1} : offset;
        rotation = (typeof offset === 'undefined') ? {x: 90, y: 0, z: 0} : rotation;
        const gltf = await this.assets.loadGltf('note.glb', 'box');
        const note = MRE.Actor.CreateFromPrefab(this.ctx, {
            firstPrefabFrom: gltf,
            actor: {
                name: 'note' + this.actorIndex,
                transform: {
                    local: {
                        position: offset,
                        scale: { x: 0.02, y: 0.02, z: 0.02},
                        rotation
                    }
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
                        position: {x: 0, y: 0, z: 0},
                        scale: {x: 1, y: 1, z: 1},
                        rotation: {x: 0, y: 0, z: 90}
                    }
                },
                text: {
                    contents: txt,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    color: { r: 255 / 255, g: 0 / 255, b: 0 / 255 },
                    height: 1
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

        this.createNote(`${args[0]}\n${args[1]}`, {
                x: this.getRandomInt(-1, 2),
                y: this.getRandomInt(-1, 2),
                z: this.getRandomInt(-1, 2)
            });
        console.log("=============================== 2");
    }

    private getRandomInt(min: number, max: number) : number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
      }
}
