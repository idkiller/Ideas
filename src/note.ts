
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { AlphaMode, Color3, Quaternion, TextFontFamily, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
import { X_OK } from 'node:constants';
import { createCubeMesh, createMaterial, createMaterialFromUri, createTexture } from './assets';

export interface Component {
    hide(): void;
    show(): void;
}

export class Note implements Component {
    private plane: MRE.Actor;
    private planeMesh: MRE.Mesh;
    private bgMaterial: MRE.Material;
    private label: MRE.Actor;
    private bgTexture: MRE.Texture;
    private buttonBehavior: MRE.ButtonBehavior;
    private intervalKey: NodeJS.Timeout;

    constructor(private ctx: MRE.Context,
                private am: MRE.AssetContainer,
                private text: string,
                private width: number,
                private height: number,
                private position: { x: number, y: number, z: number },
                private bgImg?: string,
                private user?: MRE.User) {
        this.bgImg = !this.bgImg ? "postit.png" : this.bgImg;
    }

    public hide(): void {
        clearInterval(this.intervalKey);
        this.destroy();
    }

    public show(): void {
        if (!this.plane) {
            this.init();
        }
    }

    public move(position: {x?: number, y?: number, z?: number}) {
        if (this.plane) {
            const pos = this.plane.transform.app.position.clone();
            if (position.x) pos.x = position.x;
            if (position.y) pos.y = position.y;
            if (position.z) pos.z = position.z;
            this.plane.transform.app.position = pos;
        }
        else {
            if (position.x) this.position.x = position.x;
            if (position.y) this.position.y = position.y;
            if (position.z) this.position.z = position.z;
        }
    }

    private init() {
        if (!this.bgTexture) {
            this.bgTexture = createTexture(this.am, "background-texture", this.bgImg);
        }
        if (!this.bgMaterial) {
            this.bgMaterial = createMaterial(this.am, "background-material", {
                mainTextureId: this.bgTexture.id,
                alphaMode: AlphaMode.Mask
            });
        }
        if (!this.planeMesh) {
            this.planeMesh = createCubeMesh(this.am, "background-box", {x: 0, y: 1, z: 1});
        }

        this.plane = MRE.Actor.Create(this.ctx, {
            actor: {
                name: 'Note',
                exclusiveToUser: this.user ? this.user.id : undefined,
                appearance: {
                    meshId: this.planeMesh.id,
                    materialId: this.bgMaterial.id
                },
                transform: {
                    app: {
                        position: this.position
                    },
                    local: {
                        scale: {x: 0.01, y: this.width, z: this.height},
                        rotation: {x:0, y:1.0, z: 0}
                    }
                },
                collider: { geometry: { shape: MRE.ColliderType.Auto }}
            }
        });
        /*
        const duration = 5;
        const up = MRE.Vector3.Up();
        const flipAnimData = this.am.createAnimationData('DoAFlip', {
            tracks: [
                {
                    target: MRE.ActorPath("target").transform.local.rotation,
                    keyframes: [{
                        time: 0 * duration,
                        value: MRE.Quaternion.RotationAxis(up, 0)
                    }, {
                        time: 0.25 * duration,
                        value: MRE.Quaternion.RotationAxis(up, Math.PI / 2)
                    }, {
                        time: 0.5 * duration,
                        value: MRE.Quaternion.RotationAxis(up, Math.PI)
                    }, {
                        time: 0.75 * duration,
                        value: MRE.Quaternion.RotationAxis(up, 3 * Math.PI / 2)
                    }, {
                        time: 1 * duration,
                        value: MRE.Quaternion.RotationAxis(up, 2 * Math.PI)
                    }
                    ],
                    easing: MRE.AnimationEaseCurves.Linear
                }
            ]
        });

        const flipAnim = flipAnimData.bind({ target: this.plane });
        flipAnim.then(anim => {
           this.intervalKey = setInterval(() => anim.play(), 10000);
        });
        */

        let textArray = this.splitLine(this.text, 16);
        if (textArray.length > 7)
        {
            textArray = textArray.slice(0, 7);
            textArray[6] = textArray[6].slice(0, 13) + '...';
        }
        const lines = textArray.length;
        const text = textArray.join('\n');

        const topMargin = 0.01 * (lines > 10 ? 10 : lines);

        this.label = MRE.Actor.Create(this.ctx, {
            actor: {
                exclusiveToUser: this.user ? this.user.id : undefined,
                name: 'Label',
                parentId: this.plane.id,
                transform: {
                    local: {
                        //position: { x: 0.35 + topMargin, y: 0.05 , z: -0.4 },
                        position: { x: 0.05, y: 0.35 + topMargin , z: -0.4 },
                        rotation: { x: 0, y: -0.5 , z: 0},
                        scale: {x: 1, y: 1, z: 1}
                    }
                },
                text: {
                    contents: text,
                    height: 0.1,
                    anchor: MRE.TextAnchorLocation.TopLeft,
                    font: TextFontFamily.Monospace
                }
            }
        });
    }

    private splitLine(str: string, size: number): Array<string>{
        const lines = new Array<string>();

        const rawlines = str.split('\n');

        for (let l =0; l < rawlines.length; l++) {
            const lineSize = Math.ceil(rawlines[l].length / size);
            for (let i =0, offset = 0; i < lineSize; i++, offset += size) {
                const line = rawlines[l].substr(offset, size).trim();
                if (line.indexOf('\n') >= 0) {
                    lines.push(...line.split('\n'));
                }
                else {
                    lines.push(line);
                }
            }    
        }
        return lines;
    }

    private destroy() {
        this.plane?.destroy();
        this.label?.destroy();
        this.bgMaterial = null;
        this.planeMesh = null;
        this.plane = null;
        this.label = null;
    }
}