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

// d:\TOM\java\oolite-master\Resources\Config\autoAImap.plist
// http://wiki.alioth.net/index.php/State_machine
// http://wiki.alioth.net/index.php/OXP_howto_AI
// http://wiki.alioth.net/index.php/Oolite_PriorityAI_Tutorial
// d:\TOM\java\oolite-master\Resources\Scripts\oolite-priorityai.js

import { Timer } from "../../../../../../../../framework/Timer";
import { Quaternion } from "../../../../../../../../framework/math/Quaternion";
import { Vector3f } from "../../../../../../../../framework/math/Vector3f";
import { Alite } from "../../../../Alite";
import { AliteLog } from "../../../../AliteLog";
import { Settings } from "../../../../Settings";
import { TradeGoodStore } from "../../../../model/trading/TradeGoodStore";
import { InGameManager } from "../../ingame/InGameManager";
import { ObjectType } from "../../ingame/ObjectType";
import { BreakDown } from "./curves/BreakDown";
import { BreakUp } from "./curves/BreakUp";
import { Curve } from "./curves/Curve";
import { SpaceObject } from "./SpaceObject";
import { WayPoint } from "./WayPoint";
import { AiStateCallback } from "./AiStateCallback";
import { SpaceObjectFactory } from "./SpaceObjectFactory";
import { AIMethod } from "./AIMethod";
import { MathHelper } from "../../../../../../../../framework/MathHelper";

export class SpaceObjectAI {
    private static readonly serialVersionUID = 8646121427456794783;

    public static readonly AI_STATE_GLOBAL = "GLOBAL";
    public static readonly AI_STATE_ATTACK = "FIGHTING";
    public static readonly AI_STATE_FLEE = "FLEEING";
    public static readonly AI_STATE_LURKING = "LURKING";
    public static readonly AI_STATE_FLY_STRAIGHT = "FLY_STRAIGHT";
    public static readonly AI_STATE_FLY_PATH = "FLY_PATH";
    public static readonly AI_STATE_EVADE = "EVADE";
    public static readonly AI_STATE_TRACK = "TRACK";
    public static readonly AI_STATE_MISSILE_TRACK = "MISSILE_TRACK";
    public static readonly AI_STATE_FOLLOW_CURVE = "FOLLOW_CURVE";

    private static readonly FIRE_MISSILE_UPON_FIRST_HIT_PROBABILITY = 5.0;
    private static readonly BASE_DELAY_BETWEEN_SHOOT_CHECKS = 59880239; // 16.7 FPS
    private static readonly SHOOT_DELAY_REDUCE_PER_RATING_LEVEL = 3318363; // 1.6625 Delta FPS

    private static readonly priorityMessages = new Set<string>([
        "ENTER", "EXIT", "UPDATE",
        "LAUNCHED OKAY", "FRUSTRATED", "DESIRED_RANGE_ACHIEVED", "APPROACHING_SURFACE", "LEAVING_SURFACE",
        "TARGET_LOST", "WITCHSPACE OKAY", "STATION_LAUNCHED_SHIP", "ECM", "PLAYER WITCHSPACE", "CLOSE CONTACT",
        "POSITIVE X TRAVERSE", "NEGATIVE X TRAVERSE", "POSITIVE Y TRAVERSE", "NEGATIVE Y TRAVERSE",
        "POSITIVE Z TRAVERSE", "NEGATIVE Z TRAVERSE", "ATTACKED", "ATTACKED_BY_CLOAKED", "NAVPOINT_REACHED",
        "ENDPOINT_REACHED", "CASCADE_WEAPON_DETECTED", "ATTACKER_MISSED", "INCOMING_MISSILE", "COLLISION",
        "ENERGY_LOW", "LANDED_ON_PLANET", "OFFENCE_COMMITTED", "FOUND_PILOT", "PILOT_ARRIVED", "GROUP_ATTACK_TARGET",
        "HAZARD_CAN_BE_DESTROYED", "WITCHSPACE UNAVAILABLE", "WITCHSPACE BLOCKED", "ACCEPT_DISTRESS_CALL",
        "DOCKING_REQUESTED", "GREEN_ALERT", "YELLOW_ALERT", "RED_ALERT", "ENTER WORMHOLE", "EXITED WITCHSPACE",
        "PLAYER WITCHSPACE"
    ]);

    // => ~30 FPS at Elite.
    private readonly so: SpaceObject;

    private readonly q1 = new Quaternion();
    private readonly q2 = new Quaternion();
    private readonly q3 = new Quaternion();
    private readonly v0 = new Vector3f(0, 0, 0);
    private readonly v1 = new Vector3f(0, 0, 0);
    private readonly v2 = new Vector3f(0, 0, 0);
    private readonly v3 = new Vector3f(0, 0, 0);

    private readonly currentState: string[] = [];
    private target: SpaceObject = null;
    private readonly evadePosition = new Vector3f(0, 0, 0);
    private evadeRangeSq = 0;
    private readonly waypoints: WayPoint[] = [];
    private currentDistance = -1;
    private pitchingOver = false;
    private flightRoll = 0.0;
    private flightPitch = 0.0;
    private waitForSafeZoneExit = false;
    private readonly lastShootCheck = new Timer().setAutoResetWithImmediateAtFirstCall();
    private curve: Curve = null;
    private readonly curveFollowStart = new Timer();
    private readonly lastRotation = new Vector3f(0, 0, 0);

    //	private Timer updateTimer = new Timer().setAutoReset();
    //	private float pauseAI = 1f / 8; // sec;
    private stateName = SpaceObjectAI.AI_STATE_GLOBAL;
    private lastMessage: string;
    private timeSpent: number;

    constructor(so: SpaceObject) {
        this.so = so;
        this.currentState.push(SpaceObjectAI.AI_STATE_GLOBAL);
    }

    orientUsingRollPitchOnly(targetPosition: Vector3f, deltaTime: number): void {
        this.trackInternal(targetPosition, 1000.0, deltaTime, false);
        this.executeSteeringNoSpeedChange(targetPosition);
    }

    private trackTargetPosition(deltaTime: number): number {
        Quaternion.fromMatrix(this.so.getMatrix(), this.q1);
        this.q1.normalize();

        this.so.getPosition().sub(this.target.getPosition(), this.v0);
        this.v0.normalize();

        this.target.getUpVector().cross(this.v0, this.v1);
        this.v1.normalize();
        this.v0.cross(this.v1, this.v2);
        this.v2.normalize();

        Quaternion.fromVectors(this.v1, this.v2, this.v0, this.q2);
        this.q2.normalize();
        this.q1.computeDifference(this.q2, this.q3);
        this.q3.normalize();

        this.q3.axisOfRotation(this.v0);
        let angle = Math.toDegrees(this.q3.angleOfRotation());
        if (angle > 180) {
            angle = 360 - angle;
            this.v0.negate();
        }
        const absAngle = Math.abs(angle);
        if (deltaTime > 0) {
            angle = this.clamp(angle, -this.so.getMaxPitchSpeed(), this.so.getMaxPitchSpeed()) * deltaTime;
        }
        if (Math.abs(angle) > 0.0001 && !isFinite(angle) && !isNaN(angle)) {
            // TODO: Matrix.rotateM(this.so.getMatrix(), 0, angle, this.v0.x, this.v0.y, this.v0.z);
            this.so.extractVectors();
        }

        return absAngle;
    }

    private trackInternal(targetPosition: Vector3f, desiredRangeSq: number, deltaTime: number, retreat: boolean): number {
        let rate1 = 2.0 * deltaTime;
        let rate2 = 4.0 * deltaTime;
        let stickRoll = 0.0;
        let stickPitch = 0.0;
        let reverse = 1.0;
        const minD = 0.004;
        let maxCos = 0.995;

        const maxPitch = this.so.getMaxPitchSpeed() * 30 * deltaTime;
        const maxRoll = this.so.getMaxRollSpeed() * 30 * deltaTime;

        if (retreat) {
            reverse = -reverse;
        }

        this.so.getPosition().sub(targetPosition, this.v0);
        const rangeSq = this.v0.lengthSq();
        if (rangeSq > desiredRangeSq) {
            maxCos = Math.sqrt(1.0 - 0.90 * desiredRangeSq / rangeSq);
        }
        if (this.v0.isZeroVector()) {
            this.v0.z = 1.0;
        } else {
            this.v0.normalize();
        }

        const dRight = this.v0.dot(this.so.getRightVector());
        let dUp = this.v0.dot(this.so.getUpVector());
        let dForward = this.v0.dot(this.so.getForwardVector());

        if (this.pitchingOver) {
            //maxPitch *= 4.0;
            //maxRoll *= 4.0;
            if (reverse * dUp < 0) {
                stickPitch = maxPitch;
            } else {
                stickPitch = -maxPitch;
            }
            this.pitchingOver = reverse * dForward < 0.707;
        }
        if (dForward < maxCos || retreat) {
            if (dForward <= -maxCos) {
                dUp = minD * 2.0;
            }
            if (dUp > minD) {
                let factor = Math.floor(Math.sqrt(Math.abs(dRight) / Math.abs(minD)));
                if (factor > 8) {
                    factor = 8;
                }
                if (dRight > minD) {
                    stickRoll = -maxRoll * 0.125 * factor;
                }
                if (dRight < -minD) {
                    stickRoll = maxRoll * 0.125 * factor;
                }
                if (Math.abs(dRight) < Math.abs(stickRoll) * deltaTime) {
                    stickRoll = Math.abs(dRight) / deltaTime * (stickRoll < 0 ? -1 : 1);
                }
            }
            if (dUp < -minD) {
                let factor = Math.floor(Math.sqrt(Math.abs(dRight) / Math.abs(minD)));
                if (factor > 8) {
                    factor = 8;
                }
                if (dRight > minD) {
                    stickRoll = maxRoll * 0.125 * factor;
                }
                if (dRight < -minD) {
                    stickRoll = -maxRoll * 0.125 * factor;
                }
                if (Math.abs(dRight) < Math.abs(stickRoll) * deltaTime) {
                    stickRoll = Math.abs(dRight) / deltaTime * (stickRoll < 0 ? -1 : 1);
                }
            }
            if (Math.abs(stickRoll) < 0.0001) {
                let factor = Math.floor(Math.sqrt(Math.abs(dUp) / Math.abs(minD)));
                if (factor > 8) {
                    factor = 8;
                }
                if (dUp > minD) {
                    stickPitch = -maxPitch * reverse * 0.125 * factor;
                }
                if (dUp < -minD) {
                    stickPitch = maxPitch * reverse * 0.125 * factor;
                }
                if (Math.abs(dUp) < Math.abs(stickPitch) * deltaTime) {
                    stickPitch = Math.abs(dUp) / deltaTime * (stickPitch < 0 ? -1 : 1);
                }
            }
        }

        if (stickRoll > 0.0 && this.flightRoll < 0.0 || stickRoll < 0.0 && this.flightRoll > 0.0) {
            rate1 *= 4.0;
        }
        if (stickPitch > 0.0 && this.flightPitch < 0.0 || stickPitch < 0.0 && this.flightPitch > 0.0) {
            rate2 *= 4.0;
        }

        if (this.flightRoll < stickRoll - rate1) {
            stickRoll = this.flightRoll + rate1;
        }
        if (this.flightRoll > stickRoll + rate1) {
            stickRoll = this.flightRoll - rate1;
        }
        if (this.flightPitch < stickPitch - rate2) {
            stickPitch = this.flightPitch + rate2;
        }
        if (this.flightPitch > stickPitch + rate2) {
            stickPitch = this.flightPitch - rate2;
        }

        this.flightRoll = stickRoll;
        this.flightPitch = stickPitch;


        if (retreat) {
            dForward *= dForward;
        }
        if (dForward < 0.0) {
            return 0.0;
        }

        if (Math.abs(this.flightRoll) < 0.0001 && Math.abs(this.flightPitch) < 0.0001) {
            return 1.0;
        }

        return dForward;
    }

    private executeSteering(desiredSpeed: number, targetPosition?: Vector3f): number {
        targetPosition = targetPosition === undefined ? (this.target == null ? null : this.target.getPosition()) : targetPosition;
        const angle = this.executeSteeringNoSpeedChange(targetPosition);
        if (targetPosition != null) {
            if (desiredSpeed > this.so.getMaxSpeed()) {
                this.so.adjustSpeed(-this.so.getMaxSpeed());
            } else if (desiredSpeed < 0) {
                this.calculateTrackingSpeed(angle);
            } else {
                this.so.adjustSpeed(-desiredSpeed);
            }
        }
        return angle;
    }

    private executeSteeringNoSpeedChange(targetPosition: Vector3f): number {
        this.so.applyDeltaRotation(this.flightPitch, 0, this.flightRoll);
        if (this.so.isPlayer()) {
            Alite.getInstance().getCobra().setRotation(this.flightPitch, this.flightRoll);
        }
        if (targetPosition == null) {
            return 90; // To make sure this doesn't fire randomly...
        }
        this.so.getPosition().copy(this.v0);
        this.v0.sub(targetPosition);
        this.v0.normalize();
        return this.so.getForwardVector().angleInDegrees(this.v0);
    }

    private clamp(val: number, min: number, max: number): number {
        return val < min ? min : val > max ? max : val;
    }

    orient(targetPosition: Vector3f, targetUp: Vector3f, deltaTime: number): void {
        Quaternion.fromMatrix(this.so.getMatrix(), this.q1);
        this.q1.normalize();

        this.so.getPosition().sub(targetPosition, this.v0);
        this.v0.normalize();

        targetUp.cross(this.v0, this.v1);
        this.v1.normalize();
        this.v0.cross(this.v1, this.v2);
        this.v2.normalize();

        Quaternion.fromVectors(this.v1, this.v2, this.v0, this.q2);
        this.q2.normalize();
        this.q1.computeDifference(this.q2, this.q3);
        this.q3.normalize();

        this.q3.axisOfRotation(this.v0);
        let angle = Math.toDegrees(this.q3.angleOfRotation());
        if (angle > 180) {
            angle = 360 - angle;
            this.v0.negate();
        }
        if (deltaTime > 0) {
            angle = this.clamp(angle, -this.so.getMaxPitchSpeed() * 40, this.so.getMaxPitchSpeed() * 40) * deltaTime;
        }
        if (Math.abs(angle) > 0.0001 && !isFinite(angle) && !isNaN(angle)) {
            // TODO: Matrix.rotateM(this.so.getMatrix(), 0, angle, this.v0.x, this.v0.y, this.v0.z);
            if (this.so.isPlayer()) {
                this.v1.x = 1;
                this.v1.y = 0;
                this.v1.z = 0;
                this.v2.x = 0;
                this.v2.y = 0;
                this.v2.z = 1;
                Alite.getInstance().getCobra().setRotation(this.v0.dot(this.v1), this.v0.dot(this.v2));
            }
            this.so.extractVectors();
        }
    }

    private calculateTrackingSpeed(angle: number): void {
        if (this.so.getType() === ObjectType.Missile) {
            this.calculateMissileSpeed(angle);
            return;
        }
        if (angle > 50) {
            this.so.adjustSpeed(-this.so.getMaxSpeed() * 0.2);
        } else if (angle > 40) {
            this.so.adjustSpeed(-this.so.getMaxSpeed() * 0.4);
        } else if (angle > 30) {
            this.so.adjustSpeed(-this.so.getMaxSpeed() * 0.6);
        } else if (angle > 20) {
            this.so.adjustSpeed(-this.so.getMaxSpeed() * 0.7);
        } else if (angle > 10) {
            this.so.adjustSpeed(-this.so.getMaxSpeed() * 0.8);
        } else {
            this.so.adjustSpeed(-this.so.getMaxSpeed());
        }
    }

    private calculateMissileSpeed(angle: number): void {
        if (angle > 50) {
            this.so.setSpeed(-this.so.getMaxSpeed() * 0.3);
        } else if (angle > 40) {
            this.so.setSpeed(-this.so.getMaxSpeed() * 0.4);
        } else if (angle > 30) {
            this.so.setSpeed(-this.so.getMaxSpeed() * 0.5);
        } else if (angle > 20) {
            this.so.setSpeed(-this.so.getMaxSpeed() * 0.6);
        } else if (angle > 10) {
            this.so.setSpeed(-this.so.getMaxSpeed() * 0.7);
        } else {
            this.so.setSpeed(-this.so.getMaxSpeed());
        }
    }

    private avoidCollision(): void {
        const proximity = this.so.getProximity();
        if (proximity != null && !this.so.isInBay()) {
            this.pushState(SpaceObjectAI.AI_STATE_EVADE);
        }
    }

    private attackObject(deltaTime: number): void {
        if (this.target.isPlayer()) {
            if (InGameManager.playerInSafeZone && this.so.getType() !== ObjectType.Police && !this.so.isIgnoreSafeZone()) {
                this.waitForSafeZoneExit = true;
                this.pushState(SpaceObjectAI.AI_STATE_FLEE);
                return;
            }
        }
        this.trackInternal(this.target.getPosition(), 1000.0, deltaTime, false);
        this.avoidCollision();
        const angle = this.executeSteering(-1);
        const distanceSq = this.so.getPosition().distanceSq(this.target.getPosition());
        if (angle >= 10 || distanceSq >= this.so.getShootRangeSq() || this.so.hasEjected()) {
            return;
        }
        if (this.target.isCloaked()) {
            return;
        }
        const rating = Alite.getInstance().getPlayer().getRating();
        if (rating < 7 && !this.lastShootCheck.hasPassedNanos(
            SpaceObjectAI.BASE_DELAY_BETWEEN_SHOOT_CHECKS - (rating + 2) * SpaceObjectAI.SHOOT_DELAY_REDUCE_PER_RATING_LEVEL)) {
            return;
        }
        if (Alite.getInstance().getLaserManager() != null && this.so.getAggressionLevel() > Math.random() * 256) {
            Alite.getInstance().getLaserManager().fire(this.so, this.target);
        }
    }

    private fleeObject(deltaTime: number): void {
        if (this.target.isPlayer()) {
            if (!InGameManager.playerInSafeZone && this.waitForSafeZoneExit) {
                this.popState();
                this.waitForSafeZoneExit = false;
                return;
            }
        }
        this.trackInternal(this.target.getPosition(), 1000.0, deltaTime, true);
        this.avoidCollision();
        this.executeSteering(this.so.getMaxSpeed());
    }

    private flyPath(deltaTime: number): void {
        if (this.waypoints.length === 0) {
            this.popState();
            if (this.currentState.length === 0) {
                this.setState(SpaceObjectAI.AI_STATE_GLOBAL);
            }
            this.so.aiStateCallback(AiStateCallback.EndOfWaypointsReached);
            return;
        }
        const wp = this.waypoints[0];
        const d = this.trackInternal(wp.position, 1000.0, deltaTime, false);
        let targetSpeed = wp.orientFirst ? 0.0 : this.so.getMaxSpeed();
        if (Math.abs(1.0 - d) < 0.01 && wp.orientFirst) {
            targetSpeed = this.so.getMaxSpeed();
            wp.orientFirst = false;
        }
        this.so.adjustSpeed(-targetSpeed);
        this.avoidCollision();
        this.executeSteering(targetSpeed, wp.position);
        const distance = this.so.getPosition().distanceSq(wp.position);
        if (distance < 1000 || this.currentDistance > 0 && this.currentDistance < 40000 && distance > this.currentDistance) {
            this.currentDistance = -1;
            wp.reached();
            this.waypoints.shift();
        } else {
            this.currentDistance = distance;
        }
    }

    private followCurve(): void {
        this.curve.compute(this.curveFollowStart.getPassedSeconds());

        this.so.setPosition(this.curve.getCurvePosition());
        this.so.setForwardVector(this.curve.getcForward());
        this.so.setRightVector(this.curve.getcRight());
        this.so.setUpVector(this.curve.getcUp());

        this.curve.getCurveRotation().copy(this.v0);
        this.so.applyDeltaRotation(this.v0.x, this.v0.y, this.v0.z);
        this.so.assertOrthoNormal();

        //		this.avoidCollision();

        if (this.curve.reachedEnd()) {
            this.popState();
            if (this.currentState.length === 0) {
                this.so.setSpeed(0);
                this.setState(SpaceObjectAI.AI_STATE_GLOBAL);
            }
        }
    }

    private updateEvade(deltaTime: number): void {
        const distanceSq = this.so.getPosition().distanceSq(this.evadePosition);
        const proximity = this.so.getProximity();
        let clearEvade = false;
        if (proximity != null && ObjectType.isSpaceStation(proximity.getType())) {
            let maxExtentSq = proximity.getMaxExtent();
            maxExtentSq *= maxExtentSq;
            clearEvade = distanceSq > maxExtentSq;
        }
        if (clearEvade || distanceSq > this.evadeRangeSq || proximity == null || proximity.getHullStrength() <= 0) {
            this.so.setProximity(null);
            this.popState();
            if (this.currentState.length === 0) {
                this.setState(SpaceObjectAI.AI_STATE_GLOBAL);
            }
            return;
        }
        proximity.getPosition().sub(this.so.getPosition(), this.v0);
        this.v0.scale(0.5);
        this.v0.add(this.so.getPosition());
        this.v0.copy(this.evadePosition);
        this.evadeRangeSq = (proximity.getBoundingSphereRadiusSq() * 3.0 + this.so.getBoundingSphereRadiusSq() * 3.0) * 18;
        const dForward = this.trackInternal(this.evadePosition, this.evadeRangeSq, deltaTime, true);
        this.executeSteering(this.so.getMaxSpeed() * (0.5 * dForward + 0.5));
    }

    private updateTrack(deltaTime: number): void {
        if (this.so.getType() === ObjectType.Missile) {
            this.calculateMissileSpeed(this.trackTargetPosition(deltaTime));
            return;
        }
        if (!this.target.isCloaked()) {
            this.trackInternal(this.target.getPosition(), 1000.0, deltaTime, false);
        }
        this.executeSteering(this.so.getType() === ObjectType.Missile ? -1 : this.so.getMaxSpeed());
    }

    private pushIfNewState(newState: string): boolean {
        if (this.currentState.length === 0 || this.currentState[this.currentState.length - 1] !== newState) {
            this.currentState.push(newState);
            return true;
        }
        return false;
    }

    private initiateMissileTrack(): void {
        this.currentState.length = 0;
        if (this.target == null) {
            return;
        }
        const distanceSq = this.target.getPosition().distanceSq(this.so.getPosition());
        if (distanceSq < 9000000) {
            this.currentState.push(SpaceObjectAI.AI_STATE_TRACK);
            return;
        }
        this.pushState(SpaceObjectAI.AI_STATE_TRACK);
        this.so.getPosition().copy(this.v0);
        this.target.getPosition().sub(this.v0, this.v1);
        this.v1.scale(0.5);
        this.target.getPosition().sub(this.v1, this.v0);
        this.target.getRightVector().copy(this.v1);
        this.v1.scale(1000);
        this.v0.add(this.v1);
        this.setWaypoints(WayPoint.newWayPoint(this.v0, this.target.getUpVector()));
        this.pushState(SpaceObjectAI.AI_STATE_FLY_PATH);
    }

    setWaypoints(...waypoint: WayPoint[]): void {
        this.waypoints.length = 0;
        if (waypoint != null && waypoint.length > 0) {
            for (const w of waypoint) {
                if (w != null) {
                    this.waypoints.push(w);
                }
            }
        }
        this.currentDistance = -1;
        if (this.waypoints.length > 0 && !this.waypoints[0].orientFirst) {
            this.so.adjustSpeed(-this.so.getMaxSpeed());
        } else {
            this.so.adjustSpeed(0);
        }
    }

    private initiateFollowCurve(): void {
        this.pushIfNewState(SpaceObjectAI.AI_STATE_FOLLOW_CURVE);
        this.waypoints.length = 0;
        this.curve = Math.random() < 0.5 ? new BreakUp(this.so) : new BreakDown(this.so);
        this.curveFollowStart.reset();
        this.currentDistance = -1;
        this.so.adjustSpeed(-this.so.getMaxSpeed());
        this.lastRotation.x = 0;
        this.lastRotation.y = 0;
        this.lastRotation.z = 0;
    }

    private getFartherDirection(direction: Vector3f, targetVector: Vector3f, scale: number): void {
        this.so.getPosition().sub(this.target.getPosition(), this.v0);
        this.v0.normalize();

        direction.copy(targetVector);
        targetVector.scale(scale);
        this.so.getPosition().add(targetVector, this.v2);
        const d1s = this.v2.distanceSq(this.target.getPosition());

        targetVector.negate();
        this.so.getPosition().add(targetVector, this.v2);
        const d2s = this.v2.distanceSq(this.target.getPosition());

        if (d1s > d2s) {
            targetVector.negate();
        }
    }

    private initiateBank(): void {
        if (this.target == null) {
            if (this.currentState.length === 0) {
                this.setState(SpaceObjectAI.AI_STATE_GLOBAL);
            } else {
                this.popState();
            }
            return;
        }
        this.getFartherDirection(this.so.getRightVector(), this.v1, 500);
        this.getFartherDirection(this.so.getUpVector(), this.v3, 500);
        this.v2.x = this.so.getPosition().x + this.v1.x + this.v3.x + 800 * this.v0.x;
        this.v2.y = this.so.getPosition().y + this.v1.y + this.v3.y + 800 * this.v0.y;
        this.v2.z = this.so.getPosition().z + this.v1.z + this.v3.z + 800 * this.v0.z;
        const wp1 = WayPoint.newWayPoint(this.v2, this.target.getRightVector());
        this.v0.scale(10000.0);
        this.v2.add(this.v0);
        const wp2 = WayPoint.newWayPoint(this.v2, this.target.getUpVector());
        this.setWaypoints(wp1, wp2);
        this.pushState(SpaceObjectAI.AI_STATE_FLY_PATH);
    }

    private initiateEvade(): void {
        if (this.pushIfNewState(SpaceObjectAI.AI_STATE_EVADE)) {
            if (this.target == null) {
                this.target = this.so.getProximity();
            }
        }
        this.so.getProximity().getPosition().sub(this.so.getPosition(), this.v0);
        this.v0.scale(0.5);
        this.v0.add(this.so.getPosition());
        this.v0.copy(this.evadePosition);
        this.evadeRangeSq = (this.so.getProximity().getBoundingSphereRadiusSq() * 3.0 + this.so.getBoundingSphereRadiusSq() * 3.0) * 18;
        this.pitchingOver = true;
    }

    private pushState(newState: string): void {
        if (this.currentState.length > 0) {
            this.sendAIMessage("EXIT");
        }
        switch (newState) {
            case SpaceObjectAI.AI_STATE_ATTACK:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_ATTACK);
                break;
            case SpaceObjectAI.AI_STATE_LURKING:
                this.initiateBank();
                break;
            case SpaceObjectAI.AI_STATE_EVADE:
                this.initiateEvade();
                break;
            case SpaceObjectAI.AI_STATE_FLEE:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_FLEE);
                break;
            case SpaceObjectAI.AI_STATE_FLY_STRAIGHT:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_FLY_STRAIGHT);
                break;
            case SpaceObjectAI.AI_STATE_FLY_PATH:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_FLY_PATH);
                break;
            case SpaceObjectAI.AI_STATE_GLOBAL:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_GLOBAL);
                this.so.adjustSpeed(0);
                break;
            case SpaceObjectAI.AI_STATE_TRACK:
                this.pushIfNewState(SpaceObjectAI.AI_STATE_TRACK);
                break;
            case SpaceObjectAI.AI_STATE_MISSILE_TRACK:
                this.target = this.so.getTarget();
                this.initiateMissileTrack();
                break;
            case SpaceObjectAI.AI_STATE_FOLLOW_CURVE:
                this.initiateFollowCurve();
                break;
        }
        this.stateName = newState;
        this.sendAIMessage("ENTER");
    }

    setState(newState: string): void {
        if (SpaceObjectAI.AI_STATE_ATTACK === newState) {
            this.target = Alite.getInstance().getInGame().getShip();
        }
        this.currentState.length = 0;
        this.pushState(newState);
    }

    private popState(): void {
        if (this.currentState.length === 0) {
            return;
        }
        this.currentState.pop();
        const state = this.getState();
        if (SpaceObjectAI.AI_STATE_FOLLOW_CURVE === state) {
            // Make sure that an interrupted "follow curve" is not resumed.
            this.popState();
        }
    }

    update(deltaTime: number): void {
        if (this.currentState.length === 0 || this.so.hasEjected()) {
            return;
        }
        this.so.updateSpeed(deltaTime);

        //		if (!this.updateTimer.hasPassedSeconds(this.pauseAI)) {
        //			return;
        //		}
        //		deltaTime+= this.pauseAI;
        this.timeSpent = deltaTime;
        this.executeAIMessage("UPDATE");

        switch (this.currentState[this.currentState.length - 1]) {
            case SpaceObjectAI.AI_STATE_ATTACK:
                this.attackObject(deltaTime);
                break;
            case SpaceObjectAI.AI_STATE_LURKING:
                AliteLog.e("Updating lurking state", "This should not happen...");
                break;
            case SpaceObjectAI.AI_STATE_EVADE:
                this.updateEvade(deltaTime);
                break;
            case SpaceObjectAI.AI_STATE_FLEE:
                this.fleeObject(deltaTime);
                break;
            case SpaceObjectAI.AI_STATE_FLY_STRAIGHT:
                this.avoidCollision();
                break;
            case SpaceObjectAI.AI_STATE_FLY_PATH:
                this.flyPath(deltaTime);
                break;
            case SpaceObjectAI.AI_STATE_GLOBAL:
                break;
            case SpaceObjectAI.AI_STATE_TRACK:
                this.updateTrack(deltaTime);
                break;
            case SpaceObjectAI.AI_STATE_FOLLOW_CURVE:
                this.followCurve();
                break;
            default:
                break;
        }
        if (Settings.VIS_DEBUG) {
            if (this.so.isPlayer()) {
                let sl: string;
                switch (this.currentState[this.currentState.length - 1]) {
                    case SpaceObjectAI.AI_STATE_ATTACK: sl = "AT"; break;
                    case SpaceObjectAI.AI_STATE_LURKING: sl = "BN"; break;
                    case SpaceObjectAI.AI_STATE_EVADE: sl = "EV"; break;
                    case SpaceObjectAI.AI_STATE_FLEE: sl = "FL"; break;
                    case SpaceObjectAI.AI_STATE_FLY_STRAIGHT: sl = "FS"; break;
                    case SpaceObjectAI.AI_STATE_FLY_PATH: sl = "FP"; break;
                    case SpaceObjectAI.AI_STATE_GLOBAL: sl = "ID"; break;
                    case SpaceObjectAI.AI_STATE_TRACK: sl = "TR"; break;
                    case SpaceObjectAI.AI_STATE_FOLLOW_CURVE: sl = "FC"; break;
                    default: sl = "DE"; break;
                }
                AliteLog.d("AIS", "SOPATH: Player " + sl + " (" + this.so.getPosition().x + ":" + this.so.getPosition().y + ":" + this.so.getPosition().z +
                    ":" + this.so.getForwardVector().x + ":" + this.so.getForwardVector().y + ":" + this.so.getForwardVector().z +
                    ":" + this.so.getUpVector().x + ":" + this.so.getUpVector().y + ":" + this.so.getUpVector().z +
                    ":" + this.so.getRightVector().x + ":" + this.so.getRightVector().y + ":" + this.so.getRightVector().z +
                    ")");
            }
        }
    }

    getState(): string {
        if (this.currentState.length === 0) {
            return null;
        }
        return this.currentState[this.currentState.length - 1];
    }

    getStateStack(): string {
        let stack = "";
        for (const aCurrentState of this.currentState) {
            stack += aCurrentState + ", ";
        }
        return stack;
    }

    private bankOrAttack(player: SpaceObject): void {
        const state = this.getState();
        AliteLog.d("Object has been hit", "Object has been hit. Current State == " + state);
        if (SpaceObjectAI.AI_STATE_FOLLOW_CURVE === state) {
            return;
        }
        if (SpaceObjectAI.AI_STATE_LURKING === state || SpaceObjectAI.AI_STATE_EVADE === state || SpaceObjectAI.AI_STATE_FLY_PATH === state) {
            const f = Math.random();
            if (f < 0.3) {
                // Do nothing...
                AliteLog.d("NPC got Hit", "On Hit (should be 'no change'): New AI Stack: " + this.getStateStack());
                return;
            }
            this.popState();
            this.target = player;
            if (f < 0.7) {
                this.so.getForwardVector().copy(this.v0);
                this.v0.x *= -Math.random() * 2 + 1;
                this.v0.y *= -Math.random() * 2 + 1;
                this.v0.z *= -Math.random() * 2 + 1;
                if (this.v0.isZeroVector()) {
                    this.v0.x = 1;
                    this.v0.y = 0;
                    this.v0.z = 0;
                }
                this.v0.normalize();
                this.pushState(SpaceObjectAI.AI_STATE_ATTACK);
                this.setWaypoints(WayPoint.newWayPoint(MathHelper.getRandomPosition(this.so.getPosition(), this.v0,
                    5000, 1000), this.so.getUpVector()));
                this.pushState(SpaceObjectAI.AI_STATE_FLY_PATH);
                AliteLog.d("NPC got Hit", "On Hit (should be fly path): New AI Stack: " + this.getStateStack());
                return;
            }
            this.pushState(SpaceObjectAI.AI_STATE_ATTACK);
            this.pushState(SpaceObjectAI.AI_STATE_FOLLOW_CURVE);
            AliteLog.d("NPC got Hit", "On Hit (should be follow curve): New AI Stack: " + this.getStateStack());
        } else if (SpaceObjectAI.AI_STATE_ATTACK !== state) {
            this.target = player;
            this.pushState(SpaceObjectAI.AI_STATE_LURKING);
        }
    }

    private flee(player: SpaceObject): void {
        if (SpaceObjectAI.AI_STATE_FLEE === this.getState()) {
            return;
        }
        if (Math.random() * 100 < SpaceObjectAI.FIRE_MISSILE_UPON_FIRST_HIT_PROBABILITY) {
            this.so.spawnMissile(player);
        }
        this.target = player;
        this.setState(SpaceObjectAI.AI_STATE_FLEE);
    }

    private fleeBankOrAttack(player: SpaceObject): void {
        const state = this.getState();
        if (SpaceObjectAI.AI_STATE_ATTACK === state) {
            this.bankOrAttack(player);
        } else if (SpaceObjectAI.AI_STATE_FLEE === state) {
            this.target = player;
            this.pushState(SpaceObjectAI.AI_STATE_LURKING);
        } else if (SpaceObjectAI.AI_STATE_LURKING === state || SpaceObjectAI.AI_STATE_EVADE === state) {
            this.popState();
            this.target = player;
            this.pushState(SpaceObjectAI.AI_STATE_LURKING);
        } else if (SpaceObjectAI.AI_STATE_FLY_PATH === state || SpaceObjectAI.AI_STATE_FLY_STRAIGHT === state || SpaceObjectAI.AI_STATE_GLOBAL === state) {
            if (Math.random() * 50 < this.so.getAggressionLevel()) {
                this.bankOrAttack(player);
            } else {
                this.flee(player);
            }
        }
        // Else do nothing...
    }

    executeHit(player: SpaceObject): void {
        switch (this.so.getType()) {
            case ObjectType.Asteroid:
            case ObjectType.CargoPod:
            case ObjectType.Buoy:
            case ObjectType.Alloy:
            case ObjectType.Missile: break; // Nothing to do

            case ObjectType.EscapeCapsule:
            case ObjectType.Shuttle: this.flee(player); break;
            case ObjectType.Trader: this.fleeBankOrAttack(player); break;

            // EnemyShip (Pirate, Constrictor, Cougar, TieFighter, Defender, Thargoid, Thargon, Viper)
            default: this.bankOrAttack(player); break;
        }
    }

    sendAIMessage(message: string): void {
        if (SpaceObjectAI.priorityMessages.has(message)) {
            this.executeAIMessage(message);
        } else {
            this.queueAIMessage(message);
        }
    }

    private executeAIMessage(message: string): void {
        //		if (message === this.lastMessage) {
        //			return;
        //		}
        //		this.lastMessage = message;

        //		AliteLog.d("AI message received", "Object: " + this.so.getId() +
        //			", AI: '" + this.so.getAIType() + "', state: '" + this.stateName + "', message: '" + message + "'");
        const methods = SpaceObjectFactory.getInstance().getMethods(this.so.getAIType(), this.stateName, message);
        if (methods == null) {
            if (!SpaceObjectFactory.getInstance().isAIType(this.so.getAIType())) {
                //				AliteLog.e("AI type error", "AI type " + this.so.getAIType() + " not found.");
                return;
            }
            if (!SpaceObjectFactory.getInstance().isAIState(this.so.getAIType(), this.stateName)) {
                //				AliteLog.e("AI state error", "AI state " + this.stateName + " not found for AI type " + this.so.getAIType() + ".");
                return;
            }
            //			AliteLog.d("AI methods", "No method for state.");
            return;
        }
        for (const method of methods) {
            try {
                // TODO: reflection is not available in TS. Need to implement a different mechanism.
                // SpaceObjectAI.class.getDeclaredMethod(method.getName(), String[].class).invoke(this,
                // 	new Object[] { method.getParameter() == null ? new String[0] : method.getParameter().split(" ")});
                // AliteLog.d("AI methods", "AI method " + method.getName() + "(" +
                // 	(method.getParameter() == null ? "" : method.getParameter()) + ") called.");
            } catch (e) {
                if (e instanceof Error) {
                    AliteLog.e("ai.syntax." + method.getName(), e.message, e);
                }
            }
        }
    }

    private queueAIMessage(message: string): void {
        if (message === this.lastMessage) {
            return;
        }
        this.lastMessage = message;
        // push to message queue executed by update message
    }

    private checkArguments(expectedArgNum: number, expectedArgs: string, ...args: string[]): void {
        if (expectedArgNum === args.length) {
            return;
        }
        throw new Error("Wrong number of arguments. Expected " + expectedArgNum +
            (expectedArgs == null ? "" : " (" + expectedArgs + ")") +
            ", got " + args.length + " " + args.toString());
    }

    // Allowed AI methods for ships called by sendAIMessage.

    private setStateTo(...state: string[]): void {
        this.checkArguments(1, "{state_name}", ...state);
        this.setState(state[0]);
    }

    private setAITo(...ai: string[]): void {
        this.checkArguments(1, "{ai_name}", ...ai);
        // todo: push ai to aiStack
    }

    private switchAITo(...ai: string[]): void {
        this.checkArguments(1, "{ai_name}", ...ai);
        // todo: clear aiStack
        this.setAITo(...ai);
    }

    private exitAI(...message: string[]): void {
        this.checkArguments(0, "", ...message);
        this.exitAIWithMessage("RESTARTED");
    }

    private exitAIWithMessage(...message: string[]): void {
        this.checkArguments(1, "{exit_message}", ...message);
        // todo: aiStack is needed instead of state stack!
        if (this.currentState.length > 0) {
            this.popState();
            this.sendAIMessage(message[0] == null ? "RESTARTED" : message[0]);
        }
    }

    private pauseAI(...intervalString: string[]): void {
        this.checkArguments(1, "{delay_time_in_sec}", ...intervalString);
        //		this.pauseAI = parseFloat(intervalString[0]);
    }

    private randomPauseAI(...intervalString: string[]): void {
        this.checkArguments(2, "{min_delay_time_in_sec} {max_delay_time_in_sec}", ...intervalString);
        const start = parseFloat(intervalString[0]);
        const end = parseFloat(intervalString[1]);
        if (start < 0 || end < 0 || end <= start) {
            throw new Error("Invalid value: " + intervalString.toString());
        }
        //		this.pauseAI = (start + (end - start) * Math.random());
    }

    private dropMessages(...messageString: string[]): void {
        if (messageString.length === 0) {
            throw new Error("Missing argument, at least one message name must be passed.");
        }
        for (const message of messageString) {
            // todo: drop message
        }
    }

    private performAvoidCollision(...args: string[]): void {
        this.updateEvade(this.timeSpent);
    }

    private performAttack(...args: string[]): void {
        this.attackObject(this.timeSpent);
    }

    private debugDumpPendingMessages(...args: string[]): void {
    }

    private setDestinationToCurrentLocation(...args: string[]): void {
    }

    private setDesiredRangeTo(...rangeString: string[]): void {
    }

    private setDesiredRangeForWaypoint(...args: string[]): void {
    }

    private performIntercept(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        if (!this.isTargetExist()) {
            this.sendAIMessage("TARGET_LOST");
        }
        if (this.target.getPosition().distanceSq(this.so.getPosition()) <= 40000) {
            this.sendAIMessage("DESIRED_RANGE_ACHIEVED");
        }
        // todo send FRUSTRATED after 10 sec
    }

    private performFlyToRangeFromDestination(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        if (this.target.getPosition().distanceSq(this.so.getPosition()) <= 40000) {
            this.sendAIMessage("DESIRED_RANGE_ACHIEVED");
        }
    }

    private isTargetExist(): boolean {
        return this.target != null && !this.target.mustBeRemoved() && this.target.getHullStrength() > 0;
    }

    private setSpeedTo(...speedString: string[]): void {
    }

    private setSpeedFactorTo(...speedString: string[]): void {
        this.checkArguments(1, "{percentage_of_max_speed(0-1)}", ...speedString);
        const speed = parseFloat(speedString[0]);
        if (speed >= 0 && speed <= 1) {
            this.so.setSpeed(-this.so.getMaxSpeed() * speed);
        }
    }

    private setSpeedToCruiseSpeed(...args: string[]): void {
    }

    private setThrustFactorTo(...thrustFactorString: string[]): void {
    }

    private setTargetToPrimaryAggressor(...args: string[]): void {
    }

    private scanForNearestMerchantman(...args: string[]): void {
    }

    private scanForRandomMerchantman(...args: string[]): void {
    }

    private scanForLoot(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        if (ObjectType.isSpaceStation(this.so.getType()) || this.so.getRepoHandler().getNumericProperty("has_scoop") < 1) {
            this.sendAIMessage("NOTHING_FOUND");
            return;
        }
        if (Alite.getInstance().getInGame().getObjects(ObjectType.EscapeCapsule).length === 0) {
            const cargo = Alite.getInstance().getInGame().getObjects(ObjectType.CargoPod);
            if (cargo.length === 0) {
                this.sendAIMessage("NOTHING_FOUND");
                return;
            }
            if (this.so.getType() === ObjectType.Police) {
                let slaveFound = false;
                for (const c of cargo) {
                    if (c.getCargoContent() === TradeGoodStore.get().getGoodById(TradeGoodStore.SLAVES)) {
                        slaveFound = true;
                        break;
                    }
                }
                if (!slaveFound) {
                    this.sendAIMessage("NOTHING_FOUND");
                }
                return;
            }
        }
        this.sendAIMessage(this.so.hasFreeSpace() ? "TARGET_FOUND" : "HOLD_FULL");
    }

    private scanForRandomLoot(...args: string[]): void {
    }

    private setTargetToFoundTarget(...args: string[]): void {
        //
    }

    private checkForFullHold(...args: string[]): void {
    }

    private getWitchspaceEntryCoordinates(...args: string[]): void {
    }

    private setDestinationFromCoordinates(...args: string[]): void {
    }

    private setCoordinatesFromPosition(...args: string[]): void {
        this.checkArguments(0, "", ...args);
    }

    private fightOrFleeMissile(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        this.flee(Alite.getInstance().getInGame().getShip());
    }

    private fightOrFleeHostiles(...args: string[]): void {
    }

    private setCourseToPlanet(...args: string[]): void {
    }

    private setTakeOffFromPlanet(...args: string[]): void {
    }

    private landOnPlanet(...args: string[]): void {
    }

    private checkTargetLegalStatus(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        switch (Alite.getInstance().getPlayer().getLegalStatus()) {
            case "CLEAN":
                this.sendAIMessage(Alite.getInstance().getPlayer().getLegalValue() === 0 ? "TARGET_CLEAN" : "TARGET_MINOR_OFFENDER");
            case "OFFENDER":
                this.sendAIMessage("TARGET_OFFENDER");
            case "FUGITIVE":
                this.sendAIMessage("TARGET_FUGITIVE");
        }
    }

    private checkOwnLegalStatus(...args: string[]): void {
    }

    private setDestinationToTarget(...args: string[]): void {
    }

    private setDestinationWithinTarget(...args: string[]): void {
    }

    private checkCourseToDestination(...args: string[]): void {
    }

    private checkAegis(...args: string[]): void {
    }

    private checkEnergy(...args: string[]): void {
    }

    private checkHeatInsulation(...args: string[]): void {
    }

    private scanForOffenders(...args: string[]): void {
    }

    private setCourseToWitchpoint(...args: string[]): void {
    }

    private setDestinationToWitchpoint(...args: string[]): void {
    }

    private setDestinationToStationBeacon(...args: string[]): void {
    }

    private performHyperSpaceExit(...args: string[]): void {
    }

    private performHyperSpaceExitWithoutReplacing(...args: string[]): void {
    }

    private wormholeGroup(...args: string[]): void {
    }

    private commsMessage(...valueString: string[]): void {
    }

    private commsMessageByUnpiloted(...valueString: string[]): void {
    }

    private ejectCargo(...args: string[]): void {
    }

    private scanForThargoid(...args: string[]): void {
    }

    private scanForNonThargoid(...args: string[]): void {
    }

    private thargonCheckMother(...args: string[]): void {
    }

    private becomeUncontrolledThargon(...args: string[]): void {
    }

    private checkDistanceTravelled(...args: string[]): void {
        if (this.isTargetExist() && this.target.getPosition().distanceSq(this.so.getPosition()) > 90000000) {
            this.sendAIMessage("GONE_BEYOND_RANGE");
        }
    }

    private suggestEscort(...args: string[]): void {
    }

    private escortCheckMother(...args: string[]): void {
    }

    private checkGroupOddsVersusTarget(...args: string[]): void {
    }

    private scanForFormationLeader(...args: string[]): void {
    }

    private messageMother(...msgString: string[]): void {
    }

    private setPlanetPatrolCoordinates(...args: string[]): void {
    }

    private setSunSkimStartCoordinates(...args: string[]): void {
    }

    private setSunSkimEndCoordinates(...args: string[]): void {
    }

    private setSunSkimExitCoordinates(...args: string[]): void {
    }

    private patrolReportIn(...args: string[]): void {
    }

    private checkForMotherStation(...args: string[]): void {
    }

    private sendTargetCommsMessage(...message: string[]): void {
    }

    private markTargetForFines(...args: string[]): void {
    }

    private markTargetForOffence(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        Alite.getInstance().getPlayer().setLegalValue(Alite.getInstance().getPlayer().getLegalValue() | 15);
    }

    private storeTarget(...args: string[]): void {
    }

    private recallStoredTarget(...args: string[]): void {
    }

    private scanForRocks(...args: string[]): void {
    }

    private setDestinationToDockingAbort(...args: string[]): void {
    }

    private requestNewTarget(...args: string[]): void {
    }

    private rollD(...die_number: string[]): void {
    }

    private scanForNearestShipWithPrimaryRole(...scanRole: string[]): void {
    }

    private scanForNearestShipHavingRole(...scanRole: string[]): void {
    }

    private scanForNearestShipWithAnyPrimaryRole(...scanRoles: string[]): void {
    }

    private scanForNearestShipHavingAnyRole(...scanRoles: string[]): void {
    }

    private scanForNearestShipWithScanClass(...scanScanClass: string[]): void {
    }

    private scanForNearestShipWithoutPrimaryRole(...scanRole: string[]): void {
    }

    private scanForNearestShipNotHavingRole(...scanRole: string[]): void {
    }

    private scanForNearestShipWithoutAnyPrimaryRole(...scanRoles: string[]): void {
    }

    private scanForNearestShipNotHavingAnyRole(...scanRoles: string[]): void {
    }

    private scanForNearestShipWithoutScanClass(...scanScanClass: string[]): void {
    }

    private setCoordinates(...systemXYZ: string[]): void {
    }

    private checkForNormalSpace(...args: string[]): void {
    }

    private setTargetToRandomStation(...args: string[]): void {
    }

    private setTargetToLastStation(...args: string[]): void {
    }

    private addFuel(...fuel_number: string[]): void {
    }

    private scriptActionOnTarget(...action: string[]): void {
    }

    private sendScriptMessage(...message: string[]): void {
    }

    private ai_throwSparks(...args: string[]): void {
    }

    private explodeSelf(...args: string[]): void {
    }

    private ai_debugMessage(...message: string[]): void {
    }

    private targetFirstBeaconWithCode(...code: string[]): void {
    }

    private targetNextBeaconWithCode(...code: string[]): void {
    }

    private setRacepointsFromTarget(...args: string[]): void {
    }

    private performFlyRacepoints(...args: string[]): void {
    }

    private addPrimaryAggressorAsDefenseTarget(...args: string[]): void {
    }

    private addFoundTargetAsDefenseTarget(...args: string[]): void {
    }

    private findNewDefenseTarget(...args: string[]): void {
    }

    private fireECM(...args: string[]): void {
        //
    }

    // Allowed AI methods for stations called by sendAIMessage.
    private increaseAlertLevel(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        Alite.getInstance().getPlayer().increaseAlertLevel();
    }

    private decreaseAlertLevel(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        Alite.getInstance().getPlayer().decreaseAlertLevel();
    }

    private launchPolice(...args: string[]): void {
    }

    private launchDefenseShip(...args: string[]): void {
        //
    }

    private launchScavenger(...args: string[]): void {
        //
    }

    private launchMiner(...args: string[]): void {
    }

    private launchPirateShip(...args: string[]): void {
    }

    private launchShuttle(...args: string[]): void {
    }

    private launchTrader(...args: string[]): void {
    }

    private launchEscort(...args: string[]): void {
    }

    private launchPatrol(...args: string[]): void {
    }

    private launchShipWithRole(...role: string[]): void {
    }

    private abortAllDockings(...args: string[]): void {
    }

    private performTumble(...args: string[]): void {
        this.checkArguments(0, "", ...args);
        Alite.getInstance().getInGame().getSpawnManager().spawnTumbleObject(this.so, this.so.getPosition());
    }
}
