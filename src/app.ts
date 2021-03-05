import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Guid } from "@microsoft/mixed-reality-extension-sdk";

export default class Ideas {
    private assets: MRE.AssetContainer;

    constructor(private ctx: MRE.Context) {
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
    }

    private async started() {
        this.ctx.rpc.on("location-update", this.locationUpdated.bind(this));
    }

    private async createNote(txt: string) {
        const gltf = await this.assets.loadGltf('note.glb', 'box');
        const note = MRE.Actor.CreateFromPrefab(this.ctx, {
            firstPrefabFrom: gltf,
            actor: {
                name: 'note',
                transform: {
                    app: { position: { x: 0, y: 0.5, z: 0}}
                }
            }
        });
        MRE.Actor.Create(this.ctx, {
            actor: {
                name: 'note-txt',
                parentId: note.id,
                transform: {
                    local: {
                        position: {x: 0, y: 0, z: 0},
                        scale: {x: 1, y: 1, z: 1}
                    }
                },
                text: {
                    contents: txt,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
                    height: 0.1
                }
            }
        });

        return note;
    }

    private async locationUpdated(options: { userId: Guid; }, ...args: any[])
    {
        console.log(options);
        console.log(args);

        await this.createNote(`${args[0]}\n${args[1]}`);
    }
}