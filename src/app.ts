import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Asset, Guid } from "@microsoft/mixed-reality-extension-sdk";
import axios from 'axios';
import { Note } from "./note";

const RPC = {
    ObjectDetected: "object-detected",
    LocationChanged: "location-changed",
    UserRegister: "user-register"
}

interface User {
    token?: string,
    id: string,
    name: string,
    friends: Array<string>
}

export default class Ideas {
    private assets: MRE.AssetContainer;

    private detects: { [id: string]: Array<ObjectInfo>};

    private memos: Array<Memo>;

    private userTokenMap: { [token: string]: User };

    constructor(private ctx: MRE.Context) {
        this.userTokenMap = {};
        this.detects = {};
        this.memos = [];
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
        this.ctx.onUserJoined(this.onUserJoined.bind(this));
    }

    private async started() {
        this.ctx.rpc.on(RPC.UserRegister, this.onUserRegister.bind(this));
        this.ctx.rpc.on(RPC.ObjectDetected, this.onObjectDetected.bind(this));
        this.ctx.rpc.on(RPC.LocationChanged, this.onLocationChanged.bind(this));
    }

    private onUserJoined(user: MRE.User): void {
        console.log(`user: ${user.id}, ${user.name}, ${user.context == this.ctx}`);
        for (const k in user.properties) {
            console.log (`      ${k} : ${user.properties[k]}`);
        }
    }

    private onUserRegister(options: { userId: Guid; }, ...args: any[]) : void {
        const token = args[0];
        console.log(`User Register... : ${token}`);
        axios.get(`https://dev.arp.tizenservice.xyz/api/v1/graph/me`, {
            headers: { Authorization: `Bearer ${token}` }
        }).
        then(resp => {
            const user = resp.data as User;
            for (const t in this.userTokenMap) {
                if (this.userTokenMap[t].id == user.id) {
                    delete this.userTokenMap[t];
                    break;
                }
            }
            this.userTokenMap[token] = user;
        });
    }

    private calcDistanceTwoPosition(a: {x: number, y: number, z: number}, b: {x: number, y: number, z: number}) {
        return Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2);
    }

    private onObjectDetected(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(`onObjectDetected... user [${options.userId}]`);
        const objectType = args[0];
        const x = args[1];
        const y = args[2];
        const z = args[3];
        const position = x instanceof Number && y instanceof Number && z instanceof Number ?
            { x:0, y:0, z:0 } : {x, y, z};

        
        for (let i = 0; i < this.ctx.users.length; i++) {
            console.log(this.ctx.users[i].name);
        }
        /*
        if (this.userTokenMap[token]) {
            if (!this.detects[this.userTokenMap[token].id]) {
                this.detects[this.userTokenMap[token].id] = [];
            }
            const same = this.detects[this.userTokenMap[token].id].find(v => v.type == objectType && v.position);
            if (!same) {
                this.detects[this.userTokenMap[token].id].push({type: objectType, position});
            }

            this.syncObjects();
        }
        */
    }

    private onLocationChanged(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(`onLocationChanged... user [${options.userId}]`);
        const locationId = args[0];
        const token = args[1];
        console.log(locationId);
        console.log(token);
        axios.get(`https://dev.arp.tizenservice.xyz/api/v1/object/locations/${locationId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).
        then(resp => {
            for (let i = 0; i < this.memos.length; i++) {
                this.memos[i].linkedObject?.hide();
                this.memos[i].linkedObject = null;
            }
            this.memos = resp.data as Array<Memo>;
            this.syncObjects();
        });
    }

    private syncObjects()
    {
        if (this.memos.length < 1)
        {
            return;
        }

        for (let i = 0; i < this.memos.length; i++) {
            console.log(
                `creator: ${this.memos[i].creatorId}\n` +
                `type: ${this.memos[i].linkedObjectType}\n` +
                `contents: ${this.memos[i].contents}\n`,
                `permission: ${this.memos[i].permission}`
            );
            if (this.memos[i].linkedObject) continue;
            /*
            this.memos[i].linkedObject =
                new Note(this.ctx, this.assets, 
                    `type: ${this.memos[i].linkedObjectType}\n${this.memos[i].contents}`, 0.2, 0.2, {x:0, y:0, z:0}, `${this.memos[i].textureType}.png`);
            for (let j=0; j < this.detects.length; j++) {
                if (this.memos[i].linkedObjectType === this.detects[j].type)
                {
                    this.memos[i].linkedObject?.move(this.detects[j].position);
                    console.log(this.detects[j].position);
                    this.memos[i].linkedObject?.show();
                    break;
                }
            }
            */
        }
    }
}

interface ObjectInfo {
    type: string;
    position: {x: number, y: number, z: number};
}

interface Memo {
    textureType: string,
    type: string;
    name: string;
    permission: string;
    locationId: string;
    linkedObjectType: string;
    contents: string;
    id: string;
    creatorId: string;
    linkedObject?: Note;
}
