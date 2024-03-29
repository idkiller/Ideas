import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { Asset, Guid, User } from "@microsoft/mixed-reality-extension-sdk";
import axios from 'axios';
import { Note } from "./note";

const RPC = {
    ObjectDetected: "object-detected",
    LocationChanged: "location-changed",
    UserRegister: "user-register"
}

interface Noteobject {
    memoId: string,
    type: string,
    obj: Note,
    positioned: boolean,
}

interface UserInfo {
    user: MRE.User,
    location: string,
    token: string,
}

export default class Ideas {
    private assets: MRE.AssetContainer;
    private userMap: { [id: string]: UserInfo }

    private userObjects: { [userId: string]: Array<Noteobject> };

    constructor(private ctx: MRE.Context) {
        this.userMap = {};
        this.userObjects = {};
        this.assets = new MRE.AssetContainer(this.ctx);
        this.ctx.onStarted(() => this.started());
        this.ctx.onUserJoined(this.onUserJoined.bind(this));
        this.ctx.rpc.on(RPC.LocationChanged, this.onLocationChanged.bind(this));
    }

    private async started() {
        console.log("START Application");
        /*
        const note = new Note(this.ctx, this.assets, "this is a test note\nthis is a test note\nthis is a test note\nthis is a test note", 0.2, 0.2, {x: 0, y: 0, z: 0}, `postit.png`, undefined, 'keyboard');
        note.show();
        */
    }

    private onUserJoined(user: MRE.User): void {
        console.log(`user: ${user.id}, ${user.name}, ${user.context == this.ctx}`);
        for (const k in user.properties) {
            console.log (`      ${k} : ${user.properties[k]}`);
        }

        const userId = user.properties['userId'];
        this.userMap[userId] = {
            user,
            location: "",
            token: user.properties['token']
        }
        this.removeNotesFromUser(userId);
        this.userObjects[userId] = [];
        console.log(`user: ${user.name}[${userId}] is registed`);
    }

    private onLocationChanged(options: { userId: Guid; }, ...args: any[]) : void
    {
        console.log(`onLocationChanged... user [${options.userId}]`);
        if (!options.userId) return;
        const locationId = args[0];
        //const locationId = "Q31ezv5HbgkWbDcn,1x79,53";
        console.log(locationId);
        const userId = options.userId?.toString();
        if (!userId) return;
        const user = this.userMap[userId];
        if (!user) {
            console.log(`NOT FOUND USER - ${options.userId}`);
            return;
        }
        if (user && user.location !== locationId)
        {
            console.log(`[${userId}] old objects removed`);
            user.location = locationId;
            this.removeNotesFromUser(userId);
        }
        
        axios.get(`https://dev.arp.tizenservice.xyz/api/v1/object/locations/${locationId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).
        then(resp => {
            const memos = resp.data as Array<Memo>;

            const locationUsers: Array<UserInfo> = [];

            console.log(`user in location: ${locationId} - ${options.userId}, object: ${memos.length}`);
            for (const id in this.userMap) {
                if (this.userMap[id].location == locationId) {
                    locationUsers.push(this.userMap[id]);
                    console.log(` - ${this.userMap[id].user.name}[${this.userMap[id].user.id}]`);
                }
            }

            for (let m = 0; m < memos.length; m++) {
                const memo = memos[m];

                for (let i = 0; i < locationUsers.length; i++) {
                    const user = locationUsers[i];
                    const obj = new Note(this.ctx, this.assets,
                        `p: ${memo.permission}\n` +
                        `l: ${memo.locationId.substr(- 10)}\n` +
                        `t: ${memo.linkedObjectType}\n` +
                        memo.contents,
                        0.2, 0.2, {x: 0, y: 0, z: 0}, `${memo.textureType}.png`, user.user, memo.linkedObjectType);
                    this.userObjects[userId].push({
                        memoId: memo.id,
                        type: memo.linkedObjectType,
                        obj,
                        positioned: false
                    });
                    console.log(`object is created : ${memo.linkedObjectType} - ${memo.permission} - [${memo.contents}] - ${user.user.name} - ${options.userId}`);

                    obj.show();
                }
            }
        });
    }

    private removeNotesFromUser(userId: string) {
        if (userId in this.userObjects) {
            const objs = this.userObjects[userId];
            for (let i=0; i < objs.length; i++) {
                objs[i].obj.hide();
            }
            this.userObjects[userId] = [];
        }
    }
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
}
