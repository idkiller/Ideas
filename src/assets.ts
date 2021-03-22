import { AssetContainer, Color3, Material, MaterialLike, Mesh, MreArgumentError, PrimitiveShape, Texture } from "@microsoft/mixed-reality-extension-sdk";

export function createTexture(am: AssetContainer, name: string, uri: string) {
    const asset = am.assets.find(p => p.name === name);
    if (asset && asset instanceof Texture) {
        return asset;
    }
    return am.createTexture(name, {
        uri
    });
}

export function createMaterialFromUri(am: AssetContainer, name: string, uri: string) {
    const texture = createTexture(am, `${name}-texture`, uri);
    const asset = am.assets.find(p => p.name === name && p instanceof Material && p.material.emissiveTextureId == texture.id);
    if (asset && asset instanceof Material) {
        return asset;
    }
    return am.createMaterial(name, {
        emissiveTextureId: texture.id,
        emissiveColor: Color3.Black(),
        color: Color3.Blue()
    });
}

export function createMaterial (am: AssetContainer, name: string, definition: Partial<MaterialLike>): Material {
    const asset = am.assets.find(p => p.name === name);
    if (asset && asset instanceof Material) {
        return asset;
    }
    return am.createMaterial(name, definition);
}

export function createPlaneMesh(am: AssetContainer, name: string, width: number, height: number, uSegments = 1, vSegments = 1): Mesh {
    const asset = am.assets.find(
        p => p.name === name &&
        p.mesh.primitiveDefinition.shape == PrimitiveShape.Plane &&
        p.mesh.primitiveDefinition.dimensions?.x == width &&
        p.mesh.primitiveDefinition.dimensions?.y == height &&
        p.mesh.primitiveDefinition.dimensions?.z == 0
    );
    if (asset && asset instanceof Mesh) {
        return asset;
    }
    return am.createPrimitiveMesh(name, {
        shape: PrimitiveShape.Plane,
        dimensions: {x: width, y: height, z: 0},
        uSegments,
        vSegments
    });
}

export function createCubeMesh(am: AssetContainer, name: string, scale: {x: number, y: number, z: number}) {
    const asset = am.assets.find(
        p => p.name == name &&
        p.mesh.primitiveDefinition.shape === PrimitiveShape.Box &&
        p.mesh.primitiveDefinition.dimensions?.x === scale.x &&
        p.mesh.primitiveDefinition.dimensions?.y === scale.y &&
        p.mesh.primitiveDefinition.dimensions?.z === scale.z
    );

    if (asset && asset instanceof Mesh) {
        return asset;
    }

    return am.createPrimitiveMesh(name, { shape: PrimitiveShape.Box, dimensions: scale });
}