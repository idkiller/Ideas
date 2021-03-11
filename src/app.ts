import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Asset, Guid } from "@microsoft/mixed-reality-extension-sdk";
import axios from 'axios';

const RPC = {
    ObjectDetected: "object-detected",
    LocationChanged: "location-changed"
}

export default class Ideas {
    private actorIndex: number;
    private assets: MRE.AssetContainer;

    private detects: Array<ObjectInfo>;
    private actors: Array<MRE.Actor>;

    private postitAsset: Asset[];
    private memos: Array<Memo>;

    constructor(private ctx: MRE.Context) {
        this.detects = [];
        this.actors = [];
        this.memos = [];
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
    }

    private async started() {
        console.log("start 1");
        this.postitAsset = await this.assets.loadGltf('postit.glb', 'box');
        console.log("start 2");
        this.ctx.rpc.on(RPC.ObjectDetected, this.onObjectDetected.bind(this));
        this.ctx.rpc.on(RPC.LocationChanged, this.onLocationChanged.bind(this));
    }

    private createNote(txt: string, offset?: {x: number, y: number, z: number}) {
        console.log("=============================== createNote start");
        this.actorIndex++;
        offset = (typeof offset === 'undefined') ? {x: 0, y: 0, z: 0} : offset;
        const note = MRE.Actor.CreateFromPrefab(this.ctx, {
            firstPrefabFrom: this.postitAsset,
            actor: {
                name: 'note' + this.actorIndex,
                transform: {
                    app: { position: offset }
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
                    height: 0.01
                }
            }
        });
        console.log("=============================== createNote end");
        this.actors.push(note);
        return note;
    }

    private onObjectDetected(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log("=============================== 1");
        console.log(options);
        console.log(args);

        const objectType = args[0];
        const x = args[1];
        const y = args[2];
        const z = args[3];
        const position = x instanceof Number && y instanceof Number && z instanceof Number ?
            { x:0, y:0, z:0 } : {x, y, z};

        this.detects.push({type: objectType, position});
        this.syncObjects();
        console.log("=============================== 2");
    }

    private onLocationChanged(options: { userId: Guid; }, ...args: any[]) : void
    {
        const locationId = args[0];
        axios.get(`https://dev.arp.tizenservice.xyz/api/v1/object/locations/${locationId}`).
        then(resp => {
            this.memos = resp.data as Array<Memo>;
            for (let i = 0; i < this.actors.length; i++)
            {
                this.actors[i].destroy();
            }
            this.syncObjects();
        });
    }

    private syncObjects()
    {
        console.log("syncOjbects start ..............");
        if (this.memos.length < 1)
        {
            return;
        }
        console.log("detects = " + this.detects.length);
        for (let i = 0; i < this.detects.length; i++) {
            for (let m = 0; m < this.memos.length; m++) {
                if (this.memos[m].linkedObjectType === this.detects[i].type)
                {
                    console.log(`${m} : ${this.memos[m].linkedObjectType}, ${this.memos[m].contents}`);
                    this.memos[m].linkedObject = this.createNote(
                        `[${this.memos[m].linkedObjectType}] ${this.memos[m].contents}`,
                        this.detects[i].position);
                    break;
                }
            }
        }
    }
}

interface ObjectInfo {
    type: string;
    position: {x: number, y: number, z: number};
}

interface Memo {
    type: string;
    name: string;
    permission: string;
    locationId: string;
    linkedObjectType: string;
    contents: string;
    id: string;
    creatorId: string;
    linkedObject?: MRE.Actor;
}
