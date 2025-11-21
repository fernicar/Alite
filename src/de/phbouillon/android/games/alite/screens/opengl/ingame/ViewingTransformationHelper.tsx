/* Alite - Discover the Universe on your Favorite Android Device
 * Copyright (C) 2015 Philipp Bouillon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful and
 * fun, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see
 * http://http://www.gnu.org/licenses/gpl-3.0.txt.
 */

import { Pool, PoolObjectFactory } from "../../framework/impl/Pool";
import { Settings } from "../Settings";
import { AliteObject, ZPositioning } from "../objects/AliteObject";
import { LaserCylinder } from "../objects/LaserCylinder";
import { SpaceObject } from "../objects/space/SpaceObject";
import { ObjectType } from "./ObjectType";
import { DepthBucket } from "./DepthBucket";

// A basic Matrix utility stub to replace android.opengl.Matrix
const Matrix = {
    multiplyMM: (result: Float32Array, resultOffset: number, lhs: Float32Array, lhsOffset: number, rhs: Float32Array, rhsOffset: number): void => {
        // This is a complex calculation. A library like gl-matrix would be required for a full implementation.
    }
};

class DistanceObjectPair {
    distance: number;
    object: AliteObject;
    constructor(distance: number, object: AliteObject) {
        this.distance = distance;
        this.object = object;
    }
}


export class ViewingTransformationHelper {
    private static readonly USE_DEPTH_BUCKETS = true;

    private distancePairs: DistanceObjectPair[] = [];
    private distanceFactory: PoolObjectFactory<DistanceObjectPair> = { createObject: () => new DistanceObjectPair(0.0, null) };
    private distancePairPool = new Pool<DistanceObjectPair>(this.distanceFactory, 1000);

    private bucketFactory: PoolObjectFactory<DepthBucket> = { createObject: () => new DepthBucket(0, 0) };
    private bucketPool = new Pool<DepthBucket>(this.bucketFactory, 50);

    private readonly objectPairComparator = (a: DistanceObjectPair, b: DistanceObjectPair): number => {
        const aMode = a.object.getZPositioningMode();
        const bMode = b.object.getZPositioningMode();

        if (aMode === ZPositioning.Front) {
            return bMode === ZPositioning.Front ? b.distance - a.distance : 1;
        }
        if (aMode === ZPositioning.Back) {
            return bMode === ZPositioning.Back ? b.distance - a.distance : -1;
        }
        // aMode is Normal
        if (bMode === ZPositioning.Front) return -1;
        if (bMode === ZPositioning.Back) return 1;

        return b.distance - a.distance;
    };

    public applyViewDirection(viewDirection: number, viewMatrix: Float32Array): void {
        // Simplified matrix transformations for different views
        // In a proper 3D engine, you would use matrix libraries like gl-matrix
        let temp: number;
        switch (viewDirection) {
            case 1: // Right
                // Simplified rotation logic
                break;
            case 2: // Rear
                // Simplified inversion logic
                break;
            case 3: // Left
                // Simplified rotation logic
                break;
        }
    }

    private sortObjects(objects: AliteObject[], viewMatrix: Float32Array, tempMatrix: Float32Array, witchSpace: boolean, ship: SpaceObject): void {
        for (const eo of objects) {
            if (witchSpace && (eo.getId() === "Planet" || eo.getId() === "Sun" || (eo instanceof SpaceObject && ObjectType.isSpaceStation(eo.getType())) || eo.getId() === "Glow")) {
                continue;
            }
            Matrix.multiplyMM(tempMatrix, 0, viewMatrix, 0, eo.getMatrix(), 0);
            const distancePair = this.distancePairPool.newObject();
            distancePair.distance = Math.abs(tempMatrix[14]);
            distancePair.object = eo;
            this.distancePairs.push(distancePair);
        }
    }

    private createSingleBucket(sortedObjectsToDraw: DepthBucket[]): void {
        const currentBucket = this.bucketPool.newObject();
        currentBucket.sortedObjects = [];
        currentBucket.near = 1.0;
        currentBucket.far = 1000000000;
        currentBucket.spaceObjectCount = 0;

        for (const p of this.distancePairs) {
            currentBucket.sortedObjects.push(p.object);
            if(p.object instanceof SpaceObject) currentBucket.spaceObjectCount++;
        }
        sortedObjectsToDraw.push(currentBucket);
    }

    private partitionDepths(sortedObjectsToDraw: DepthBucket[]): void {
        let currentBucket: DepthBucket = null;
        const behind = this.bucketPool.newObject();
        behind.near = -1;
        behind.far = -1;
        behind.spaceObjectCount = 0;
        behind.sortedObjects = [];

        for (const p of this.distancePairs) {
            if (p.object) {
                const dist = p.distance;
                let size = p.object.getBoundingSphereRadius();
                if (Settings.targetBox && p.object instanceof SpaceObject) {
                    size *= 1.3;
                }
                if (dist < -size) {
                    behind.sortedObjects.push(p.object);
                    if (p.object instanceof SpaceObject) behind.spaceObjectCount++;
                    continue;
                }

                let near = dist - size;
                const far = dist + size;
                if (near < 1.0 && far > 1.0) near = 1.0;

                if (!currentBucket) {
                    currentBucket = this.bucketPool.newObject();
                    currentBucket.sortedObjects = [p.object];
                    currentBucket.near = near;
                    currentBucket.far = far;
                    currentBucket.spaceObjectCount = p.object instanceof SpaceObject ? 1 : 0;
                } else {
                    if (far > currentBucket.near) {
                        currentBucket.sortedObjects.push(p.object);
                        if (p.object instanceof SpaceObject) currentBucket.spaceObjectCount++;
                        if (currentBucket.near > near) currentBucket.near = near;
                        if (currentBucket.far < far) currentBucket.far = far;
                    } else {
                        sortedObjectsToDraw.push(currentBucket);
                        const newFar = currentBucket.near;
                        currentBucket = this.bucketPool.newObject();
                        currentBucket.near = near;
                        currentBucket.far = newFar;
                        currentBucket.sortedObjects = [p.object];
                        currentBucket.spaceObjectCount = p.object instanceof SpaceObject ? 1 : 0;
                    }
                }
            }
        }
        if (currentBucket) sortedObjectsToDraw.push(currentBucket);
        if (behind.sortedObjects.length > 0) {
            sortedObjectsToDraw.push(behind);
        } else {
            this.bucketPool.free(behind);
        }
    }

    public clearObjects(sortedObjectsToDraw: DepthBucket[]): void {
        if (!sortedObjectsToDraw) return;
        for (const bucket of sortedObjectsToDraw) {
            this.bucketPool.free(bucket);
        }
        sortedObjectsToDraw.length = 0;
    }

    public sortAndBucketObjects(objects: AliteObject[], viewMatrix: Float32Array, tempMatrix: Float32Array, lasers: LaserCylinder[], sortedObjectsToDraw: DepthBucket[], witchSpace: boolean, ship: SpaceObject): void {
        for (const dop of this.distancePairs) this.distancePairPool.free(dop);
        this.distancePairs = [];

        this.sortObjects(objects, viewMatrix, tempMatrix, witchSpace, ship);
        this.sortObjects(lasers, viewMatrix, tempMatrix, witchSpace, ship);

        this.distancePairs.sort(this.objectPairComparator);

        sortedObjectsToDraw.length = 0;
        if (ViewingTransformationHelper.USE_DEPTH_BUCKETS) {
            this.partitionDepths(sortedObjectsToDraw);
        } else {
            this.createSingleBucket(sortedObjectsToDraw);
        }
    }
}
