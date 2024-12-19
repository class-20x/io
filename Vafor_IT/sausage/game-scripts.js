function getOrthogonalVectors(t, i, e) {
    var n, o;
    Math.abs(t.z) > .7071067811865476 ? (n = t.y * t.y + t.z * t.z, o = 1 / Math.sqrt(n), i.x = 0, i.y = -t.z * o, i.z = t.y * o, e.x = n * o, e.y = -t.x * i.z, e.z = t.x * i.y) : (n = t.x * t.x + t.y * t.y, o = 1 / Math.sqrt(n), i.x = -t.y * o, i.y = t.x * o, i.z = 0, e.x = -t.z * i.y, e.y = t.z * i.x, e.z = n * o)
}
var PointToPointConstraint = pc.createScript("pointToPointConstraint");
PointToPointConstraint.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), PointToPointConstraint.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second entity",
    type: "entity"
}), PointToPointConstraint.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of entity B (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), PointToPointConstraint.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 34e37
}), PointToPointConstraint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), PointToPointConstraint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), PointToPointConstraint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), PointToPointConstraint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", (function(t, i, e) {
        "pivotA" === t || "entityB" === t || "pivotB" === t ? this.createConstraint() : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, PointToPointConstraint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = this.entity.rigidbody.body,
        i = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    if (this.entityB && this.entityB.rigidbody) {
        var e = this.entityB.rigidbody.body,
            n = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        this.constraint = new Ammo.btPoint2PointConstraint(t, e, i, n)
    } else this.constraint = new Ammo.btPoint2PointConstraint(t, i);
    this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, PointToPointConstraint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, PointToPointConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, PointToPointConstraint.prototype.update = function(t) {
    if (this.debugRender) {
        var i = new pc.Vec3;
        this.entity.getWorldTransform().transformPoint(this.pivotA, i), this.app.renderLine(this.entity.getPosition(), i, this.debugColor), this.entityB && this.app.renderLine(this.entityB.getPosition(), i, this.debugColor)
    }
};
var HingeConstraint = pc.createScript("hingeConstraint");
HingeConstraint.attributes.add("entityA", {
    title: "Entity",
    description: "Connected entity.",
    type: "entity"
}), HingeConstraint.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), HingeConstraint.attributes.add("axisA", {
    title: "Axis",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), HingeConstraint.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second connected entity.",
    type: "entity"
}), HingeConstraint.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), HingeConstraint.attributes.add("axisB", {
    title: "Connected Axis",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), HingeConstraint.attributes.add("limits", {
    title: "Limits",
    description: "Low and high angular limits for the constraint in degrees. By default, low is greater than high meaning no limits.",
    type: "vec2",
    default: [1, -1]
}), HingeConstraint.attributes.add("softness", {
    title: "Softness",
    description: 'Softness of the constraint. Recommend 0.8 to 1. Describes the percentage of limits where movement is free. Beyond this softness percentage, the limit is gradually enforced until the "hard" (1.0) limit is reached.',
    type: "number",
    min: 0,
    max: 1,
    default: .9
}), HingeConstraint.attributes.add("biasFactor", {
    title: "Bias Factor",
    description: "Bias factor of the constraint. Recommend 0.3 +/- approximately 0.3. Strength with which constraint resists zeroth order (angular, not angular velocity) limit violation.",
    type: "number",
    min: 0,
    max: 1,
    default: .3
}), HingeConstraint.attributes.add("relaxationFactor", {
    title: "Relaxation Factor",
    description: "Relaxation factor of the constraint. Recommend to keep this near 1. The lower the value, the less the constraint will fight velocities which violate the angular limits.",
    type: "number",
    min: 0,
    max: 1,
    default: 1
}), HingeConstraint.attributes.add("enableMotor", {
    title: "Use Motor",
    description: "Enable a motor to power the automatic rotation around the hinge axis.",
    type: "boolean",
    default: !1
}), HingeConstraint.attributes.add("motorTargetVelocity", {
    title: "Target Velocity",
    description: "Target motor angular velocity.",
    type: "number",
    default: 0
}), HingeConstraint.attributes.add("maxMotorImpulse", {
    title: "Max Motor Impulse",
    description: "Maximum motor impulse.",
    type: "number",
    default: 0
}), HingeConstraint.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 34e37
}), HingeConstraint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), HingeConstraint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), HingeConstraint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), HingeConstraint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", ((t, i, e) => {
        if ("pivotA" === t || "axisA" === t || "entityB" === t || "pivotB" === t || "axisB" === t) this.createConstraint();
        else if ("limits" === t || "softness" === t || "biasFactor" === t || "relaxationFactor" === t) {
            var n = this.limits.x * Math.PI / 180,
                o = this.limits.y * Math.PI / 180;
            this.constraint.setLimit(n, o, this.softness, this.biasFactor, this.relaxationFactor)
        } else "enableMotor" === t || "motorTargetVelocity" === t || "maxMotorImpulse" === t ? (this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse), this.activate()) : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, HingeConstraint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = new pc.Vec3,
        i = new pc.Vec3,
        e = new pc.Quat,
        n = new pc.Mat4;
    this.entityA ? this.entityA = this.entityA : this.entityA = this.entity;
    var o = this.entityA.rigidbody.body,
        s = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    getOrthogonalVectors(this.axisA, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisA.x, this.axisA.y, this.axisA.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
    var r = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
        a = new Ammo.btTransform(r, s);
    if (this.entityB && this.entityB.rigidbody) {
        var d = this.entityB.rigidbody.body,
            h = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        getOrthogonalVectors(this.axisB, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisB.x, this.axisB.y, this.axisB.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
        var c = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
            l = new Ammo.btTransform(c, h);
        this.constraint = new Ammo.btHingeConstraint(o, d, a, l, !1), Ammo.destroy(l), Ammo.destroy(c), Ammo.destroy(h)
    } else this.constraint = new Ammo.btHingeConstraint(o, a, !1);
    var p = this.limits.x * Math.PI / 180,
        y = this.limits.y * Math.PI / 180;
    this.constraint.setLimit(p, y, this.softness, this.biasFactor, this.relaxationFactor), this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse), Ammo.destroy(a), Ammo.destroy(r), Ammo.destroy(s), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, HingeConstraint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, HingeConstraint.prototype.activate = function() {
    this.entityA.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, HingeConstraint.prototype.update = function(t) {
    if (this.debugRender) {
        var i = new pc.Vec3,
            e = new pc.Vec3,
            n = new pc.Vec3,
            o = new pc.Vec3,
            s = this.entityA.getWorldTransform();
        s.transformPoint(this.pivotA, i), s.transformVector(this.axisA, e), e.normalize().scale(.5), n.add2(i, e), o.sub2(i, e), this.app.renderLine(this.entityA.getPosition(), i, this.debugColor), this.app.renderLine(n, o, this.debugColor), this.entityB && this.app.renderLine(this.entityB.getPosition(), i, this.debugColor)
    }
};
var ConeTwistConstraint = pc.createScript("coneTwistConstraint");
ConeTwistConstraint.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), ConeTwistConstraint.attributes.add("axisA", {
    title: "Axis",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), ConeTwistConstraint.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second connected entity.",
    type: "entity"
}), ConeTwistConstraint.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), ConeTwistConstraint.attributes.add("axisB", {
    title: "Connected Axis",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), ConeTwistConstraint.attributes.add("swingSpan1", {
    title: "Swing 1 Limit",
    description: "The Swing 1 Limit limits the rotation around the swing axis. Swing 1 Limit limits an axis of rotation orthogonal to the twist axis and Swing Limit 2. The limit angle is symmetric. Therefore, a value of 20 will limit the rotation between -20 and 20 degrees.",
    type: "number",
    default: 1e30
}), ConeTwistConstraint.attributes.add("swingSpan2", {
    title: "Swing 2 Limit",
    description: "The Swing 2 Limit limits the rotation around the swing axis. Swing 2 Limit limits an axis of rotation orthogonal to the twist axis and Swing Limit 1. The limit angle is symmetric. Therefore, a value of 20 will limit the rotation between -20 and 20 degrees.",
    type: "number",
    default: 1e30
}), ConeTwistConstraint.attributes.add("twistSpan", {
    title: "Twist Limit",
    description: "The Twist Limit limits the rotation around the twist axis. The limit angle is symmetric. Therefore, a value of 20 will limit the twist rotation between -20 and 20 degrees.",
    type: "number",
    default: 1e30
}), ConeTwistConstraint.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 1e30
}), ConeTwistConstraint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), ConeTwistConstraint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), ConeTwistConstraint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), ConeTwistConstraint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", (function(t, i, e) {
        "pivotA" === t || "axisA" === t || "entityB" === t || "pivotB" === t || "axisB" === t ? this.createConstraint() : "swingSpan1" === t ? (this.constraint.setLimit(5, this.swingSpan1 * Math.PI / 180), this.activate()) : "swingSpan2" === t ? (this.constraint.setLimit(4, this.swingSpan2 * Math.PI / 180), this.activate()) : "twistSpan" === t ? (this.constraint.setLimit(3, this.twistSpan * Math.PI / 180), this.activate()) : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, ConeTwistConstraint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = new pc.Vec3,
        i = new pc.Vec3,
        e = new pc.Quat,
        n = new pc.Mat4,
        o = this.entity.rigidbody.body,
        s = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    getOrthogonalVectors(this.axisA, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisA.x, this.axisA.y, this.axisA.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
    var r = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
        a = new Ammo.btTransform(r, s);
    if (this.entityB && this.entityB.rigidbody) {
        var d = this.entityB.rigidbody.body,
            h = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        getOrthogonalVectors(this.axisB, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisB.x, this.axisB.y, this.axisB.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
        var c = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
            l = new Ammo.btTransform(c, h);
        this.constraint = new Ammo.btConeTwistConstraint(o, d, a, l), Ammo.destroy(l), Ammo.destroy(c), Ammo.destroy(h)
    } else this.constraint = new Ammo.btConeTwistConstraint(o, a);
    this.constraint.setLimit(3, this.twistSpan * Math.PI / 180), this.constraint.setLimit(4, this.swingSpan2 * Math.PI / 180), this.constraint.setLimit(5, this.swingSpan1 * Math.PI / 180), this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), Ammo.destroy(a), Ammo.destroy(r), Ammo.destroy(s), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, ConeTwistConstraint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, ConeTwistConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, ConeTwistConstraint.prototype.update = function(t) {
    this.debugRender && this.app.renderLine(this.entity.getPosition(), pc.Vec3.ZERO, this.debugColor)
};
var SliderConstraint = pc.createScript("sliderConstraint");
SliderConstraint.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), SliderConstraint.attributes.add("axisA", {
    title: "Axis",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), SliderConstraint.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second connected entity.",
    type: "entity"
}), SliderConstraint.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), SliderConstraint.attributes.add("axisB", {
    title: "Connected Axis",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), SliderConstraint.attributes.add("linearLimits", {
    title: "Linear Limits",
    description: "Linear limits of the constraint.",
    type: "vec2",
    default: [1, -1]
}), SliderConstraint.attributes.add("angularLimits", {
    title: "Angular Limits",
    description: "Angular limits of the constraint.",
    type: "vec2",
    default: [0, 0]
}), SliderConstraint.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 1e30
}), SliderConstraint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), SliderConstraint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), SliderConstraint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), SliderConstraint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", (function(t, i, e) {
        "pivotA" === t || "axisA" === t || "entityB" === t || "pivotB" === t || "axisB" === t ? this.createConstraint() : "linearLimits" === t ? (this.constraint.setLowerLinLimit(this.linearLimits.x), this.constraint.setUpperLinLimit(this.linearLimits.y), this.activate()) : "angularLimits" === t ? (this.constraint.setLowerAngLimit(this.angularLimits.x), this.constraint.setUpperAngLimit(this.angularLimits.y), this.activate()) : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, SliderConstraint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = new pc.Vec3,
        i = new pc.Vec3,
        e = new pc.Quat,
        n = new pc.Mat4,
        o = this.entity.rigidbody.body,
        s = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    getOrthogonalVectors(this.axisA, t, i), n.set([this.axisA.x, this.axisA.y, this.axisA.z, 0, t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
    var r = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
        a = new Ammo.btTransform(r, s);
    if (a.setOrigin(s), this.entityB && this.entityB.rigidbody) {
        var d = this.entityB.rigidbody.body,
            h = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        getOrthogonalVectors(this.axisB, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisB.x, this.axisB.y, this.axisB.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
        var c = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
            l = new Ammo.btTransform(c, h);
        this.constraint = new Ammo.btSliderConstraint(o, d, a, l), Ammo.destroy(l), Ammo.destroy(c), Ammo.destroy(h)
    } else this.constraint = new Ammo.btSliderConstraint(o, a);
    this.constraint.setLowerLinLimit(this.linearLimits.x), this.constraint.setUpperLinLimit(this.linearLimits.y), this.constraint.setLowerAngLimit(this.angularLimits.x), this.constraint.setUpperAngLimit(this.angularLimits.y), this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), Ammo.destroy(a), Ammo.destroy(r), Ammo.destroy(s), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, SliderConstraint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, SliderConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, SliderConstraint.prototype.update = function(t) {
    this.debugRender
};
var Generic6DofConstraint = pc.createScript("generic6DofConstraint");
Generic6DofConstraint.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), Generic6DofConstraint.attributes.add("axisA", {
    title: "Axis",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), Generic6DofConstraint.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second connected entity.",
    type: "entity"
}), Generic6DofConstraint.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), Generic6DofConstraint.attributes.add("axisB", {
    title: "Connected Axis",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), Generic6DofConstraint.attributes.add("linearLimits", {
    title: "Linear Limits",
    description: "Linear limits of the constraint.",
    type: "vec2",
    default: [1, -1]
}), Generic6DofConstraint.attributes.add("angularLimits", {
    title: "Angular Limits",
    description: "Angular limits of the constraint.",
    type: "vec2",
    default: [0, 0]
}), Generic6DofConstraint.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 1e30
}), Generic6DofConstraint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), Generic6DofConstraint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), Generic6DofConstraint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), Generic6DofConstraint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", (function(t, i, e) {
        "pivotA" === t || "axisA" === t || "entityB" === t || "pivotB" === t || "axisB" === t ? this.createConstraint() : "linearLimits" === t ? (this.constraint.setLowerLinLimit(this.linearLimits.x), this.constraint.setUpperLinLimit(this.linearLimits.y), this.activate()) : "angularLimits" === t ? (this.constraint.setLowerAngLimit(this.angularLimits.x), this.constraint.setUpperAngLimit(this.angularLimits.y), this.activate()) : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, Generic6DofConstraint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = new pc.Vec3,
        i = new pc.Vec3,
        e = new pc.Quat,
        n = new pc.Mat4,
        o = this.entity.rigidbody.body,
        s = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    getOrthogonalVectors(this.axisA, t, i), n.set([this.axisA.x, this.axisA.y, this.axisA.z, 0, t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
    var r = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
        a = new Ammo.btTransform(r, s);
    if (a.setOrigin(s), this.entityB && this.entityB.rigidbody) {
        var d = this.entityB.rigidbody.body,
            h = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        getOrthogonalVectors(this.axisB, t, i), n.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisB.x, this.axisB.y, this.axisB.z, 0, 0, 0, 0, 1]), e.setFromMat4(n);
        var c = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
            l = new Ammo.btTransform(c, h);
        this.constraint = new Ammo.btSliderConstraint(o, d, a, l), Ammo.destroy(l), Ammo.destroy(c), Ammo.destroy(h)
    } else this.constraint = new Ammo.btSliderConstraint(o, a);
    this.constraint.setLowerLinLimit(this.linearLimits.x), this.constraint.setUpperLinLimit(this.linearLimits.y), this.constraint.setLowerAngLimit(this.angularLimits.x), this.constraint.setUpperAngLimit(this.angularLimits.y), this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), Ammo.destroy(a), Ammo.destroy(r), Ammo.destroy(s), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, Generic6DofConstraint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, Generic6DofConstraint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, Generic6DofConstraint.prototype.update = function(t) {
    this.debugRender
};
var SpringJoint = pc.createScript("springJoint");
SpringJoint.attributes.add("entityA", {
    title: "entityA",
    description: "Optional second connected entity.",
    type: "entity"
}), SpringJoint.attributes.add("entityB", {
    title: "entityB",
    description: "Optional second connected entity.",
    type: "entity"
}), SpringJoint.attributes.add("pivotA", {
    title: "pivotA",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), SpringJoint.attributes.add("pivotB", {
    title: "pivotB",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), SpringJoint.attributes.add("axisB", {
    title: "Upper Limit",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), SpringJoint.attributes.add("axisA", {
    title: "Lower Limit",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), SpringJoint.attributes.add("stifness", {
    title: "stifness",
    description: "Linear limits of the constraint.",
    type: "number",
    default: 10
}), SpringJoint.attributes.add("damping", {
    title: "damping",
    description: "Angular limits of the constraint.",
    type: "number",
    default: .1
}), SpringJoint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), SpringJoint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), SpringJoint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), SpringJoint.prototype.initialize = function() {
    this.initialStifness = this.stifness, this.createConstraint(), this.on("attr", (function(t, i, e) {
        "pivotA" !== t && "axisA" !== t && "entityB" !== t && "pivotB" !== t && "axisB" !== t || this.createConstraint()
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, SpringJoint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    let t = new Ammo.btVector3(this.axisA.x, this.axisA.y, this.axisA.z),
        i = (new Ammo.btVector3(this.axisB.x, this.axisB.y, this.axisB.z), new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z)),
        e = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z),
        n = new Ammo.btQuaternion(0, 0, 0, 1),
        o = new Ammo.btTransform(n, i),
        s = new Ammo.btTransform(n, e);
    this.constraint = new Ammo.btGeneric6DofSpringConstraint(this.entityA.rigidbody.body, this.entityB.rigidbody.body, o, s, !0), this.constraint.setLinearLowerLimit(t), this.constraint.setLinearUpperLimit(new Ammo.btVector3(0, 0, 0)), this.constraint.enableSpring(1, !0), this.constraint.setStiffness(1, this.stifness), this.constraint.setDamping(1, this.damping), this.constraint.enableSpring(0, !0), this.constraint.setStiffness(0, this.stifness), this.constraint.setDamping(0, this.damping), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision)
}, SpringJoint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, SpringJoint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, SpringJoint.prototype.update = function(t) {
    if (this.debugRender) {
        var i = new pc.Vec3;
        this.entityA.getWorldTransform().transformPoint(this.pivotA, i);
        var e = new pc.Vec3;
        this.entityB.getWorldTransform().transformPoint(this.pivotB, e), this.app.renderLine(i, e, this.debugColor), this.entityB
    }
};
var SpringJoint = pc.createScript("springJoint");
SpringJoint.attributes.add("entityA", {
    title: "entityA",
    description: "Optional second connected entity.",
    type: "entity"
}), SpringJoint.attributes.add("pivotA", {
    title: "pivotA",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), SpringJoint.attributes.add("axisA", {
    title: "axisA",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), SpringJoint.attributes.add("entityB", {
    title: "entityB",
    description: "Optional second connected entity.",
    type: "entity"
}), SpringJoint.attributes.add("pivotB", {
    title: "pivotB",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), SpringJoint.attributes.add("axisB", {
    title: "axisB",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), SpringJoint.attributes.add("stifness", {
    title: "stifness",
    description: "Linear limits of the constraint.",
    type: "number",
    default: 10
}), SpringJoint.attributes.add("damping", {
    title: "damping",
    description: "Angular limits of the constraint.",
    type: "number",
    default: .1
}), SpringJoint.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), SpringJoint.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), SpringJoint.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), SpringJoint.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", (function(t, i, n) {})), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, SpringJoint.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    let t = new Ammo.btVector3(this.axisA.x, this.axisA.y, this.axisA.z),
        i = (new Ammo.btVector3(this.axisB.x, this.axisB.y, this.axisB.z), new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z)),
        n = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z),
        e = new Ammo.btQuaternion(0, 0, 0, 1),
        o = new Ammo.btTransform(e, i),
        s = new Ammo.btTransform(e, n);
    this.constraint = new Ammo.btGeneric6DofSpringConstraint(this.entityA.rigidbody.body, this.entityB.rigidbody.body, o, s, !0), this.constraint.setLinearLowerLimit(t), this.constraint.setLinearUpperLimit(new Ammo.btVector3(0, 0, 0)), this.constraint.enableSpring(1, !0), this.constraint.setStiffness(1, this.stifness), this.constraint.setDamping(1, this.damping), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision)
}, SpringJoint.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, SpringJoint.prototype.activate = function() {
    this.entity.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, SpringJoint.prototype.update = function(t) {
    if (this.debugRender) {
        var i = new pc.Vec3;
        this.entityA.getWorldTransform().transformPoint(this.pivotA, i);
        var n = new pc.Vec3;
        this.entityB.getWorldTransform().transformPoint(this.pivotB, n), this.app.renderLine(i, n, this.debugColor), this.entityB
    }
};
var PlayerController = pc.createScript("playerController");
PlayerController.attributes.add("head", {
    type: "entity"
}), PlayerController.attributes.add("tail", {
    type: "entity"
}), PlayerController.attributes.add("segmentMass", {
    type: "number",
    default: 1
}), PlayerController.attributes.add("coolDownTime", {
    type: "number"
}), PlayerController.attributes.add("sausageSegments", {
    type: "entity",
    array: !0
}), PlayerController.attributes.add("dashMeter", {
    type: "entity"
}), PlayerController.attributes.add("eyes", {
    type: "entity",
    array: !0
}), PlayerController.attributes.add("force", {
    type: "number",
    default: 9
}), PlayerController.attributes.add("forceThresholds", {
    title: "Force Thresholds",
    type: "vec2",
    default: [.5, 2.5]
}), PlayerController.attributes.add("springMultiplier", {
    type: "number",
    default: 1
}), PlayerController.attributes.add("springs", {
    type: "entity",
    array: !0
}), PlayerController.attributes.add("landParticles", {
    type: "asset",
    assetType: "template"
}), PlayerController.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), PlayerController.attributes.add("activated", {
    type: "boolean",
    default: !0
}), PlayerController.attributes.add("debug", {
    type: "boolean",
    default: !0
}), PlayerController.prototype.initialize = function() {
    PlayerController.instance = this, this.headOrTail = this.sausageSegments[0], this.screenToWorldRatio = 2 * GameManager.instance.camera.camera.orthoHeight / window.innerHeight, this.startPos = new pc.Vec2, this.attached = !1, this.loaded = !1, this.segment = this.head, this.stuckSegment = this.segment, this.offset = new pc.Vec2, this.coolDown = !1, this.firstMouseUp = !0;
    var t = this.app.touch;
    t ? (t.on(pc.EVENT_TOUCHSTART, this.onMouseDown, this), t.on(pc.EVENT_TOUCHMOVE, this.onMouseMove, this), t.on(pc.EVENT_TOUCHEND, this.onMouseUp, this)) : (this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this)), this.on("destroy", (function() {
        PlayerController.instance = void 0, this.app.mouse && (this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this)), this.app.touch && (this.app.touch.off(pc.EVENT_TOUCHSTART, this.onMouseDown, this), this.app.touch.off(pc.EVENT_TOUCHEND, this.onMouseUp, this), this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onMouseMove, this))
    }), this), this.sausageSegments.forEach((t => {
        t.collision.on("collisionstart", (e => {
            this.onCollisionEnter(e, t)
        }), this)
    })), setTimeout((() => {
        this.springs.forEach((t => {
            t.script.springJoint.stifness = t.script.springJoint.initialStifness * this.springMultiplier, t.script.springJoint.damping = t.script.springJoint.initialStifness * this.springMultiplier, t.script.springJoint.createConstraint()
        }))
    }), 100), this.on("attr", (function(t, e, s) {
        "springMultiplier" === t && this.changeSpringStifness(e)
    })), setTimeout((() => {}), 500)
}, PlayerController.prototype.changeSpringStifness = function(t) {
    this.springs.forEach((e => {
        e.script.springJoint.stifness = e.script.springJoint.initialStifness * this.springMultiplier * t, e.script.springJoint.damping = e.script.springJoint.initialStifness * this.springMultiplier * t, e.script.springJoint.createConstraint()
    }))
}, PlayerController.prototype.hingeLimits = function(t) {
    this.sausageSegments.forEach(((e, s) => {
        s > 0 && (e.script.hingeConstraint.limits = t ? new pc.Vec2(-7, 7) : new pc.Vec2(-45, 45))
    }))
}, PlayerController.prototype.onMouseDown = function(t) {
    let e, s;
    this.activated && (t.hasOwnProperty("touches") ? (e = t.touches[0].touch.clientX, s = t.touches[0].touch.clientY) : (e = t.x, s = t.y), !this.loaded && !this.debug || GameManager.instance.finished || this.paused || (this.mouseDown = !0, this.dashMeter.setLocalScale(0, 0, 0), this.dashMeter.enabled = !0, this.app.timeScale = .1, this.startPos = new pc.Vec2(e, s))), t.event.preventDefault()
};
const clamp = (t, e, s) => Math.min(Math.max(t, e), s);
PlayerController.prototype.onMouseMove = function(t) {
    let e, s;
    t.hasOwnProperty("touches") ? (e = t.touches[0].touch.clientX, s = t.touches[0].touch.clientY) : (!t.buttons[0] && this.mouseDown && (this.mouseDown = !1), e = t.x, s = t.y), this.activated && !this.paused && this.mouseDown && (this.mouseMoved = !0, this.mousePos = new pc.Vec2(e, s), this.delta = this.mousePos.sub(this.startPos).mulScalar(this.screenToWorldRatio), this.offset = (new pc.Vec2).copy(this.delta).normalize().mulScalar(clamp(this.delta.length(), 1.25 * this.forceThresholds.x, 1.25 * this.forceThresholds.y)), this.dashMeter.setLocalScale(this.offset.length() / 5, this.offset.length() / 5, 0)), t.event.preventDefault()
}, PlayerController.prototype.onMouseUp = function(t) {
    (this.loaded || this.debug) && !this.paused && this.mouseDown && (null != this.delta && this.delta != pc.Vec3.ZERO && this.delta.length() >= 1 && (this.unstick(), this.dash(this.processForce(this.delta))), this.app.timeScale = 1, this.mouseDown = !1, this.dashMeter.enabled = !1, this.mouseMoved = !1), this.unPause && (this.paused = !1, this.unPause = !1, this.mouseDown = !1), t && t.event.preventDefault()
}, PlayerController.prototype.processForce = function(t) {
    let e = t.clone().normalize(),
        s = clamp(t.length(), .5, 2.5);
    return e.mulScalar(s * this.force)
}, PlayerController.prototype.dash = function(t) {
    this.firstMouseUp && (PauseButton.instance.show(), SkinsButton.instance.hideButton(), PokiManager.instance.removeBanner(), this.firstMouseUp = !1);
    let e = new Ammo.btVector3;
    this.sausageSegments.forEach(((t, s) => {
        t.rigidbody.body.setActivationState(1), t.rigidbody.body.activate(), e.setValue(0, 0, 0), t.rigidbody.body.setLinearVelocity(e), e.setValue(0, 0, 0), this.sausageSegments[2].rigidbody.body.setAngularVelocity(e)
    })), this.eyes.forEach(((t, s) => {
        this.eye && (e.setValue(0, 0, 0), t.rigidbody.body.setLinearVelocity(e))
    })), this.coolDown = !0, setTimeout((() => {
        this.coolDown = !1
    }), this.coolDownTime), this.headOrTail.rigidbody.body.applyImpulse(new Ammo.btVector3(t.x, -t.y, 0))
}, PlayerController.prototype.unstick = function(t) {
    if (this.activated && this.attached && !this.paused) {
        this.stuckSegment.children[0].script.hinge.enabled = !1, this.hingeLimits(!0), this.changeSpringStifness(8), this.loaded = !1, this.attached = !1
    }
}, PlayerController.prototype.stick = function(t, e) {
    this.attached = !0, this.loaded = !0;
    let s = t.children[0].script.hinge;
    this.stuckSegment = t;
    let i = 0;
    this.sausageSegments.forEach((t => {
        let e = this.stuckSegment.getPosition().sub(t.getPosition()).length();
        e <= i || (i = e, this.headOrTail = t)
    })), this.hingeLimits(!1), this.changeSpringStifness(4), s.entityB = e.other, s.pivotA = e.contacts[0].localPoint, s.pivotB = e.contacts[0].localPointOther, s.createConstraint(), s.enabled = !0;
    let o = this.landParticles.resource.instantiate();
    t.addChild(o), o.particlesystem.play(), o.setLocalPosition(0, 0, 0), CameraManager.instance.flashOutline(.5)
}, PlayerController.prototype.onCollisionEnter = function(t, e) {
    this.attached || this.coolDown || t.other.tags._list.includes("NotSticky") || (this.oldEntity = t, t.other.tags._list.includes("Segment") || (this.stick(e, t), this.mouseDown = !1))
}, PlayerController.prototype.death = function() {
    PokiManager.instance.interstitial((() => {
        this.activated = !1, GameManager.instance.respawned = !0, GameManager.instance.startLevel(!0)
    }))
}, PlayerController.prototype.update = function(t) {
    this.head.getPosition().y < -30 && !GameManager.instance.finished && this.activated && this.death(), this.dashMeter.enabled && (this.dashMeter.setPosition(this.headOrTail.getPosition()), this.dashMeter.setRotation((new pc.Quat).setFromEulerAngles(0, 0, 180 * Math.atan2(-this.offset.normalize().y, this.offset.normalize().x) / Math.PI)))
};
var CameraManager = pc.createScript("cameraManager");
CameraManager.attributes.add("target", {
    type: "entity"
}), CameraManager.attributes.add("speed", {
    type: "number"
}), CameraManager.attributes.add("offset", {
    type: "number"
}), CameraManager.attributes.add("yOffset", {
    type: "number"
}), CameraManager.attributes.add("xOffset", {
    type: "number"
}), CameraManager.attributes.add("verticalBounds", {
    type: "number"
}), CameraManager.attributes.add("flashEntity", {
    type: "entity"
}), CameraManager.attributes.add("outline", {
    type: "entity"
}), CameraManager.attributes.add("state", {
    type: "string"
}), CameraManager.attributes.add("xLimits", {
    type: "vec2",
    default: [0, 0]
}), CameraManager.attributes.add("yLimits", {
    type: "vec2",
    default: [0, 0]
}), CameraManager.prototype.initialize = function() {
    CameraManager.instance = this, this.orthoHeight = this.entity.camera.orthoHeight, this.sausageCamera = this.entity.findByName("Sausage Camera"), this.shadowCamera = this.entity.findByName("Shadow Camera"), this.shopOffsetX = 0, this.shopOffsetY = 0, this.baseShopOffsetY = 5
}, CameraManager.prototype.flash = function(t) {
    let e = {
            x: 1
        },
        a = this.flashEntity.tween(e);
    a.to({
        x: 0
    }, t / 2, pc.Linear, 0, 1).on("update", (() => {
        a.manager.setTs(1 / this.app.timeScale), this.flashEntity.sprite.opacity = e.x
    })).start()
}, CameraManager.prototype.flashOutline = function(t) {
    let e = {
            x: 1
        },
        a = this.outline.tween(e);
    a.to({
        x: 0
    }, t / 2, pc.Linear, 0, 1).on("update", (() => {
        a.manager.setTs(1 / this.app.timeScale), this.outline.element.opacity = e.x
    })).start()
}, CameraManager.prototype.update = function(t) {
    this.orthoHeight != this.entity.camera.orthoHeight && (this.orthoHeight = this.entity.camera.orthoHeight, this.sausageCamera.camera.orthoHeight = this.orthoHeight, this.shadowCamera.camera.orthoHeight = this.orthoHeight), GameManager.instance.level && (GameManager.instance.playerController && GameManager.instance.levelStarted ? (this.target = GameManager.instance.playerController.sausageSegments[2], this.position = this.entity.getPosition(), this.entity.setPosition(pc.math.lerp(this.position.x, this.target.getPosition().x + this.xOffset, t * this.offset), this.yOffset, this.position.z)) : "Main Menu" == GameManager.instance.level.name ? (this.position = this.entity.getPosition(), this.entity.setPosition(pc.math.lerp(this.position.x, 0, t * this.offset * 10), this.yOffset, this.position.z)) : "Shop" != GameManager.instance.level.name && "shop" != this.state || (this.target = ShopManager.instance.selectedPage, this.position = this.entity.getPosition(), this.entity.setPosition(pc.math.lerp(this.position.x, clamp(this.target.getPosition().x + this.shopOffsetX, -40, 10), t * this.offset * 2), pc.math.lerp(this.position.y, this.target.getPosition().y + this.shopOffsetY + this.baseShopOffsetY, t * this.offset * 2), this.position.z)))
};
var PhysicsLayer = pc.createScript("physicsLayer");
PhysicsLayer.attributes.add("groupA", {
    type: "boolean",
    default: !1,
    title: "Group A"
}), PhysicsLayer.attributes.add("groupB", {
    type: "boolean",
    default: !1,
    title: "Group B"
}), PhysicsLayer.attributes.add("groupC", {
    type: "boolean",
    default: !1,
    title: "Group C"
}), PhysicsLayer.attributes.add("groupD", {
    type: "boolean",
    default: !1,
    title: "Group D"
}), PhysicsLayer.attributes.add("maskAll", {
    type: "boolean",
    default: !0,
    title: "Mask All"
}), PhysicsLayer.attributes.add("maskA", {
    type: "boolean",
    default: !1,
    title: "Mask A"
}), PhysicsLayer.attributes.add("maskB", {
    type: "boolean",
    default: !1,
    title: "Mask B"
}), PhysicsLayer.attributes.add("maskC", {
    type: "boolean",
    default: !1,
    title: "Mask C"
}), PhysicsLayer.attributes.add("maskD", {
    type: "boolean",
    default: !1,
    title: "Mask D"
}), PhysicsLayer.prototype.initialize = function() {
    var t = this.entity.rigidbody;
    this.groupA && (t.group |= pc.BODYGROUP_USER_1), this.groupB && (t.group |= pc.BODYGROUP_USER_2), this.groupC && (t.group |= pc.BODYGROUP_USER_3), this.groupD && (t.group |= pc.BODYGROUP_USER_4), t.mask = pc.BODYGROUP_TRIGGER, this.maskAll && (t.mask |= pc.BODYMASK_ALL), this.maskA && (t.mask |= pc.BODYGROUP_USER_1), this.maskB && (t.mask |= pc.BODYGROUP_USER_2), this.maskC && (t.mask |= pc.BODYGROUP_USER_3), this.maskD && (t.mask |= pc.BODYGROUP_USER_4)
};
var TriggerLayer = pc.createScript("triggerLayer");
TriggerLayer.attributes.add("groupA", {
    type: "boolean",
    default: !1,
    title: "Group A"
}), TriggerLayer.attributes.add("groupB", {
    type: "boolean",
    default: !1,
    title: "Group B"
}), TriggerLayer.attributes.add("groupC", {
    type: "boolean",
    default: !1,
    title: "Group C"
}), TriggerLayer.attributes.add("groupD", {
    type: "boolean",
    default: !1,
    title: "Group D"
}), TriggerLayer.prototype.initialize = function() {
    var r = this.entity.trigger.body,
        t = 4;
    this.groupA && (t |= pc.BODYGROUP_USER_1), this.groupB && (t |= pc.BODYGROUP_USER_2), this.groupC && (t |= pc.BODYGROUP_USER_3), this.groupD && (t |= pc.BODYGROUP_USER_4), r.setCollisionFlags(t)
};
var Hinge = pc.createScript("hinge");
Hinge.attributes.add("entityA", {
    title: "Entity",
    description: "Connected entity.",
    type: "entity"
}), Hinge.attributes.add("pivotA", {
    title: "Pivot",
    description: "Position of the constraint in the local space of this entity.",
    type: "vec3",
    default: [0, 0, 0]
}), Hinge.attributes.add("axisA", {
    title: "Axis",
    description: "Axis of rotation of the constraint in the local space this entity.",
    type: "vec3",
    default: [0, 1, 0]
}), Hinge.attributes.add("entityB", {
    title: "Connected Entity",
    description: "Optional second connected entity.",
    type: "entity"
}), Hinge.attributes.add("pivotB", {
    title: "Connected Pivot",
    description: "Position of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 0, 0]
}), Hinge.attributes.add("axisB", {
    title: "Connected Axis",
    description: "Axis of rotation of the constraint in the local space of the connected entity (if specified).",
    type: "vec3",
    default: [0, 1, 0]
}), Hinge.attributes.add("limits", {
    title: "Limits",
    description: "Low and high angular limits for the constraint in degrees. By default, low is greater than high meaning no limits.",
    type: "vec2",
    default: [1, -1]
}), Hinge.attributes.add("softness", {
    title: "Softness",
    description: 'Softness of the constraint. Recommend 0.8 to 1. Describes the percentage of limits where movement is free. Beyond this softness percentage, the limit is gradually enforced until the "hard" (1.0) limit is reached.',
    type: "number",
    min: 0,
    max: 1,
    default: .9
}), Hinge.attributes.add("biasFactor", {
    title: "Bias Factor",
    description: "Bias factor of the constraint. Recommend 0.3 +/- approximately 0.3. Strength with which constraint resists zeroth order (angular, not angular velocity) limit violation.",
    type: "number",
    min: 0,
    max: 1,
    default: .3
}), Hinge.attributes.add("relaxationFactor", {
    title: "Relaxation Factor",
    description: "Relaxation factor of the constraint. Recommend to keep this near 1. The lower the value, the less the constraint will fight velocities which violate the angular limits.",
    type: "number",
    min: 0,
    max: 1,
    default: 1
}), Hinge.attributes.add("enableMotor", {
    title: "Use Motor",
    description: "Enable a motor to power the automatic rotation around the hinge axis.",
    type: "boolean",
    default: !1
}), Hinge.attributes.add("motorTargetVelocity", {
    title: "Target Velocity",
    description: "Target motor angular velocity.",
    type: "number",
    default: 0
}), Hinge.attributes.add("maxMotorImpulse", {
    title: "Max Motor Impulse",
    description: "Maximum motor impulse.",
    type: "number",
    default: 0
}), Hinge.attributes.add("breakingThreshold", {
    title: "Break Threshold",
    description: "Maximum breaking impulse threshold required to break the constraint.",
    type: "number",
    default: 34e37
}), Hinge.attributes.add("enableCollision", {
    title: "Enable Collision",
    description: "Enable collision between linked rigid bodies.",
    type: "boolean",
    default: !0
}), Hinge.attributes.add("debugRender", {
    title: "Debug Render",
    description: "Enable to render a representation of the constraint.",
    type: "boolean",
    default: !1
}), Hinge.attributes.add("debugColor", {
    title: "Debug Color",
    description: "The color of the debug rendering of the constraint.",
    type: "rgb",
    default: [1, 0, 0]
}), Hinge.prototype.initialize = function() {
    this.createConstraint(), this.on("attr", ((t, i, e) => {
        if ("pivotA" === t || "axisA" === t || "entityB" === t || "pivotB" === t || "axisB" === t) this.createConstraint();
        else if ("limits" === t || "softness" === t || "biasFactor" === t || "relaxationFactor" === t) {
            var o = this.limits.x * Math.PI / 180,
                n = this.limits.y * Math.PI / 180;
            this.constraint.setLimit(o, n, this.softness, this.biasFactor, this.relaxationFactor)
        } else "enableMotor" === t || "motorTargetVelocity" === t || "maxMotorImpulse" === t ? (this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse), this.activate()) : "breakingThreshold" === t && (this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.activate())
    })), this.on("enable", (function() {
        this.createConstraint()
    })), this.on("disable", (function() {
        this.destroyConstraint()
    })), this.on("destroy", (function() {
        this.destroyConstraint()
    }))
}, Hinge.prototype.createConstraint = function() {
    this.constraint && this.destroyConstraint();
    var t = new pc.Vec3,
        i = new pc.Vec3,
        e = new pc.Quat,
        o = new pc.Mat4;
    this.entityA ? this.entityA = this.entityA : this.entityA = this.entity;
    var n = this.entityA.rigidbody.body,
        s = new Ammo.btVector3(this.pivotA.x, this.pivotA.y, this.pivotA.z);
    getOrthogonalVectors(this.axisA, t, i), o.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisA.x, this.axisA.y, this.axisA.z, 0, 0, 0, 0, 1]), e.setFromMat4(o);
    var a = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
        r = new Ammo.btTransform(a, s);
    if (this.entityB && this.entityB.rigidbody) {
        var h = this.entityB.rigidbody.body,
            d = new Ammo.btVector3(this.pivotB.x, this.pivotB.y, this.pivotB.z);
        getOrthogonalVectors(this.axisB, t, i), o.set([t.x, t.y, t.z, 0, i.x, i.y, i.z, 0, this.axisB.x, this.axisB.y, this.axisB.z, 0, 0, 0, 0, 1]), e.setFromMat4(o);
        var l = new Ammo.btQuaternion(e.x, e.y, e.z, e.w),
            c = new Ammo.btTransform(l, d);
        this.constraint = new Ammo.btHingeConstraint(n, h, r, c, !1), Ammo.destroy(c), Ammo.destroy(l), Ammo.destroy(d)
    } else this.constraint = new Ammo.btHingeConstraint(n, r, !1);
    var m = this.limits.x * Math.PI / 180,
        p = this.limits.y * Math.PI / 180;
    this.constraint.setLimit(m, p, this.softness, this.biasFactor, this.relaxationFactor), this.constraint.setBreakingImpulseThreshold(this.breakingThreshold), this.constraint.enableAngularMotor(this.enableMotor, this.motorTargetVelocity * Math.PI / 180, this.maxMotorImpulse), Ammo.destroy(r), Ammo.destroy(a), Ammo.destroy(s), this.app.systems.rigidbody.dynamicsWorld.addConstraint(this.constraint, !this.enableCollision), this.activate()
}, Hinge.prototype.destroyConstraint = function() {
    this.constraint && (this.app.systems.rigidbody.dynamicsWorld.removeConstraint(this.constraint), Ammo.destroy(this.constraint), this.constraint = null)
}, Hinge.prototype.activate = function() {
    this.entityA.rigidbody.activate(), this.entityB && this.entityB.rigidbody.activate()
}, Hinge.prototype.update = function(t) {
    if (this.debugRender) {
        var i = new pc.Vec3,
            e = new pc.Vec3,
            o = new pc.Vec3,
            n = new pc.Vec3,
            s = this.entityA.getWorldTransform();
        s.transformPoint(this.pivotA, i), s.transformVector(this.axisA, e), e.normalize().scale(.5), o.add2(i, e), n.sub2(i, e), this.app.renderLine(this.entityA.getPosition(), i, this.debugColor), this.app.renderLine(o, n, this.debugColor), this.entityB && this.app.renderLine(this.entityB.getPosition(), i, this.debugColor)
    }
}; // kinematic.js


var Shadow = pc.createScript("shadow");
Shadow.attributes.add("offset", {
    title: "Offset",
    type: "vec3",
    default: [.25, -.25, 0]
}), Shadow.attributes.add("color", {
    title: "Color",
    type: "rgb",
    default: [0, 0, 0]
}), Shadow.prototype.initialize = function() {
    let t = this.app.assets.get(this.entity.sprite.spriteAsset);
    this.shadow = new pc.Entity, this.shadow.addComponent("sprite", {
        type: pc.SPRITETYPE_SIMPLE,
        spriteAsset: t
    }), this.shadow.name = this.entity.name + " Shadow", this.shadow.setPosition(this.entity.getPosition()), this.shadow.setRotation(this.entity.getRotation()), this.shadow.setLocalScale(this.entity.getLocalScale()), this.shadow.sprite.width = this.entity.sprite.width, this.shadow.sprite.height = this.entity.sprite.height, this.shadow.sprite.color = this.color, this.shadow.sprite.layers = [1004], this.shadow.sprite.opacity = .25;
    var i = this.shadow.sprite._material.clone();
    i.blendType = pc.BLEND_SUBTRACTIVE, i.blendType.alphaWrite = !1, i.update(), this.shadow.sprite._meshInstance.material = i, this.app.root.addChild(this.shadow)
}, Shadow.prototype.update = function(t) {
    this.shadow.setRotation(this.entity.getRotation()), this.shadow.setPosition((new pc.Vec3).copy(this.entity.getPosition()).add(this.offset))
};
var ShadowRenderTexture = pc.createScript("shadowRenderTexture");
ShadowRenderTexture.attributes.add("image", {
    type: "entity"
}), ShadowRenderTexture.attributes.add("model", {
    type: "entity"
}), ShadowRenderTexture.prototype.initialize = function() {
    var e = new pc.Texture(this.app.graphicsDevice, {
            width: 1024,
            height: 1024,
            format: pc.PIXELFORMAT_R8_G8_B8
        }),
        t = new pc.RenderTarget({
            colorBuffer: e,
            depth: !0
        });
    console.log(this.model);
    var r = this.model.render.meshInstances[0].material;
    r.diffuseMap = t.colorBuffer, r.update(), console.log(this.image)
}, ShadowRenderTexture.prototype.update = function(e) {};
var RenderLayerTotexture = pc.createScript("renderLayerTotexture");
RenderLayerTotexture.attributes.add("layerName", {
    type: "string"
}), RenderLayerTotexture.prototype.initialize = function() {
    var e = new pc.Texture(this.app.graphicsDevice, {
        width: 512,
        height: 512,
        format: pc.PIXELFORMAT_R8_G8_B8,
        autoMipmap: !0
    });
    e.minFilter = pc.FILTER_LINEAR, e.magFilter = pc.FILTER_LINEAR;
    var r = new pc.RenderTarget(this.app.graphicsDevice, e, {
        depth: !0
    });
    this.app.scene.layers.getLayerByName(this.layerName).renderTarget = r
};
var ApplyTexture = pc.createScript("applyTexture");
ApplyTexture.attributes.add("layerName", {
    type: "string"
}), ApplyTexture.prototype.postInitialize = function() {
    this.app.scene.layers.getLayerByName(this.layerName);
    for (var e = this.entity.model.meshInstances, t = 0; t < e.length; ++t) {
        var r = e[t];
        r.material.emissiveMap = renderTarget.colorBuffer, r.material.update()
    }
}, ApplyTexture.prototype.update = function(e) {};
var RotateCylinder = pc.createScript("rotateCylinder");
RotateCylinder.prototype.initialize = function() {
    this.x = pc.math.random(0, 90), this.y = pc.math.random(0, 90), this.z = pc.math.random(0, 90)
}, RotateCylinder.prototype.update = function(t) {
    this.entity.rotate(this.x * t, this.y * t, this.z * t)
};
var RenderToTexture = pc.createScript("renderToTexture");
RenderToTexture.attributes.add("applyTextureToEntity", {
    type: "entity",
    title: "Entity to Apply Texture to"
}), RenderToTexture.prototype.initialize = function() {
    var e = new pc.Texture(this.app.graphicsDevice, {
            width: 512,
            height: 512,
            format: pc.PIXELFORMAT_R8_G8_B8
        }),
        t = new pc.RenderTarget(this.app.graphicsDevice, e, {
            depth: !0
        });
    this.entity.camera.renderTarget = t;
    for (var r = this.applyTextureToEntity.model.meshInstances, i = 0; i < r.length; ++i) {
        var a = r[i];
        a.material.emissiveMap = t.colorBuffer, a.material.update()
    }
}, RenderToTexture.prototype.update = function(e) {};
var RenderCameraToelement = pc.createScript("renderCameraToelement");
RenderCameraToelement.attributes.add("elementTags", {
    type: "string",
    array: !0,
    description: "Render to elements that have these tags"
}), RenderCameraToelement.attributes.add("renderResolution", {
    type: "vec2",
    description: "Resolution to render at"
}), RenderCameraToelement.attributes.add("renderOnce", {
    type: "boolean",
    description: "Renders the first frame only"
}), RenderCameraToelement.attributes.add("fixedCameraSize", {
    type: "boolean",
    default: !1
}), RenderCameraToelement.attributes.add("forcedResolution", {
    type: "vec2",
    default: [0, 0]
}), RenderCameraToelement.prototype.initialize = function() {
    this.fixedCameraSize || (this.entity.camera.orthoHeight = CameraManager.instance.entity.camera.orthoHeight), this.createNewRenderTexture(), this.renderOnceFrameCount = 0, this.on("destroy", (function() {
        this.renderTarget.destroy(), this.texture.destroy()
    }), this)
}, RenderCameraToelement.prototype.update = function(e) {
    this.renderOnce && (this.renderOnceFrameCount += 1, this.renderOnceFrameCount > 4 && (this.entity.enabled = !1))
}, RenderCameraToelement.prototype.createNewRenderTexture = function() {
    var e = this.app.graphicsDevice;
    if (this.texture && this.renderTarget) {
        var t = this.renderTarget,
            r = this.texture;
        this.renderTarget = null, this.texture = null, t.destroy(), r.destroy()
    }
    let a = e.width,
        n = e.height;
    this.forcedResolution.length() > 0 && (a = this.forcedResolution.x, n = this.forcedResolution.y);
    var i = new pc.Texture(e, {
        width: a,
        height: n,
        format: pc.PIXELFORMAT_R8_G8_B8_A8,
        autoMipmap: !0,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE
    });
    i.minFilter = pc.FILTER_LINEAR, i.magFilter = pc.FILTER_LINEAR;
    var o = new pc.RenderTarget(e, i, {
        depth: !0,
        flipY: !0,
        samples: 2
    });
    this.entity.camera.renderTarget = o, this.fixedCameraSize || (this.entity.camera.orthoHeight = CameraManager.instance.entity.camera.orthoHeight), this.texture = i, this.renderTarget = o, this.assignTextureToElements(this.texture)
}, RenderCameraToelement.prototype.assignTextureToElements = function(e) {
    for (var t, r = 0; r < this.elementTags.length; ++r) {
        t = this.app.root.findByTag(this.elementTags[r]);
        for (var a = 0; a < t.length; ++a) t[a].element.texture = e
    }
};
var SetToscreenSize = pc.createScript("setToscreenSize");
SetToscreenSize.prototype.initialize = function() {
    this.shadowCamera = GameManager.instance.camera.findByName("Shadow Camera"), this.sausageCamera = GameManager.instance.camera.findByName("Sausage Camera"), setTimeout((() => {
        this.updateScreens(2 * this.app.graphicsDevice._width, 2 * this.app.graphicsDevice._height)
    }), 100), this.app.graphicsDevice.on("resizecanvas", ((e, a) => {
        this.updateScreens(e, a)
    }))
}, SetToscreenSize.prototype.updateScreens = function(e, a) {
    this.entity.screen.referenceResolution.set(e / 2, a / 2), this.shadowCamera.script.renderCameraToelement.renderResolution = new pc.Vec2(e / 2, a / 2), this.shadowCamera.script.renderCameraToelement.createNewRenderTexture(), this.sausageCamera.script.renderCameraToelement.renderResolution = new pc.Vec2(e / 2, a / 2), this.sausageCamera.script.renderCameraToelement.createNewRenderTexture()
}, SetToscreenSize.prototype.update = function(e) {};
var SetMass = pc.createScript("setMass");
SetMass.attributes.add("mass", {
    title: "Mass",
    type: "number",
    default: .001
}), SetMass.prototype.initialize = function() {
    this.entity.rigidbody.mass = this.mass
}, SetMass.prototype.update = function(t) {};
var ButtonTween = pc.createScript("buttonTween");
ButtonTween.prototype.initialize = function() {}, ButtonTween.prototype.update = function(t) {};
var Uiscaling = pc.createScript("uiscaling");
Uiscaling.attributes.add("landScapeScaleMultiplier", {
    type: "number",
    default: 1
}), Uiscaling.attributes.add("portraitScaleMultiplier", {
    type: "number",
    default: 1
}), Uiscaling.prototype.initialize = function() {
    this.baseScale = (new pc.Vec3).copy(this.entity.getLocalScale()), this.app.graphicsDevice.on("resizecanvas", ((i, e) => {
        this.resize(i, e)
    })), this.resize(2 * this.app.graphicsDevice._width, 2 * this.app.graphicsDevice._height)
}, Uiscaling.prototype.resize = function(i, e) {
    let t = i / 2 / (e / 2),
        a = .5625,
        c = 1 * t / a;
    c = t > 1 ? 1 * this.landScapeScaleMultiplier / a : 1 * this.portraitScaleMultiplier / a, this.entity.setLocalScale(this.baseScale.x * c, this.baseScale.y * c, c)
};
var LevelGenerator = pc.createScript("levelGenerator");
LevelGenerator.attributes.add("uiTemplate", {
    type: "asset",
    assetType: "template"
}), LevelGenerator.attributes.add("sausageTemplate", {
    type: "asset",
    assetType: "template"
}), LevelGenerator.attributes.add("levelData", {
    type: "asset",
    assetType: "json"
}), LevelGenerator.attributes.add("decks", {
    type: "asset",
    assetType: "json"
}), LevelGenerator.prototype.initialize = function() {
    LevelGenerator.instance = this
}, LevelGenerator.prototype.spawnLevel = function(e) {
    let t;
    return SaveManager.instance.getItem("lastLevelId") == e ? t = SaveManager.instance.getItem("currentLevelDeck") : (SaveManager.instance.setItem("lastLevelId", e), t = Object.values(this.levelData.resources[0]).length > GameManager.instance.levelId && null != Object.values(this.levelData.resources[0])[GameManager.instance.levelId] ? Object.values(this.levelData.resources[0])[GameManager.instance.levelId] : this.generateLevel(GameManager.instance.levelId), SaveManager.instance.setItem("currentLevelDeck", t)), this.instantiateLevel(t)
}, LevelGenerator.prototype.instantiateLevel = function(e) {
    var t = new pc.Entity({
        name: "Level"
    });
    this.app.root.addChild(t), t.localPosition = new pc.Vec3(0, 0, 0), t.setPosition(new pc.Vec3(0, 0, 0));
    let a = e.patterns;
    "Pattern_Start_Onboarding" != a[0] ? (start = this.app.assets.find("Pattern_Start", "template").resource.instantiate(), doStuffToEntity(this.app.assets.find("Pattern_Start", "template").resource._templateRoot, start), start.setPosition(-17.198, -2.65, 0), t.addChild(start), this.position = start.findByName("End").getPosition()) : this.position = new pc.Vec3(-1.259, 15.747, 0), a.forEach((e => {
        console.log(e);
        let a = this.app.assets.find(e, "template", e).resource,
            n = this.app.assets.find(e, "template", e).resource.instantiate();
        n.localPosition = new pc.Vec3(0, 0, 0), n.setPosition(this.position), doStuffToEntity(a._templateRoot, n), this.position = n.findByName("End").getPosition(), t.addChild(n)
    }));
    let n = this.uiTemplate.resource,
        s = this.uiTemplate.resource.instantiate();
    return doStuffToEntity(n._templateRoot, s), t.addChild(s), ThemeManager.instance.changeTheme(), t
}, LevelGenerator.prototype.generateLevel = function(e) {
    let t = {
            patterns: []
        },
        a = Math.floor(4 * Math.random()) + 3;
    for (let n = 0; n < a; n++) t.patterns.push(this.pickRandomPattern(e));
    return t.patterns.push("Pattern_End"), t
}, LevelGenerator.prototype.pickRandomPattern = function(e) {
    let t = 0,
        a = [];
    Object.values(this.decks.resources[0]).forEach((n => {
        null != n && (e < n.unlockLevel || (t += n.weight, a.push(n)))
    }));
    let n = Math.floor(Math.random() * (1 + t - 0)) + 0,
        s = -1;
    for (; n > 0 && s < a.length;) s++, n -= a[s].weight;
    s = Math.min(Math.max(s, 0), a.length);
    let r = a[s];
    return r.index >= r.patterns.length && (r.index = 0), r.patterns[r.index++]
}, LevelGenerator.prototype.update = function(e) {};
var TestPrefab = pc.createScript("testPrefab");
TestPrefab.attributes.add("toClone", {
    type: "entity"
}), TestPrefab.prototype.initialize = function() {
    let t = this.toClone.clone(!0),
        e = t.getPosition();
    t.setPosition(e.x + 5, e.y, e.z), this.app.root.addChild(t)
}, TestPrefab.prototype.update = function(t) {};
var LoadSceneOnButtonClick = pc.createScript("loadSceneOnButtonClick");
LoadSceneOnButtonClick.attributes.add("sceneName", {
    type: "string"
}), LoadSceneOnButtonClick.prototype.initialize = function() {
    this.clicked = !1, this.entity.button.on("click", (function() {
        "Shop" == this.sceneName ? GameManager.instance.shopScene() : "Game" == this.sceneName ? GameManager.instance.startLevel() : "Menu" == this.sceneName ? GameManager.instance.mainMenu() : "Return" == this.sceneName ? "Main Menu" == GameManager.instance.lastScreen.name ? GameManager.instance.mainMenu() : GameManager.instance.startLevel() : "Unlock" == this.sceneName ? GameManager.instance.unlockLevelSkin("Cosmonaut") : "Skip" == this.sceneName && PokiManager.instance.rewarded((e => {
            e && (GameManager.instance.levelId++, GameManager.instance.levelStartFlag = !0)
        }), {
            category: "level-skip",
            detail: GameManager.instance.levelId.toString(),
            placement: "gameplay"
        })
    }), this)
}, LoadSceneOnButtonClick.prototype.ad = async function(e) {};
var Ribbon = pc.createScript("ribbon");
Ribbon.attributes.add("lifetime", {
    type: "number",
    default: .5
}), Ribbon.attributes.add("xoffset", {
    type: "number",
    default: -.8
}), Ribbon.attributes.add("yoffset", {
    type: "number",
    default: 1
}), Ribbon.attributes.add("height", {
    type: "number",
    default: .4
}), Ribbon.attributes.add("color", {
    type: "rgb",
    default: [1, 0, 0]
}), Ribbon.attributes.add("layer", {
    type: "string"
});
var MAX_VERTICES = 600,
    VERTEX_SIZE = 4;
Ribbon.prototype.create = function(t) {
    this.timer = 0, this.node = null, this.vertices = [], this.vertexData = new Float32Array(MAX_VERTICES * VERTEX_SIZE), this.entity.model = null, this.rigidbody = null;
    for (var e = this.entity; e && !this.rigidbody;) this.rigidbody = e.rigidbody, e = e.parent
}, Ribbon.prototype.initialize = function() {
    this.once("destroy", this.destroy, this), this.create();
    var t = {
            attributes: {
                aPositionAge: pc.SEMANTIC_POSITION
            },
            vshader: ["attribute vec4 aPositionAge;", "", "uniform mat4 matrix_viewProjection;", "uniform float trail_time;", "", "varying float vAge;", "", "void main(void)", "{", "    vAge = trail_time - aPositionAge.w;", "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);", "}"].join("\n"),
            fshader: ["precision mediump float;", "", "varying float vAge;", "", "uniform float trail_lifetime;", "", "uniform vec3 uColor;", "", "void main(void)", "{", "    gl_FragColor = vec4(uColor[0], uColor[1], uColor[2], (0.5 - (vAge / trail_lifetime)) * 1.0);", "}"].join("\n")
        },
        e = new pc.Shader(this.app.graphicsDevice, t),
        i = new pc.scene.Material;
    i.shader = e, i.setParameter("trail_time", 0), i.setParameter("trail_lifetime", this.lifetime), i.setParameter("uColor", [this.color.r, this.color.g, this.color.b]), i.cull = pc.CULLFACE_NONE, i.blend = !0, i.blendSrc = pc.BLENDMODE_SRC_ALPHA, i.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA, i.blendEquation = pc.BLENDMODE_ONE_MINUS_CONSTANT_ALPHA, i.blendType = pc.BLEND_NORMAL, i.depthWrite = !1;
    var o = new pc.VertexFormat(this.app.graphicsDevice, [{
            semantic: pc.SEMANTIC_POSITION,
            components: 4,
            type: pc.ELEMENTTYPE_FLOAT32
        }]),
        s = new pc.VertexBuffer(this.app.graphicsDevice, o, MAX_VERTICES * VERTEX_SIZE, pc.USAGE_DYNAMIC),
        r = new pc.scene.Mesh;
    r.vertexBuffer = s, r.indexBuffer[0] = null, r.primitive[0].type = pc.PRIMITIVE_TRISTRIP, r.primitive[0].base = 0, r.primitive[0].count = 0, r.primitive[0].indexed = !1;
    var a = new pc.scene.GraphNode,
        n = new pc.scene.MeshInstance(a, r, i);
    n.layer = pc.scene.LAYER_WORLD, n.updateKey(), this.entity.model = new pc.scene.Model, this.entity.model.graph = a, this.entity.model.meshInstances.push(n), this.model = this.entity.model, this.setNode(a), this.on("attr:color", this.onColorChange)
}, Ribbon.prototype.reset = function() {
    this.timer = 0, this.vertices = []
}, Ribbon.prototype.spawn = function() {
    var t = this.node;
    this.vertices.unshift({
        spawnTime: this.timer,
        yaxis: t.up.clone().scale(this.height),
        pos: t.getPosition().clone()
    })
}, Ribbon.prototype.clearOld = function() {
    for (var t = this.vertices.length - 1; t >= 0; t--) {
        var e = this.vertices[t];
        if (!(this.timer - e.spawnTime >= this.lifetime)) return;
        this.vertices.pop()
    }
}, Ribbon.prototype.copyToArrayBuffer = function() {
    for (var t = this.xoffset, e = this.yoffset, i = 0; i < this.vertices.length; i++) {
        var o = this.vertices[i];
        o.yaxis.scale(.95);
        var s = o.pos,
            r = o.yaxis;
        this.vertexData[8 * i + 0] = s.x + r.x * t, this.vertexData[8 * i + 1] = s.y + r.y * t, this.vertexData[8 * i + 2] = s.z + r.z * t, this.vertexData[8 * i + 3] = o.spawnTime, this.vertexData[8 * i + 4] = s.x + r.x * e, this.vertexData[8 * i + 5] = s.y + r.y * e, this.vertexData[8 * i + 6] = s.z + r.z * e, this.vertexData[8 * i + 7] = o.spawnTime
    }
}, Ribbon.prototype.updateNumActive = function() {
    this.model.meshInstances[0].mesh.primitive[0].count = 2 * this.vertices.length
}, Ribbon.prototype.postUpdate = function(t) {
    var e = this.entity.getPosition();
    if (this.entity.model.graph.setPosition(e.x, e.y, e.z - .1), this.rigidbody) {
        var i = this.rigidbody.linearVelocity,
            o = 180 * Math.atan2(i.y, i.x) / Math.PI;
        this.entity.model.graph.setEulerAngles(0, 0, o)
    }
    if (this.timer += t, this.model.meshInstances[0].material.setParameter("trail_time", this.timer), this.clearOld(), this.spawn(), this.vertices.length > 1) {
        this.copyToArrayBuffer(), this.updateNumActive();
        var s = this.model.meshInstances[0].mesh.vertexBuffer;
        new Float32Array(s.lock()).set(this.vertexData), s.unlock(), this.app.scene.containsModel(this.model) || this.app.scene.addModel(this.model)
    } else this.app.scene.containsModel(this.model) && this.app.scene.removeModel(this.model)
}, Ribbon.prototype.setNode = function(t) {
    this.node = t
}, Ribbon.prototype.destroy = function() {
    this.reset(), this.app.scene.removeModel(this.model), this.off("attr:color")
}, Ribbon.prototype.onColorChange = function(t) {
    this.model.meshInstances[0].material.setParameter("uColor", [t.r, t.g, t.b])
};
var Rotate = pc.createScript("rotate");
Rotate.attributes.add("rotationSpeed", {
    type: "number"
}), Rotate.prototype.initialize = function() {}, Rotate.prototype.update = function(t) {
    this.entity.setEulerAngles(this.entity.getEulerAngles().x, 0, this.entity.getEulerAngles().z + this.rotationSpeed)
};
var SetGravity = pc.createScript("setGravity");
SetGravity.attributes.add("gravityScaleY", {
    type: "number"
}), SetGravity.attributes.add("baseGravityY", {
    type: "number"
}), SetGravity.prototype.postInitialize = function() {
    this.app.systems.rigidbody.dynamicsWorld.getGravity();
    setTimeout((() => {
        this.entity.rigidbody.body.setGravity(new Ammo.btVector3(0, this.baseGravityY * this.gravityScaleY, 0)), this.entity.rigidbody.body.setLinearVelocity(new Ammo.btVector3(0, 0, 0))
    }), 100)
};
var Ccd = pc.createScript("ccd");
Ccd.attributes.add("motionThreshold", {
    type: "number",
    default: 1,
    title: "Motion Threshold",
    description: "Number of meters moved in one frame before CCD is enabled"
}), Ccd.attributes.add("sweptSphereRadius", {
    type: "number",
    default: .2,
    title: "Swept Sphere Radius",
    description: "This should be below the half extent of the collision volume. E.g For an object of dimensions 1 meter, try 0.2"
}), Ccd.attributes.add("contactProcessingThreshold", {
    type: "number",
    default: 0,
    title: "Contact Processing Threshold",
    description: 'This should be below the half extent of the collision volume. E.g For an object of dimensions 1 meter, try 0.2the constraint solver can discard solving contacts, if the distance is above this threshold. 0 by default. \n Note that using contacts with positive distance can improve stability. It increases, however, the chance of colliding with degerate contacts, such as "interior" triangle edges'
}), Ccd.attributes.add("fixedTimeStep", {
    type: "number",
    default: 60,
    title: "Fixed Time Step",
    description: "Physics fixed time step, the number of times the physics engine step refreshes per second, changing this to more then 60 can effect performance"
}), Ccd.prototype.initialize = function() {
    var e;
    this.app.systems.rigidbody.fixedTimeStep = 1 / this.fixedTimeStep, (e = this.entity.rigidbody.body).setCcdMotionThreshold(this.motionThreshold), e.setCcdSweptSphereRadius(this.sweptSphereRadius), e.setContactProcessingThreshold(this.contactProcessingThreshold), this.on("attr:motionThreshold", (function(t, i) {
        (e = this.entity.rigidbody.body).setCcdMotionThreshold(t)
    })), this.on("attr:sweptSphereRadius", (function(t, i) {
        (e = this.entity.rigidbody.body).setCcdSweptSphereRadius(t)
    })), this.on("attr:contactProcessingThreshold", (function(t, i) {
        (e = this.entity.rigidbody.body).setContactProcessingThreshold(t)
    }))
};
doStuffToEntity = function(e, t) {
    if (null != e && "Untitled" != e.name) {
        var a = 0;
        for (a = 0; a < t.children.length; ++a) doStuffToEntity(e.children[a], t.children[a])
    }
    t.hasOwnProperty("c") && null != t.c.element && e && t.setPosition(e.getPosition()), null != t.screen && (t.c.screen.scaleBlend = e.c.screen.scaleBlend), null != t.sprite && null != e && ("Untitled" == e.name && (e = e.parent.findByName(t.name)), null != e && "Untitled" != e.name && e.sprite && (t.sprite.width = e.sprite.width, t.sprite.height = e.sprite.height))
};
var GameManager = pc.createScript("gameManager");
GameManager.attributes.add("camera", {
    type: "entity"
}), GameManager.attributes.add("menu", {
    type: "string"
}), GameManager.attributes.add("shop", {
    type: "string"
}), GameManager.attributes.add("sausageTemplate", {
    type: "asset",
    assetType: "template"
}), GameManager.attributes.add("winParticles", {
    type: "entity"
}), GameManager.attributes.add("winText", {
    type: "entity"
}), GameManager.attributes.add("test", {
    type: "boolean",
    default: !1
}), GameManager.attributes.add("skinList", {
    type: "asset",
    assetType: "json"
}), GameManager.prototype.initialize = function() {
    GameManager.instance = this, this.app.systems.rigidbody.fixedTimeStep = 1 / 120, console.log = () => {}, this.levelId = SaveManager.instance.getItem("LevelId"), this.levelStarted = !1, this.finished = !1, this.respawned = !1
}, GameManager.prototype.postInitialize = function() {
    this.test || SaveManager.instance.showTutorial ? SaveManager.instance.showTutorial && this.startLevel() : this.mainMenu(), setTimeout((() => {}))
}, GameManager.prototype.spawnCharacter = function() {
    let e = this.app.assets.find(SaveManager.instance.getItem("CurrentSkin"), "template").resource.instantiate();
    doStuffToEntity(this.app.assets.find(SaveManager.instance.getItem("CurrentSkin"), "template").resource._templateRoot, e), e.setPosition(this.level.findByName("SpawnPoint").getPosition()), e.script.playerController.enabled = !0, this.app.root.addChild(e), this.playerController = e.script.playerController
}, GameManager.prototype.mainMenu = function() {
    null, PokiManager.instance.displayBanner(), this.levelStarted = !1, SkinsButton.instance.showButton();
    let e = this.app.assets.find("Main Menu", "template").resource.instantiate();
    return doStuffToEntity(this.app.assets.find("Main Menu", "template").resource._templateRoot, e), this.app.root.addChild(e), e.setPosition(new pc.Vec3(0, 18, 0)), e.findByName("Logo").findByName("LevelText").element.text = "CHAPTER " + this.levelId + "/" + 10 * Math.ceil(this.levelId / 10), this.start = this.app.assets.find("Pattern_Start", "template").resource.instantiate(), doStuffToEntity(this.app.assets.find("Pattern_Start", "template").resource._templateRoot, this.start), this.start.setPosition(-17.198, -2.65 - e.getPosition().y, 0), e.addChild(this.start), this.app.timeScale = 1, this.level && this.level.destroy(), this.level = e, this.playerController && this.playerController.entity.destroy(), this.spawnCharacter(), this.playerController.activated = !1, e
}, GameManager.prototype.transitionScene = function() {
    this.level && this.level.destroy(), this.level.name = "Main Menu", this.playerController && this.playerController.entity.destroy();
    let e = this.app.assets.find("Transition", "template").resource.instantiate();
    doStuffToEntity(this.app.assets.find("Transition", "template").resource._templateRoot, e), this.app.root.addChild(e)
}, GameManager.prototype.shopScene = function() {
    this.levelStarted = !1, this.app.timeScale = 1, null, PokiManager.instance.displayBanner(), SkinsButton.instance.hideButton(.1), this.playerController && this.playerController.entity.destroy();
    let e = this.app.assets.find("Shop", "template").resource.instantiate();
    return doStuffToEntity(this.app.assets.find("Shop", "template").resource._templateRoot, e), this.app.root.addChild(e), this.lastScreen = this.level, this.level && this.level.destroy(), this.level = e, e
}, GameManager.prototype.unlockLevelSkin = function(e) {
    let t = this.app.assets.find("New Skin", "template").resource.instantiate();
    if (doStuffToEntity(this.app.assets.find("New Skin", "template").resource._templateRoot, t), e) {
        t.script.newSkinPopup.skin = e.name;
        let a = SaveManager.instance.getItem("Skins");
        a.push(e.name), SaveManager.instance.setItem("Skins", a)
    } else {
        let e = Object.values(this.skinList.resources[0]).filter((e => "REWARDED" == e.type && !SaveManager.instance.getItem("Skins").includes(e.name)));
        if (0 == e.length) return;
        let a = Math.round(Math.random() * (e.length - 1 - 0) + 0);
        t.script.newSkinPopup.rewarded = !0, t.script.newSkinPopup.skin = e[a].name
    }
    this.app.root.addChild(t)
}, GameManager.prototype.startLevel = function(e) {
     SkinsButton.instance.showButton(), this.app.timeScale = 1, setTimeout((() => {
        SaveManager.instance.setItem("LevelId", this.levelId);
        let t = !1;
        e || (t = this.checkSkinUnlock()), this.level && this.level.destroy(), this.level = LevelGenerator.instance.spawnLevel(this.levelId), this.levelStarted = !0, this.playerController && this.playerController.entity.destroy(), this.spawnCharacter(), this.playerController.activated = !t, this.finished = !1
    }), 1)
}, GameManager.prototype.finishedLevel = function() {
    PokiManager.instance.displayBanner(), null, PauseButton.instance.hide(), this.finished = !0, this.respawned = !1, this.levelStarted = !1, this.app.timeScale = 1, SkipLevel.instance.hideButton();
    let e = {
        x: 1
    };
    CameraManager.instance.flash(2), this.winParticles.children.forEach((e => {
        e.enabled = !0
    })), setTimeout((() => {
        this.entity.tween(e).to({
            x: .1
        }, .3, pc.Linear).on("update", (() => {
            this.app.timeScale = e.x, this.winParticles.children.forEach((e => {
                e.particlesystem.emitter.fixedTimeStep = .016 * this.app.timeScale
            }))
        })).start(), this.winText.enabled = !0, this.winText.findByName("MaskRound").script.maskTransform.test(), this.winText.tween(new pc.Vec3(0, 0, 180)).rotate(new pc.Vec3(0, 0, 0), .5, pc.Linear).on("complete", (() => {
            this.winText.tween(new pc.Vec3(0, 0, 0)).rotate(new pc.Vec3(0, 0, -10), .5, pc.Linear).on("complete", (() => {})).start()
        })).start()
    }), 200);
    let t = {
        x: this.camera.camera.orthoHeight
    };
    this.entity.tween(t).to({
        x: t.x / 1.5
    }, .5, pc.Linear).on("update", (() => {
        this.camera.camera.orthoHeight = t.x
    })).start(), this.winParticles.children.forEach((e => {
        e.particlesystem.reset(), e.particlesystem.play()
    })), setTimeout((() => {
        PokiManager.instance.interstitial((() => {
            this.winParticles.children.forEach((e => {
                e.enabled = !1
            }));
            let e = {
                x: this.camera.camera.orthoHeight
            };
            this.entity.tween(e).to({
                x: 25
            }, .3, pc.Linear).on("update", (() => {
                this.camera.camera.orthoHeight = e.x
            })).start(), this.levelId++, this.winText.enabled = !1, this.transitionScene()
        }))
    }), 2e3)
}, GameManager.prototype.checkSkinUnlock = function(e) {
    let t = Object.values(this.skinList.resources[0]).find((e => e.level == this.levelId));
    return t && !SaveManager.instance.getItem("Skins").includes(t.name) ? (this.unlockLevelSkin(t), !0) : 1 == Math.round(5 * Math.random() + 0) && this.levelId > 10 ? (this.unlockLevelSkin(), !0) : (SkinsButton.instance.showButton(), !1)
}, GameManager.prototype.postUpdate = function(e) {
    window.compound = this.app.systems.rigidbody._compounds, window.dynamic = this.app.systems.rigidbody._dynamic, window.kinematic = this.app.systems.rigidbody._kinematic, this.levelStartFlag && (this.levelStartFlag = !1, this.startLevel())
};
var TriggerVolume = pc.createScript("triggerVolume");
TriggerVolume.prototype.initialize = function() {
    this.entity.collision.on("triggerenter", (function(e) {
        !GameManager.instance.finished && e.tags._list.includes("Segment") && GameManager.instance.finishedLevel()
    })), this.entity.collision.on("triggerleave", (function(e) {}))
};
var ShadeNormal = pc.createScript("shadeNormal");
ShadeNormal.attributes.add("target", {
    type: "entity"
}), ShadeNormal.prototype.initialize = function() {
    console.log("Material", this.entity), this.entity.sprite.material = this.target.sprite.material, this.entity.sprite.material.update(), console.log("Modified", this.entity.sprite), console.log("Other", this.target.sprite.material)
}, ShadeNormal.prototype.update = function(t) {};
var HeightToNormal = pc.createScript("heightToNormal");
HeightToNormal.attributes.add("blurIterations", {
    type: "number",
    default: 2
}), HeightToNormal.attributes.add("strength", {
    type: "number",
    min: 0,
    max: 1,
    default: 1
}), pc.GraphicsDevice.prototype.setUniform = function(e, r) {
    this.scope.resolve(e).setValue(r)
}, HeightToNormal.createShaders = function(e) {
    var r = ["attribute vec2 aPosition;", "", "varying vec2 vUv0;", "", "void main()", "{", "    gl_Position = vec4(aPosition, 0.0, 1.0);", "    vUv0 = aPosition.xy * 0.5 + 0.5;", "}"].join("\n"),
        t = ["precision " + e.graphicsDevice.precision + " float;", "", "varying vec2 vUv0;", "", "uniform sampler2D uColorBuffer;", "", "void main()", "{", "    gl_FragColor = texture2D(uColorBuffer, vUv0);", "}"].join("\n"),
        v = ["precision " + e.graphicsDevice.precision + " float;", "", "varying vec2 vUv0;", "", "uniform vec2 uResolution;", "uniform sampler2D uColorBuffer;", "uniform vec2 uDirection;", "", "vec4 blur(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {", "    vec4 color = vec4(0.0);", "    vec2 off1 = vec2(1.411764705882353) * direction;", "    vec2 off2 = vec2(3.2941176470588234) * direction;", "    vec2 off3 = vec2(5.176470588235294) * direction;", "    color += texture2D(image, uv) * 0.1964825501511404;", "    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;", "    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;", "    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;", "    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;", "    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;", "    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;", "    return color;", "}", "", "void main()", "{", "    gl_FragColor = blur(uColorBuffer, vUv0, uResolution, uDirection);", "}"].join("\n"),
        o = ["precision " + e.graphicsDevice.precision + " float;", "", "varying vec2 vUv0;", "", "uniform vec2 uResolution;", "uniform float dz;", "uniform float invertR;", "uniform float invertG;", "uniform float invertH;", "uniform int type;", "uniform sampler2D uHeightMap;", "", "void main()", "{", "    vec2 step = vec2(-1.0 / uResolution.x, -1.0 / uResolution.y);", "    vec2 tlv = vec2(vUv0.x - step.x, vUv0.y + step.y );", "    vec2 lv  = vec2(vUv0.x - step.x, vUv0.y          );", "    vec2 blv = vec2(vUv0.x - step.x, vUv0.y - step.y);", "    vec2 tv  = vec2(vUv0.x         , vUv0.y + step.y);", "    vec2 bv  = vec2(vUv0.x         , vUv0.y - step.y);", "    vec2 trv = vec2(vUv0.x + step.x, vUv0.y + step.y );", "    vec2 rv  = vec2(vUv0.x + step.x, vUv0.y          );", "    vec2 brv = vec2(vUv0.x + step.x, vUv0.y - step.y);", "    tlv = vec2(tlv.x >= 0.0 ? tlv.x : (1.0 + tlv.x),  tlv.y >= 0.0\t? tlv.y : (1.0  + tlv.y));", "    tlv = vec2(tlv.x < 1.0  ? tlv.x : (tlv.x - 1.0 ), tlv.y < 1.0  ? tlv.y : (tlv.y - 1.0 ));", "    lv  = vec2( lv.x >= 0.0 ?  lv.x : (1.0 + lv.x),   lv.y  >= 0.0 ?  lv.y : (1.0  +  lv.y));", "    lv  = vec2( lv.x < 1.0  ?  lv.x : ( lv.x - 1.0 ), lv.y  < 1.0  ?  lv.y : ( lv.y - 1.0 ));", "    blv = vec2(blv.x >= 0.0 ? blv.x : (1.0 + blv.x),  blv.y >= 0.0 ? blv.y : (1.0  + blv.y));", "    blv = vec2(blv.x < 1.0  ? blv.x : (blv.x - 1.0 ), blv.y < 1.0  ? blv.y : (blv.y - 1.0 ));", "    tv  = vec2( tv.x >= 0.0 ?  tv.x : (1.0 + tv.x),   tv.y  >= 0.0 ? tv.y  : (1.0  +  tv.y));", "    tv  = vec2( tv.x < 1.0  ?  tv.x : ( tv.x - 1.0 ), tv.y  < 1.0  ? tv.y  : ( tv.y - 1.0 ));", "    bv  = vec2( bv.x >= 0.0 ?  bv.x : (1.0 + bv.x),   bv.y  >= 0.0 ? bv.y  : (1.0  +  bv.y));", "    bv  = vec2( bv.x < 1.0  ?  bv.x : ( bv.x - 1.0 ), bv.y  < 1.0  ? bv.y  : ( bv.y - 1.0 ));", "    trv = vec2(trv.x >= 0.0 ? trv.x : (1.0 + trv.x),  trv.y >= 0.0 ? trv.y : (1.0  + trv.y));", "    trv = vec2(trv.x < 1.0  ? trv.x : (trv.x - 1.0 ), trv.y < 1.0  ? trv.y : (trv.y - 1.0 ));", "    rv  = vec2( rv.x >= 0.0 ?  rv.x : (1.0 + rv.x),   rv.y  >= 0.0 ? rv.y  : (1.0  +  rv.y));", "    rv  = vec2( rv.x < 1.0  ?  rv.x : ( rv.x - 1.0 ), rv.y  < 1.0  ? rv.y  : ( rv.y - 1.0 ));", "    brv = vec2(brv.x >= 0.0 ? brv.x : (1.0 + brv.x),  brv.y >= 0.0 ? brv.y : (1.0  + brv.y));", "    brv = vec2(brv.x < 1.0  ? brv.x : (brv.x - 1.0 ), brv.y < 1.0  ? brv.y : (brv.y - 1.0 ));", "    float tl = abs(texture2D(uHeightMap, tlv).r);", "    float l  = abs(texture2D(uHeightMap, lv ).r);", "    float bl = abs(texture2D(uHeightMap, blv).r);", "    float t  = abs(texture2D(uHeightMap, tv ).r);", "    float b  = abs(texture2D(uHeightMap, bv ).r);", "    float tr = abs(texture2D(uHeightMap, trv).r);", "    float r  = abs(texture2D(uHeightMap, rv ).r);", "    float br = abs(texture2D(uHeightMap, brv).r);", "    float dx = 0.0, dy = 0.0;", "    if (type == 0) // Sobel", "    {", "        dx = tl + l*2.0 + bl - tr - r*2.0 - br;", "        dy = tl + t*2.0 + tr - bl - b*2.0 - br;", "    }", "    else // Scharr", "    {", "        dx = tl*3.0 + l*10.0 + bl*3.0 - tr*3.0 - r*10.0 - br*3.0;", "        dy = tl*3.0 + t*10.0 + tr*3.0 - bl*3.0 - b*10.0 - br*3.0;", "    }", "    vec3 normal = normalize(vec3(dx * invertR * invertH * 255.0, dy * invertG * invertH * 255.0, dz));", "    gl_FragColor = vec4(normal.xyz * 0.5 + 0.5, 1.0);", "}"].join("\n"),
        createShader = function(r, t) {
            var v = {
                attributes: {
                    aPosition: pc.SEMANTIC_POSITION
                },
                vshader: r,
                fshader: t
            };
            return new pc.Shader(e.graphicsDevice, v)
        };
    HeightToNormal.copyShader = createShader(r, t), HeightToNormal.blurShader = createShader(r, v), HeightToNormal.normalMapShader = createShader(r, o)
}, HeightToNormal.prototype.createTexture = function(e, r) {
    return new pc.Texture(this.app.graphicsDevice, {
        width: e,
        height: r,
        format: pc.PIXELFORMAT_R8_G8_B8,
        minFilter: pc.FILTER_LINEAR,
        magFilter: pc.FILTER_LINEAR,
        addressU: pc.ADDRESS_CLAMP_TO_EDGE,
        addressV: pc.ADDRESS_CLAMP_TO_EDGE,
        mipmaps: !1,
        anisotropy: 8
    })
}, HeightToNormal.prototype.createRenderTarget = function(e) {
    return new pc.RenderTarget(this.app.graphicsDevice, e, {
        depth: !1
    })
}, HeightToNormal.prototype.createQuad = function() {
    var e = this.app,
        r = new pc.VertexFormat(e.graphicsDevice, [{
            semantic: pc.SEMANTIC_POSITION,
            components: 2,
            type: pc.ELEMENTTYPE_FLOAT32
        }]),
        t = new pc.VertexBuffer(e.graphicsDevice, r, 4);
    return new Float32Array(t.lock()).set([-1, -1, 1, -1, -1, 1, 1, 1]), t.unlock(), t
}, HeightToNormal.prototype.initialize = function() {
    HeightToNormal.copyShader || HeightToNormal.createShaders(this.app), this.quad = this.createQuad()
}, HeightToNormal.prototype.generate = function(e) {
    var r = this.app.graphicsDevice,
        t = e.width,
        v = e.height,
        o = this.createTexture(t, v),
        i = this.createRenderTarget(o),
        a = this.createTexture(t, v),
        l = this.createRenderTarget(a);
    i.colorBuffer.minFilter = pc.FILTER_LINEAR, i.colorBuffer.mipmaps = !1, r.setUniform("uColorBuffer", e), pc.drawFullscreenQuad(r, l, this.quad, HeightToNormal.copyShader);
    for (var c = 0; c < this.blurIterations; c++) {
        r.setUniform("uColorBuffer", l.colorBuffer), r.setUniform("uResolution", new Float32Array([e.width, e.height]));
        r.setUniform("uDirection", new Float32Array(c % 2 == 0 ? [.2, 0] : [0, .2])), pc.drawFullscreenQuad(r, i, this.quad, HeightToNormal.blurShader);
        var n = i;
        i = l, l = n
    }
    return i.colorBuffer.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR, i.colorBuffer.mipmaps = !0, r.setUniform("uHeightMap", l.colorBuffer), r.setUniform("uResolution", new Float32Array([e.width, e.height])), r.setUniform("dz", 100 * this.strength), r.setUniform("invertR", -1), r.setUniform("invertG", 1), r.setUniform("invertH", 1), r.setUniform("type", 0), pc.drawFullscreenQuad(r, i, this.quad, HeightToNormal.normalMapShader), {
        normalMap: i.colorBuffer,
        heightMap: l.colorBuffer
    }
};
var MaskTransform = pc.createScript("maskTransform");
MaskTransform.attributes.add("baseText", {
    type: "entity"
}), MaskTransform.prototype.initialize = function() {
    this.initPos = (new pc.Vec3).copy(this.entity.getLocalPosition()), this.initPosChild = (new pc.Vec3).copy(this.entity.children[0].getLocalPosition())
}, MaskTransform.prototype.test = function(t) {
    this.entity.setLocalPosition(this.initPos.x, this.initPos.y, this.initPos.z), this.entity.children[0].setLocalPosition(this.initPosChild.x, this.initPosChild.y, this.initPosChild.z), this.entity.tween(this.entity.getLocalPosition()).to(new pc.Vec3(this.entity.getLocalPosition().x + 90, this.entity.getLocalPosition().y, this.entity.getLocalPosition().z), 2, pc.Linear).on("update", (() => {
        this.entity.children[0].setPosition(this.baseText.getPosition().x, this.baseText.getPosition().y, this.baseText.getPosition().z)
    })).on("complete", (() => {})).start()
};
var PauseButton = pc.createScript("pauseButton");
PauseButton.attributes.add("sprites", {
    type: "asset",
    assetType: "sprite",
    array: !0
}), PauseButton.prototype.initialize = function() {
    PauseButton.instance = this, this.pauseSprite = this.sprites[0].resource, this.homeSprite = this.sprites[1].resource, this.paused = !1, this.entity.parent.findByName("PlayButton").button.on("click", (() => {
        this.unPause()
    })), this.entity.button.on("click", (() => {
        GameManager.instance.finished || (this.paused ? PokiManager.instance.interstitial((() => {
            GameManager.instance.mainMenu()
        })) : this.pause())
    }), this)
}, PauseButton.prototype.show = function(t) {
    this.entity.enabled = !0;
    let e = this.entity.tween(this.entity.getLocalPosition());
    e.to(new pc.Vec3(37.948, this.entity.getLocalPosition().y, 0), 1, pc.ElasticOut).on("complete", (() => {})).on("update", (() => {
        e.manager.setTs(1 / this.app.timeScale)
    })).start()
}, PauseButton.prototype.hide = function(t) {
    let e = this.entity.tween(this.entity.getLocalPosition());
    e.to(new pc.Vec3(-23.872, this.entity.getLocalPosition().y, 0), 1, pc.ElasticIn).on("complete", (() => {
        this.entity.enabled = !1
    })).on("update", (() => {
        e.manager.setTs(1 / this.app.timeScale)
    })).start()
}, PauseButton.prototype.pause = function(t) {
    null, this.paused = !0, this.previousTimeScale = this.app.timeScale, this.app.timeScale = 0, GameManager.instance.playerController.activated = !1, GameManager.instance.playerController.paused = !0, this.entity.element._image.sprite = this.homeSprite, this.entity.parent.findByName("PlayButton").enabled = !0
}, PauseButton.prototype.unPause = function(t) {
    null, this.paused = !1, this.app.timeScale = 1, this.entity.parent.findByName("PlayButton").enabled = !1, this.entity.element._image.sprite = this.pauseSprite, GameManager.instance.playerController.activated = !0, GameManager.instance.playerController.unPause = !0
}, PauseButton.prototype.update = function(t) {};
var DestroyEntity = pc.createScript("destroyEntity");
DestroyEntity.prototype.initialize = function() {
    this.entity.destroy()
}, DestroyEntity.prototype.update = function(t) {};
var ProgressBar = pc.createScript("progressBar");
ProgressBar.attributes.add("curLevel", {
    type: "entity"
}), ProgressBar.attributes.add("nextLevel", {
    type: "entity"
}), ProgressBar.prototype.initialize = function() {
    this.percentage = 0, this.curLevel.element.text = GameManager.instance.levelId, this.nextLevel.element.text = GameManager.instance.levelId + 1
}, ProgressBar.prototype.update = function(e) {
    this.entity.element.width = Math.min(Math.max(9.288 * GameManager.instance.playerController.sausageSegments[0].getPosition().x / GameManager.instance.level.findByName("Pattern_Finish").getPosition().x, 0), 9.288)
};
var Tester = pc.createScript("tester");
Tester.prototype.initialize = function() {
    setTimeout((() => {
        this.entity.script.hingeConstraint.enabled = !0, this.entity.script.hingeConstraint.createConstraint()
    }), 100), this.on("enable", (function() {})), this.on("disable", (function() {
        this.entity.script.hingeConstraint.enabled = !1
    }))
}, Tester.prototype.update = function(t) {};
var CompoundConstraint = pc.createScript("compoundConstraint");
CompoundConstraint.prototype.initialize = function() {
    setTimeout((() => {
        this.entity.parent.script.hingeConstraint.createConstraint(), this.entity.parent.script.hingeConstraint.enabled = !0
    }), 1), this.on("enable", (function() {
        this.entity.parent.script.hingeConstraint.createConstraint(), this.entity.parent.script.hingeConstraint.enabled = !0
    }))
}, CompoundConstraint.prototype.update = function(t) {};
var SpringTimer = pc.createScript("springTimer");
SpringTimer.prototype.postInitialize = function() {
    this.done = !1
}, SpringTimer.prototype.postUpdate = function(t) {
    this.done || (this.done = !0, this.entity.rigidbody.enabled = !0, this.entity.script.hingeConstraint && this.entity.script.hingeConstraint.createConstraint(), this.entity.script.pointToPointConstraint && this.entity.script.pointToPointConstraint.createConstraint())
};
var SpringTest = pc.createScript("springTest");
SpringTest.prototype.postInitialize = function() {
    this.done = !1
}, SpringTest.prototype.postUpdate = function(t) {
    this.done || (this.done = !0, this.entity.script.springJoint.enabled = !0, this.entity.script.springJoint.createConstraint())
};
var SpawnTemplate = pc.createScript("spawnTemplate");
SpawnTemplate.attributes.add("template", {
    type: "asset",
    assetType: "template"
}), SpawnTemplate.prototype.initialize = function() {
    setInterval((() => {
        let t = this.template.resource.instantiate();
        doStuffToEntity(this.template.resource._templateRoot, t), t.setPosition(.976, -2.65, 0), this.app.root.addChild(t), setTimeout((() => {
            t.destroy()
        }), 250)
    }), 1e3)
}, SpawnTemplate.prototype.postInitialize = function(t) {}, SpawnTemplate.prototype.postUpdate = function(t) {};
var Contactpoint = pc.createScript("contactpoint");
Contactpoint.attributes.add("contactProcessingThreshold", {
    type: "number",
    default: 1e-6,
    title: "Contact Processing Threshold",
    description: 'This should be below the half extent of the collision volume. E.g For an object of dimensions 1 meter, try 0.2 the constraint solver can discard solving contacts, if the distance is above this threshold. 0 by default. \n Note that using contacts with positive distance can improve stability. It increases, however, the chance of colliding with degerate contacts, such as "interior" triangle edges'
}), Contactpoint.prototype.initialize = function() {
    this.entity.rigidbody.body.setContactProcessingThreshold(this.contactProcessingThreshold), this.on("attr:contactProcessingThreshold", (function(t, o) {
        this.entity.rigidbody.body.setContactProcessingThreshold(t)
    }))
}, Contactpoint.prototype.update = function(t) {};
var Blink = pc.createScript("blink");
Blink.prototype.initialize = function() {
    setInterval((() => {
        this.entity.enabled = !1, this.entity.enabled = !0
    }), 500)
}, Blink.prototype.update = function(t) {};
var Rocket = pc.createScript("rocket");
Rocket.attributes.add("particles", {
    title: "Particles",
    type: "entity"
}), Rocket.attributes.add("power", {
    title: "Power",
    type: "number",
    default: 2
}), Rocket.attributes.add("maxPower", {
    title: "MaxPower",
    type: "number",
    default: 40
}), Rocket.attributes.add("otherCollider", {
    type: "entity",
    default: 40
}), Rocket.prototype.initialize = function() {
    this.rb = this.entity.rigidbody, this.activated = !1, this.entity.collision.on("collisionstart", (t => {
        this.activate(t)
    }), this), this.otherCollider && this.otherCollider.collision.on("collisionstart", (t => {
        this.activate(t)
    }), this)
}, Rocket.prototype.activate = function(t) {
    !this.activated && t.other.tags._list.includes("Segment") && (this.activated = !0, this.particles.particlesystem.play())
}, Rocket.prototype.update = function(t) {
    this.activated && (this.rb.linearVelocity = this.entity.up.mulScalar(this.power), this.power < this.maxPower && (this.power *= 1.05))
};
var DelayActivation = pc.createScript("delayActivation");
DelayActivation.prototype.initialize = function() {}, DelayActivation.prototype.update = function(t) {};
var SpringRenderer = pc.createScript("springRenderer");
SpringRenderer.attributes.add("springEntity", {
    type: "entity"
}), SpringRenderer.prototype.initialize = function() {
    null != this.springEntity ? (this.springJoint = this.springEntity.script.springJoint, null == this.springJoint && (this.springJoint = this.springEntity.script.spring)) : (this.springJoint = this.entity.script.springJoint, null == this.springJoint && (this.springJoint = this.entity.script.spring)), this.spriteRenderer = this.entity.children[0].sprite, null != this.springJoint && (this.scaleX = this.entity.getLocalScale().x, this.scaleY = this.entity.getLocalScale().y, this.width = this.entity.children[0].sprite.width, this.connectedTranform = this.springJoint.entityB)
}, SpringRenderer.prototype.updateSprite = function() {
    if (null == this.connectedTranform || null == this.spriteRenderer) return;
    new pc.Vec3(0, (this.entity.getLocalPosition().y + this.connectedTranform.getLocalPosition().y) / 2, 0);
    this.size = new pc.Vec2(this.spriteRenderer.width, this.spriteRenderer.height), this.size.x = this.entity.getPosition().sub(this.connectedTranform.getPosition()), this.entity.setLocalScale(this.scaleX, Math.abs(this.entity.getPosition().sub(this.connectedTranform.getPosition()).length()) / this.width / this.entity.parent.getScale().y, 1), this.spriteRenderer.height = this.size.y;
    let t = this.entity.getPosition().sub(this.connectedTranform.getPosition());
    this.entity.setRotation((new pc.Quat).setFromEulerAngles(new pc.Vec3(0, 0, Math.atan2(t.y, t.x) * (180 / Math.PI) + 90)))
}, SpringRenderer.prototype.update = function(t) {
    this.updateSprite()
};
var BoxeGlove = pc.createScript("boxeGlove");
BoxeGlove.attributes.add("force", {
    type: "number",
    default: 30
}), BoxeGlove.attributes.add("collide", {
    type: "entity"
}), BoxeGlove.prototype.initialize = function() {
    this.waitingLaunch = !1, this.rb = this.entity.rigidbody, this.collide.collision.on("triggerenter", (t => {
        !this.waitingLaunch && t.tags._list.includes("Segment") && this.launch()
    }), this)
}, BoxeGlove.prototype.launch = function() {
    this.entity.getRotation().getEulerAngles();
    let t = (new pc.Vec3).copy(this.entity.up).mulScalar(2 * this.force),
        e = (new pc.Vec3).copy(this.entity.up).mulScalar(this.force);
    e.y = -e.y, GameManager.instance.playerController.dash(e), GameManager.instance.playerController.unstick(), this.rb.applyImpulse(t.x, t.y, t.z), this.waitingLaunch = !0, setTimeout((() => {
        this.waitingLaunch = !1
    }), 500)
}, BoxeGlove.prototype.update = function(t) {};
var SetFriction = pc.createScript("setFriction");
SetFriction.prototype.initialize = function() {
    console.log(this.entity.rigidbody.friction = 0)
}, SetFriction.prototype.update = function(t) {};
var SpringJointPivot = pc.createScript("springJointPivot");
SpringJointPivot.prototype.initialize = function() {
    this.spring = this.entity.script.springJoint, console.log(), this.connectedTo = this.spring.entityB, this.spring.pivotA = this.entity.getPosition().sub(this.connectedTo.getPosition()).mulScalar(-1), this.spring.createConstraint(), console.log("Offset", this.entity.getPosition().sub(this.connectedTo.getPosition()).mulScalar(-1))
}, SpringJointPivot.prototype.update = function(t) {};
var PrintRotation = pc.createScript("printRotation");
PrintRotation.prototype.initialize = function() {}, PrintRotation.prototype.update = function(t) {};
var Flash = pc.createScript("flash");
Flash.prototype.initialize = function() {}, Flash.prototype.update = function(t) {};
pc.extend(pc, function() {
        var TweenManager = function(t) {
            this._app = t, this._tweens = [], this._add = []
        };
        TweenManager.prototype = {
            add: function(t) {
                return this._add.push(t), t
            },
            setTs: function(t) {
                return this.ts = t, this.ts
            },
            update: function(t) {
                for (var i = 0, e = this._tweens.length; i < e;) this._tweens[i].update(t, this.ts) ? i++ : (this._tweens.splice(i, 1), e--);
                if (this._add.length) {
                    for (let t = 0; t < this._add.length; t++) this._tweens.indexOf(this._add[t]) > -1 || this._tweens.push(this._add[t]);
                    this._add.length = 0
                }
            }
        };
        var Tween = function(t, i, e) {
                pc.events.attach(this), this.manager = i, e && (this.entity = null), this.time = 0, this.complete = !1, this.playing = !1, this.stopped = !0, this.pending = !1, this.target = t, this.duration = 0, this._currentDelay = 0, this.timeScale = 1, this.test = 10, this._reverse = !1, this._delay = 0, this._yoyo = !1, this._count = 0, this._numRepeats = 0, this._repeatDelay = 0, this._from = !1, this._slerp = !1, this._fromQuat = new pc.Quat, this._toQuat = new pc.Quat, this._quat = new pc.Quat, this.easing = pc.Linear, this._sv = {}, this._ev = {}
            },
            _parseProperties = function(t) {
                var i;
                return t instanceof pc.Vec2 ? i = {
                    x: t.x,
                    y: t.y
                } : t instanceof pc.Vec3 ? i = {
                    x: t.x,
                    y: t.y,
                    z: t.z
                } : t instanceof pc.Vec4 || t instanceof pc.Quat ? i = {
                    x: t.x,
                    y: t.y,
                    z: t.z,
                    w: t.w
                } : t instanceof pc.Color ? (i = {
                    r: t.r,
                    g: t.g,
                    b: t.b
                }, void 0 !== t.a && (i.a = t.a)) : i = t, i
            };
        Tween.prototype = {
            to: function(t, i, e, s, n, r) {
                return this._properties = _parseProperties(t), this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this
            },
            from: function(t, i, e, s, n, r) {
                return this._properties = _parseProperties(t), this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this._from = !0, this
            },
            rotate: function(t, i, e, s, n, r) {
                return this._properties = _parseProperties(t), this.duration = i, e && (this.easing = e), s && this.delay(s), n && this.repeat(n), r && this.yoyo(r), this._slerp = !0, this
            },
            start: function() {
                var t, i, e, s;
                if (this.playing = !0, this.complete = !1, this.stopped = !1, this._count = 0, this.pending = this._delay > 0, this._reverse && !this.pending ? this.time = this.duration : this.time = 0, this._from) {
                    for (t in this._properties) this._properties.hasOwnProperty(t) && (this._sv[t] = this._properties[t], this._ev[t] = this.target[t]);
                    this._slerp && (this._toQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z), i = void 0 !== this._properties.x ? this._properties.x : this.target.x, e = void 0 !== this._properties.y ? this._properties.y : this.target.y, s = void 0 !== this._properties.z ? this._properties.z : this.target.z, this._fromQuat.setFromEulerAngles(i, e, s))
                } else {
                    for (t in this._properties) this._properties.hasOwnProperty(t) && (this._sv[t] = this.target[t], this._ev[t] = this._properties[t]);
                    this._slerp && (i = void 0 !== this._properties.x ? this._properties.x : this.target.x, e = void 0 !== this._properties.y ? this._properties.y : this.target.y, s = void 0 !== this._properties.z ? this._properties.z : this.target.z, void 0 !== this._properties.w ? (this._fromQuat.copy(this.target), this._toQuat.set(i, e, s, this._properties.w)) : (this._fromQuat.setFromEulerAngles(this.target.x, this.target.y, this.target.z), this._toQuat.setFromEulerAngles(i, e, s)))
                }
                return this._currentDelay = this._delay, this.manager.add(this), this
            },
            pause: function() {
                this.playing = !1
            },
            resume: function() {
                this.playing = !0
            },
            stop: function() {
                this.playing = !1, this.stopped = !0
            },
            delay: function(t) {
                return this._delay = t, this.pending = !0, this
            },
            repeat: function(t, i) {
                return this._count = 0, this._numRepeats = t, this._repeatDelay = i || 0, this
            },
            loop: function(t) {
                return t ? (this._count = 0, this._numRepeats = 1 / 0) : this._numRepeats = 0, this
            },
            yoyo: function(t) {
                return this._yoyo = t, this
            },
            reverse: function() {
                return this._reverse = !this._reverse, this
            },
            chain: function() {
                for (var t = arguments.length; t--;) t > 0 ? arguments[t - 1]._chained = arguments[t] : this._chained = arguments[t];
                return this
            },
            update: function(t, i) {
                let e = this.timeScale;
                if (i && (e = i), this.stopped) return !1;
                if (!this.playing) return !0;
                if (!this._reverse || this.pending ? this.time += t * e : this.time -= t * e, this.pending) {
                    if (!(this.time > this._currentDelay)) return !0;
                    this._reverse ? this.time = this.duration - (this.time - this._currentDelay) : this.time -= this._currentDelay, this.pending = !1
                }
                var s = 0;
                (!this._reverse && this.time > this.duration || this._reverse && this.time < 0) && (this._count++, this.complete = !0, this.playing = !1, this._reverse ? (s = this.duration - this.time, this.time = 0) : (s = this.time - this.duration, this.time = this.duration));
                var n, r, h = 0 === this.duration ? 1 : this.time / this.duration,
                    a = this.easing(h);
                for (var o in this._properties) this._properties.hasOwnProperty(o) && (n = this._sv[o], r = this._ev[o], this.target[o] = n + (r - n) * a);
                if (this._slerp && this._quat.slerp(this._fromQuat, this._toQuat, a), this.entity && (this.entity._dirtifyLocal(), this.element && this.entity.element && (this.entity.element[this.element] = this.target), this._slerp && this.entity.setLocalRotation(this._quat)), this.fire("update", t), this.complete) {
                    var u = this._repeat(s);
                    return u ? this.fire("loop") : (this.fire("complete", s), this.entity && this.entity.off("destroy", this.stop, this), this._chained && this._chained.start()), u
                }
                return !0
            },
            _repeat: function(t) {
                if (this._count < this._numRepeats) {
                    if (this._reverse ? this.time = this.duration - t : this.time = t, this.complete = !1, this.playing = !0, this._currentDelay = this._repeatDelay, this.pending = !0, this._yoyo) {
                        for (var i in this._properties) {
                            var e = this._sv[i];
                            this._sv[i] = this._ev[i], this._ev[i] = e
                        }
                        this._slerp && (this._quat.copy(this._fromQuat), this._fromQuat.copy(this._toQuat), this._toQuat.copy(this._quat))
                    }
                    return !0
                }
                return !1
            }
        };
        var BounceOut = function(t) {
                return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
            },
            BounceIn = function(t) {
                return 1 - BounceOut(1 - t)
            };
        return {
            TweenManager: TweenManager,
            Tween: Tween,
            Linear: function(t) {
                return t
            },
            QuadraticIn: function(t) {
                return t * t
            },
            QuadraticOut: function(t) {
                return t * (2 - t)
            },
            QuadraticInOut: function(t) {
                return (t *= 2) < 1 ? .5 * t * t : -.5 * (--t * (t - 2) - 1)
            },
            CubicIn: function(t) {
                return t * t * t
            },
            CubicOut: function(t) {
                return --t * t * t + 1
            },
            CubicInOut: function(t) {
                return (t *= 2) < 1 ? .5 * t * t * t : .5 * ((t -= 2) * t * t + 2)
            },
            QuarticIn: function(t) {
                return t * t * t * t
            },
            QuarticOut: function(t) {
                return 1 - --t * t * t * t
            },
            QuarticInOut: function(t) {
                return (t *= 2) < 1 ? .5 * t * t * t * t : -.5 * ((t -= 2) * t * t * t - 2)
            },
            QuinticIn: function(t) {
                return t * t * t * t * t
            },
            QuinticOut: function(t) {
                return --t * t * t * t * t + 1
            },
            QuinticInOut: function(t) {
                return (t *= 2) < 1 ? .5 * t * t * t * t * t : .5 * ((t -= 2) * t * t * t * t + 2)
            },
            SineIn: function(t) {
                return 0 === t ? 0 : 1 === t ? 1 : 1 - Math.cos(t * Math.PI / 2)
            },
            SineOut: function(t) {
                return 0 === t ? 0 : 1 === t ? 1 : Math.sin(t * Math.PI / 2)
            },
            SineInOut: function(t) {
                return 0 === t ? 0 : 1 === t ? 1 : .5 * (1 - Math.cos(Math.PI * t))
            },
            ExponentialIn: function(t) {
                return 0 === t ? 0 : Math.pow(1024, t - 1)
            },
            ExponentialOut: function(t) {
                return 1 === t ? 1 : 1 - Math.pow(2, -10 * t)
            },
            ExponentialInOut: function(t) {
                return 0 === t ? 0 : 1 === t ? 1 : (t *= 2) < 1 ? .5 * Math.pow(1024, t - 1) : .5 * (2 - Math.pow(2, -10 * (t - 1)))
            },
            CircularIn: function(t) {
                return 1 - Math.sqrt(1 - t * t)
            },
            CircularOut: function(t) {
                return Math.sqrt(1 - --t * t)
            },
            CircularInOut: function(t) {
                return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
            },
            BackIn: function(t) {
                var i = 1.70158;
                return t * t * ((i + 1) * t - i)
            },
            BackOut: function(t) {
                var i = 1.70158;
                return --t * t * ((i + 1) * t + i) + 1
            },
            BackInOut: function(t) {
                var i = 2.5949095;
                return (t *= 2) < 1 ? t * t * ((i + 1) * t - i) * .5 : .5 * ((t -= 2) * t * ((i + 1) * t + i) + 2)
            },
            BounceIn: BounceIn,
            BounceOut: BounceOut,
            BounceInOut: function(t) {
                return t < .5 ? .5 * BounceIn(2 * t) : .5 * BounceOut(2 * t - 1) + .5
            },
            ElasticIn: function(t) {
                var i, e = .1;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = .4 * Math.asin(1 / e) / (2 * Math.PI), -e * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / .4))
            },
            ElasticOut: function(t) {
                var i, e = .1;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = .4 * Math.asin(1 / e) / (2 * Math.PI), e * Math.pow(2, -10 * t) * Math.sin((t - i) * (2 * Math.PI) / .4) + 1)
            },
            ElasticInOut: function(t) {
                var i, e = .1,
                    s = .4;
                return 0 === t ? 0 : 1 === t ? 1 : (!e || e < 1 ? (e = 1, i = .1) : i = s * Math.asin(1 / e) / (2 * Math.PI), (t *= 2) < 1 ? e * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / s) * -.5 : e * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - i) * (2 * Math.PI) / s) * .5 + 1)
            }
        }
    }()),
    function() {
        pc.Application.prototype.addTweenManager = function() {
            this._tweenManager = new pc.TweenManager(this), this.on("update", (function(t) {
                this._tweenManager.update(t)
            }))
        }, pc.Application.prototype.tween = function(t) {
            return new pc.Tween(t, this._tweenManager)
        }, pc.Entity.prototype.tween = function(t, i) {
            var e = this._app.tween(t);
            return e.entity = this, this.once("destroy", e.stop, e), i && i.element && (e.element = i.element), e
        };
        var t = pc.Application.getApplication();
        t && t.addTweenManager()
    }();
"undefined" != typeof document && (
    /*! FPSMeter 0.3.1 - 9th May 2013 | https://github.com/Darsain/fpsmeter */
    function(t, e) {
        function s(t, e) {
            for (var n in e) try {
                t.style[n] = e[n]
            } catch (t) {}
            return t
        }

        function H(t) {
            return null == t ? String(t) : "object" == typeof t || "function" == typeof t ? Object.prototype.toString.call(t).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof t
        }

        function R(t, e) {
            if ("array" !== H(e)) return -1;
            if (e.indexOf) return e.indexOf(t);
            for (var n = 0, o = e.length; n < o; n++)
                if (e[n] === t) return n;
            return -1
        }

        function I() {
            var t, e = arguments;
            for (t in e[1])
                if (e[1].hasOwnProperty(t)) switch (H(e[1][t])) {
                    case "object":
                        e[0][t] = I({}, e[0][t], e[1][t]);
                        break;
                    case "array":
                        e[0][t] = e[1][t].slice(0);
                        break;
                    default:
                        e[0][t] = e[1][t]
                }
            return 2 < e.length ? I.apply(null, [e[0]].concat(Array.prototype.slice.call(e, 2))) : e[0]
        }

        function N(t) {
            return 1 === (t = Math.round(255 * t).toString(16)).length ? "0" + t : t
        }

        function S(t, e, n, o) {
            t.addEventListener ? t[o ? "removeEventListener" : "addEventListener"](e, n, !1) : t.attachEvent && t[o ? "detachEvent" : "attachEvent"]("on" + e, n)
        }

        function D(t, e) {
            function g(t, e, n, o) {
                return h[0 | t][Math.round(Math.min((e - n) / (o - n) * M, M))]
            }

            function r() {
                F.legend.fps !== q && (F.legend.fps = q, F.legend[c] = q ? "FPS" : "ms"), b = q ? v.fps : v.duration, F.count[c] = 999 < b ? "999+" : b.toFixed(99 < b ? 0 : O.decimals)
            }

            function m() {
                for (l = n(), P < l - O.threshold && (v.fps -= v.fps / Math.max(1, 60 * O.smoothing / O.interval), v.duration = 1e3 / v.fps), w = O.history; w--;) T[w] = 0 === w ? v.fps : T[w - 1], j[w] = 0 === w ? v.duration : j[w - 1];
                if (r(), O.heat) {
                    if (z.length)
                        for (w = z.length; w--;) z[w].el.style[o[z[w].name].heatOn] = q ? g(o[z[w].name].heatmap, v.fps, 0, O.maxFps) : g(o[z[w].name].heatmap, v.duration, O.threshold, 0);
                    if (F.graph && o.column.heatOn)
                        for (w = C.length; w--;) C[w].style[o.column.heatOn] = q ? g(o.column.heatmap, T[w], 0, O.maxFps) : g(o.column.heatmap, j[w], O.threshold, 0)
                }
                if (F.graph)
                    for (y = 0; y < O.history; y++) C[y].style.height = (q ? T[y] ? Math.round(x / O.maxFps * Math.min(T[y], O.maxFps)) : 0 : j[y] ? Math.round(x / O.threshold * Math.min(j[y], O.threshold)) : 0) + "px"
            }

            function k() {
                20 > O.interval ? (p = i(k), m()) : (p = setTimeout(k, O.interval), f = i(m))
            }

            function G(t) {
                (t = t || window.event).preventDefault ? (t.preventDefault(), t.stopPropagation()) : (t.returnValue = !1, t.cancelBubble = !0), v.toggle()
            }

            function U() {
                O.toggleOn && S(F.container, O.toggleOn, G, 1), t.removeChild(F.container)
            }

            function V() {
                if (F.container && U(), o = D.theme[O.theme], !(h = o.compiledHeatmaps || []).length && o.heatmaps.length) {
                    for (y = 0; y < o.heatmaps.length; y++)
                        for (h[y] = [], w = 0; w <= M; w++) {
                            var e, n = h[y],
                                a = w;
                            e = .33 / M * w;
                            var i = o.heatmaps[y].saturation,
                                l = o.heatmaps[y].lightness,
                                p = void 0,
                                c = void 0,
                                u = void 0,
                                d = u = void 0,
                                f = p = c = void 0;
                            f = void 0;
                            0 === (u = .5 >= l ? l * (1 + i) : l + i - l * i) ? e = "#000" : (c = (u - (d = 2 * l - u)) / u, f = (e *= 6) - (p = Math.floor(e)), f *= u * c, 0 === p || 6 === p ? (p = u, c = d + f, u = d) : 1 === p ? (p = u - f, c = u, u = d) : 2 === p ? (p = d, c = u, u = d + f) : 3 === p ? (p = d, c = u - f) : 4 === p ? (p = d + f, c = d) : (p = u, c = d, u -= f), e = "#" + N(p) + N(c) + N(u)), n[a] = e
                        }
                    o.compiledHeatmaps = h
                }
                for (var b in F.container = s(document.createElement("div"), o.container), F.count = F.container.appendChild(s(document.createElement("div"), o.count)), F.legend = F.container.appendChild(s(document.createElement("div"), o.legend)), F.graph = O.graph ? F.container.appendChild(s(document.createElement("div"), o.graph)) : 0, z.length = 0, F) F[b] && o[b].heatOn && z.push({
                    name: b,
                    el: F[b]
                });
                if (C.length = 0, F.graph)
                    for (F.graph.style.width = O.history * o.column.width + (O.history - 1) * o.column.spacing + "px", w = 0; w < O.history; w++) C[w] = F.graph.appendChild(s(document.createElement("div"), o.column)), C[w].style.position = "absolute", C[w].style.bottom = 0, C[w].style.right = w * o.column.width + w * o.column.spacing + "px", C[w].style.width = o.column.width + "px", C[w].style.height = "0px";
                s(F.container, O), r(), t.appendChild(F.container), F.graph && (x = F.graph.clientHeight), O.toggleOn && ("click" === O.toggleOn && (F.container.style.cursor = "pointer"), S(F.container, O.toggleOn, G))
            }
            "object" === H(t) && undefined === t.nodeType && (e = t, t = document.body), t || (t = document.body);
            var o, h, l, p, f, x, b, w, y, v = this,
                O = I({}, D.defaults, e || {}),
                F = {},
                C = [],
                M = 100,
                z = [],
                E = O.threshold,
                A = 0,
                P = n() - E,
                T = [],
                j = [],
                q = "fps" === O.show;
            v.options = O, v.fps = 0, v.duration = 0, v.isPaused = 0, v.tickStart = function() {
                A = n()
            }, v.tick = function() {
                l = n(), E += (l - P - E) / O.smoothing, v.fps = 1e3 / E, v.duration = A < P ? E : l - A, P = l
            }, v.pause = function() {
                return p && (v.isPaused = 1, clearTimeout(p), a(p), a(f), p = f = 0), v
            }, v.resume = function() {
                return p || (v.isPaused = 0, k()), v
            }, v.set = function(t, e) {
                return O[t] = e, q = "fps" === O.show, -1 !== R(t, u) && V(), -1 !== R(t, d) && s(F.container, O), v
            }, v.showDuration = function() {
                return v.set("show", "ms"), v
            }, v.showFps = function() {
                return v.set("show", "fps"), v
            }, v.toggle = function() {
                return v.set("show", q ? "ms" : "fps"), v
            }, v.hide = function() {
                return v.pause(), F.container.style.display = "none", v
            }, v.show = function() {
                return v.resume(), F.container.style.display = "block", v
            }, v.destroy = function() {
                v.pause(), U(), v.tick = v.tickStart = function() {}
            }, V(), k()
        }
        var n, o = t.performance;
        n = o && (o.now || o.webkitNow) ? o[o.now ? "now" : "webkitNow"].bind(o) : function() {
            return +new Date
        };
        for (var a = t.cancelAnimationFrame || t.cancelRequestAnimationFrame, i = t.requestAnimationFrame, h = 0, l = 0, p = (o = ["moz", "webkit", "o"]).length; l < p && !a; ++l) i = (a = t[o[l] + "CancelAnimationFrame"] || t[o[l] + "CancelRequestAnimationFrame"]) && t[o[l] + "RequestAnimationFrame"];
        a || (i = function(e) {
            var o = n(),
                a = Math.max(0, 16 - (o - h));
            return h = o + a, t.setTimeout((function() {
                e(o + a)
            }), a)
        }, a = function(t) {
            clearTimeout(t)
        });
        var c = "string" === H(document.createElement("div").textContent) ? "textContent" : "innerText";
        D.extend = I, window.FPSMeter = D, D.defaults = {
            interval: 100,
            smoothing: 10,
            show: "fps",
            toggleOn: "click",
            decimals: 1,
            maxFps: 60,
            threshold: 100,
            position: "absolute",
            zIndex: 10,
            left: "5px",
            top: "5px",
            right: "auto",
            bottom: "auto",
            margin: "0 0 0 0",
            theme: "dark",
            heat: 0,
            graph: 0,
            history: 20
        };
        var u = ["toggleOn", "theme", "heat", "graph", "history"],
            d = "position zIndex left top right bottom margin".split(" ")
    }(window),
    function(t, e) {
        e.theme = {};
        var n = e.theme.base = {
            heatmaps: [],
            container: {
                heatOn: null,
                heatmap: null,
                padding: "5px",
                minWidth: "95px",
                height: "30px",
                lineHeight: "30px",
                textAlign: "right",
                textShadow: "none"
            },
            count: {
                heatOn: null,
                heatmap: null,
                position: "absolute",
                top: 0,
                right: 0,
                padding: "5px 10px",
                height: "30px",
                fontSize: "24px",
                fontFamily: "Consolas, Andale Mono, monospace",
                zIndex: 2
            },
            legend: {
                heatOn: null,
                heatmap: null,
                position: "absolute",
                top: 0,
                left: 0,
                padding: "5px 10px",
                height: "30px",
                fontSize: "12px",
                lineHeight: "32px",
                fontFamily: "sans-serif",
                textAlign: "left",
                zIndex: 2
            },
            graph: {
                heatOn: null,
                heatmap: null,
                position: "relative",
                boxSizing: "padding-box",
                MozBoxSizing: "padding-box",
                height: "100%",
                zIndex: 1
            },
            column: {
                width: 4,
                spacing: 1,
                heatOn: null,
                heatmap: null
            }
        };
        e.theme.dark = e.extend({}, n, {
            heatmaps: [{
                saturation: .8,
                lightness: .8
            }],
            container: {
                background: "#222",
                color: "#fff",
                border: "1px solid #1a1a1a",
                textShadow: "1px 1px 0 #222"
            },
            count: {
                heatOn: "color"
            },
            column: {
                background: "#3f3f3f"
            }
        }), e.theme.light = e.extend({}, n, {
            heatmaps: [{
                saturation: .5,
                lightness: .5
            }],
            container: {
                color: "#666",
                background: "#fff",
                textShadow: "1px 1px 0 rgba(255,255,255,.5), -1px -1px 0 rgba(255,255,255,.5)",
                boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
            },
            count: {
                heatOn: "color"
            },
            column: {
                background: "#eaeaea"
            }
        }), e.theme.colorful = e.extend({}, n, {
            heatmaps: [{
                saturation: .5,
                lightness: .6
            }],
            container: {
                heatOn: "backgroundColor",
                background: "#888",
                color: "#fff",
                textShadow: "1px 1px 0 rgba(0,0,0,.2)",
                boxShadow: "0 0 0 1px rgba(0,0,0,.1)"
            },
            column: {
                background: "#777",
                backgroundColor: "rgba(0,0,0,.2)"
            }
        }), e.theme.transparent = e.extend({}, n, {
            heatmaps: [{
                saturation: .8,
                lightness: .5
            }],
            container: {
                padding: 0,
                color: "#fff",
                textShadow: "1px 1px 0 rgba(0,0,0,.5)"
            },
            count: {
                padding: "0 5px",
                height: "40px",
                lineHeight: "40px"
            },
            legend: {
                padding: "0 5px",
                height: "40px",
                lineHeight: "42px"
            },
            graph: {
                height: "40px"
            },
            column: {
                width: 5,
                background: "#999",
                heatOn: "backgroundColor",
                opacity: .5
            }
        })
    }(window, FPSMeter));
var Fps = pc.createScript("fps");
Fps.prototype.initialize = function() {
    this.fps = new FPSMeter({
        heat: !0,
        graph: !0
    })
}, Fps.prototype.update = function(t) {
    this.fps.tick()
};
pc.script.createLoadingScreen((function(A) {
  
    
    try {
   
    } catch (A) {
        console.error("Adblock enabled"), adblockEnabled = !0
    }
  window.addEventListener("keydown", (A => {
        ["ArrowDown", "ArrowUp", " "].includes(A.key) && A.preventDefault()
    })), window.addEventListener("wheel", (A => A.preventDefault()), {
        passive: !1
    });
    var g, C;
    g = ["body {", "    background-color: #000000;", "}", "", "#application-splash-wrapper {", "    position: absolute;", "    top: 0;", "    left: 0;", "    height: 100%;", "    width: 100%;", "    background-color: #000000;", "}", "", "#application-splash {", "    position: absolute;", "    top: calc(50% - -150px);", "    width: 264px;", "    left: calc(50% - 132px);", "}", "", "", "#progress-bar-container {", "    margin: 20px auto 0 auto;", "display: inline;", "    height: 2px;", "    width: 100%;", "}", "", "#progress-bar {", "    width: 0%;", "    height: 48.9px;", "    background:linear-gradient(90deg, rgba(227,54,129,1) 0%, rgba(244,192,60,1) 100%);", "     display: flex;", " position: absolute;", " order: 0;", "left: -27px;", "top: 0px;", "}", "#logo {", "position: relative;", "width: 100%;", "height: 100%;", "left: -10%;", "top: 50%;", "}", "#mask {", "position: fixed;", "width: 10%;", "height: 10%;", "left: 331px;", "top: 45%;", "}", "#cross {", "position: absolute;", "top: -0.321px;", "left: 237px;", "height: 50px;", "width: auto;", "}", "#title {", "             position: absolute;", " transform-origin: center center;", " top: 10%;", " width: 500px;", " left: calc(50% - 243px);", "}", "@keyframes slide-in {", "0% {", "transform:  rotate(0deg);", "}", "100% {", "transform:  rotate(360deg);", "}", "}", "@keyframes gradientAnim {", "0% {", "transform:  rotate(0deg);", "}", "100% {", "transform:  rotate(360deg);", "}", "}"].join("\n"), (C = document.createElement("style")).type = "text/css", C.styleSheet ? C.styleSheet.cssText = g : C.appendChild(document.createTextNode(g)), document.head.appendChild(C),
        function() {
            var A = document.createElement("div");
            A.id = "application-splash-wrapper", A.src = "data:image/png;base64,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", document.body.appendChild(A);
            var g = document.createElement("div");
            g.id = "application-splash", A.appendChild(g), g.style.display = "none";
            var C = document.createElement("div");
            C.id = "progress-bar-container", g.appendChild(C);
            var I = document.createElement("div");
            I.id = "progress-bar", C.appendChild(I);
            var B = document.createElement("img");
            B.src = "data:image/png;base64,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qoqNKjZXHUt4ULgrYdmS758rcULxpmIrnTPLdaoOAyv27IzSZXcywSTTRNEwyLFGmixhOW1RXGJyH6nh7yj6o+IyxLWGKY4x1rHQi37UH/yerZsc6C8lBSLQ8OJ5H93QuAuFHc/7Pva8wgnUPcOVXfGv52H4U/SditZ1BK1bcHFd0Yw9uNyG9qeM7uhFqU62P5mE9zP5pnkI3kLzYmlu5XtOHyAus5q6gYND6ElJ9lKNvpuq5/bvm/L8fgBDjHKU3NY3PgAADRhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOkdJTVA9Imh0dHA6Ly93d3cuZ2ltcC5vcmcveG1wLyIKICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICB4bXBNTTpEb2N1bWVudElEPSJnaW1wOmRvY2lkOmdpbXA6MmEwN2M3NzctM2E3My00YzgwLTg2NjgtMWZiZDU3ZmIwZGMzIgogICB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmY1ZDE4MWI4LTRjMTMtNDJiZC1iZDAwLTc4ZDIwYzQxZjMxZiIKICAgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmQwZTVlMjlmLWI5ODgtNDRkOC05NGRkLTRmZjAxZWVjMzA2ZCIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iV2luZG93cyIKICAgR0lNUDpUaW1lU3RhbXA9IjE2NzE0OTAzMTMwOTA2MTgiCiAgIEdJTVA6VmVyc2lvbj0iMi4xMC4zMCIKICAgZGM6Rm9ybWF0PSJpbWFnZS9wbmciCiAgIHRpZmY6T3JpZW50YXRpb249IjEiCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIj4KICAgPHhtcE1NOkhpc3Rvcnk+CiAgICA8cmRmOlNlcT4KICAgICA8cmRmOmxpCiAgICAgIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiCiAgICAgIHN0RXZ0OmNoYW5nZWQ9Ii8iCiAgICAgIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTA2MTNhNWItZmZiOC00ZWQzLWFjOWEtZWY1NTIzNmEzMTMzIgogICAgICBzdEV2dDpzb2Z0d2FyZUFnZW50PSJHaW1wIDIuMTAgKFdpbmRvd3MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIyLTEyLTE5VDIzOjUxOjUzIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PuBkFgsAAAAGYktHRAD/AAAAADMnfPMAAAAJcEhZcwAADdcAAA3XAUIom3gA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", B.id = "cross", C.appendChild(B), B.onload = function() {
                g.style.display = "inline"
            };
            var w = document.createElement("img");
            w.src = "data:image/png;base64,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Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAtRXhpdjIiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo0NWE4NzQ3Yi0wNmZhLTQ2ODktYmM0NC0yODI2Mzc0MDg3NGEiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjcwMzMyZGYtZTE4OC00MjM2LWJkY2QtNjczOWI5YTdhZDk2IgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmE5YWJkMTMtNjQyNC00YjlkLTg5NTAtNDhkNGU2Mjg5YjE0IgogICBHSU1QOkFQST0iMi4wIgogICBHSU1QOlBsYXRmb3JtPSJXaW5kb3dzIgogICBHSU1QOlRpbWVTdGFtcD0iMTY3MTQ4MzY0MzAyOTgwMSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjMwIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiMGM2NDZjZS1iNjk1LTRiYWMtYmU3Zi0xNTI5YThhNDU1ZjYiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjItMTItMTlUMjI6MDA6NDMiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+5rPr6wAAAAZiS0dEAKwADgDXXr2jlQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+YMExUAKkrD7wIAACAASURBVHja7N3pbuVIjgZQ2fD7v7L6h8udXu4mKRYyeA7QGAxmGlWpKwXJiE/Kt23b9g0AAAAAAAAAAAAAoKN3lwAAAAAAAAAAAAAA6O3DJQAAAAAAAAAAAAC2bXtL+u+9++kgzyLjgQUAAAAAAAAAAIC1vLkED8lOwqSFycMHAAAAAAAAAAAAeQgljyNjCY0XLw8VAAAAAAAAAAAAxCKcHJ/8JZxY2Dw4AAAAAAAAAAAAMIeA8nrkMuHB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", w.id = "logo", C.appendChild(w), w.onload = function() {
                g.style.display = "inline"
            };
            var D = document.createElement("img");
            D.src = "data:image/png;base64,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", D.id = "title", A.appendChild(D)
        }(), A.on("preload:end", (function() {
            A.off("preload:progress")
        })), A.on("preload:progress", (function(A) {
            var g = document.getElementById("progress-bar");
            g && (A = Math.min(1, Math.max(0, A)), g.style.width = 118.5 * A + "%")
        })), A.on("start", (function() {
            var A = document.getElementById("application-splash-wrapper");
            A.parentElement.removeChild(A)
        }))
}));
var SetAngularFactor = pc.createScript("setAngularFactor");
SetAngularFactor.prototype.initialize = function() {
    this.entity.rigidbody.body.setAngularFactor(new Ammo.btVector3(0, 0, 1))
}, SetAngularFactor.prototype.update = function(t) {};
var Parallax = pc.createScript("parallax");
Parallax.attributes.add("horizontalSpeed", {
    type: "number"
}), Parallax.attributes.add("verticalSpeed", {
    type: "number"
}), Parallax.prototype.initialize = function() {}, Parallax.prototype.update = function(a) {
    if (CameraManager.instance.enabled) {
        let a = CameraManager.instance.entity.getPosition();
        this.entity.getPosition();
        this.entity.setPosition(-a.x * this.horizontalSpeed, -a.y - this.verticalSpeed, 0)
    }
};
var MaterialSet = pc.createScript("materialSet");
MaterialSet.prototype.initialize = function() {}, MaterialSet.prototype.update = function(t) {};
var SetSpriteColor = pc.createScript("setSpriteColor");
SetSpriteColor.prototype.initialize = function() {
    this.entity.sprite && (this.entity.tags._list.includes("NotSticky") ? this.entity.sprite.color = ThemeManager.instance.colorBouncyGpeColor : this.entity.sprite.color = ThemeManager.instance.colorStickyGpeColor)
}, SetSpriteColor.prototype.update = function(t) {};
var ThemeManager = pc.createScript("themeManager");
ThemeManager.attributes.add("themes", {
    type: "asset",
    assetType: "json"
}), ThemeManager.attributes.add("pattern", {
    type: "entity"
}), ThemeManager.attributes.add("background", {
    type: "entity"
}), ThemeManager.attributes.add("gradient1", {
    type: "entity"
}), ThemeManager.attributes.add("gradient2", {
    type: "entity"
}), ThemeManager.prototype.initialize = function() {
    ThemeManager.instance = this, this.changeTheme()
}, ThemeManager.prototype.changeTheme = function() {
    let e = Math.floor(GameManager.instance.levelId / 10 % Object.values(this.themes.resource).length);
    this.theme = Object.values(this.themes.resource)[e], GameManager.instance.camera.camera.clearColor = (new pc.Color).fromString(this.theme.backgroundColor), this.gradient1.sprite.color = (new pc.Color).fromString(this.theme.backgroundElementsColor), this.gradient2.sprite.color = this.gradient1.sprite.color, this.pattern.sprite.spriteAsset = this.app.assets.find(this.theme.backgroundPattern, "sprite"), this.pattern.sprite.color = this.gradient1.sprite.color, this.colorStickyGpeColor = (new pc.Color).fromString(this.theme.stickyGpeColor), this.colorBouncyGpeColor = (new pc.Color).fromString(this.theme.bouncyGpeColor)
};
var SaveManager = pc.createScript("saveManager");
SaveManager.prototype.initialize = async function() {
    SaveManager.instance = this, null === this.getItem("FirstConncection") && (this.setItem("FirstConncection", !0), this.showTutorial = !0, this.setItem("LevelId", 0), this.setItem("lastLevelId", -1), this.setItem("currentLevelDeck", []), this.setItem("Skins", ["Basic"]), this.setItem("CurrentSkin", "Basic"))
}, SaveManager.prototype.getItem = function(e) {
    try {
        return JSON.parse(localStorage.getItem(e))
    } catch (t) {
        return console.error(t), "First Connection" == e ? this.firstConnection : "LevelId" == e ? this.levelId : "lastLevelId" == e ? this.lastLevelId : "currentLevelDeck" == e ? this.currentLevelDeck : "Skins" == e ? this.skins : "CurrentSkin" == e ? this.currentSkin : null
    }
}, SaveManager.prototype.setItem = function(e, t) {
    try {
        localStorage.setItem(e, JSON.stringify(t))
    } catch (n) {
        console.error(n), "First Connection" == e ? this.firstConnection = t : "LevelId" == e ? this.levelId = t : "lastLevelId" == e ? this.lastLevelId = t : "currentLevelDeck" == e ? this.currentLevelDeck = t : "Skins" == e ? this.skins = t : "CurrentSkin" == e && (this.currentSkin = t)
    }
};
var ElementScaling = pc.createScript("elementScaling");
ElementScaling.attributes.add("landScapeScaleMultiplier", {
    type: "number",
    default: 1
}), ElementScaling.attributes.add("portraitScaleMultiplier", {
    type: "number",
    default: 1
}), ElementScaling.prototype.initialize = function() {
    this.baseScale = (new pc.Vec3).copy(this.entity.getLocalScale()), this.app.graphicsDevice.on("resizecanvas", ((e, t) => {
        this.resize(e, t)
    }))
}, ElementScaling.prototype.resize = function(e, t) {
    let i = e / 2 / (t / 2),
        a = 1 * i / .9;
    a = i > 1 ? this.landScapeScaleMultiplier * a : this.portraitScaleMultiplier * i / .9, this.entity.setLocalScale(this.baseScale.x * a, this.baseScale.y * a, a)
}, ElementScaling.prototype.update = function(e) {};
var SkinBlister = pc.createScript("skinBlister");
SkinBlister.attributes.add("toColorize", {
    type: "entity",
    array: !0
}), SkinBlister.attributes.add("type", {
    type: "string"
}), SkinBlister.attributes.add("levelText", {
    type: "entity"
}), SkinBlister.attributes.add("skinSpawnPoint", {
    type: "entity"
}), SkinBlister.prototype.initialize = function() {
    this.unlocked = !1, this.skinName = "", this.entity.rigidbody.enabled = !0, this.createConstraint = !0
}, SkinBlister.prototype.postInitialize = function() {}, SkinBlister.prototype.setSelected = function(t) {
    if (this.selected = t, this.entity.findByName("Selected").enabled = t, t) {
        SaveManager.instance.setItem("CurrentSkin", this.skin), ShopManager.instance.selectedSkin = this, ShopManager.instance.displaySkin();
        let t = {
            x: .3
        };
        this.tween = this.entity.findByName("Selected").children[0].tween(t), this.tween.to({
            x: 1
        }, .6, pc.Linear).on("update", (() => {
            this.entity.findByName("Selected").children[0].sprite.opacity = t.x
        })).yoyo(!0).loop(!0).start();
        let e = {
            x: 0
        };
        this.tween2 = this.entity.findByName("Selected").children[1].tween(e), this.tween2.to({
            x: .25
        }, .6, pc.Linear).on("update", (() => {
            this.entity.findByName("Selected").children[1].sprite.opacity = e.x
        })).yoyo(!0).loop(!0).start()
    } else this.tween && this.tween2 && (this.tween2.stop(), this.tween.stop(), this.tween2 = null, this.tween = null)
}, SkinBlister.prototype.setRewarded = function() {
    this.entity.findByName("Button").button.off("click"), this.entity.findByName("Button").button.on("click", (() => {
        2 == ShopManager.instance.axis && PokiManager.instance.rewarded((t => {
            console.log(t), t && (ShopManager.instance.unlockSkin(this), GameManager.startLevel())
        }), {
            category: "cosmetic",
            detail: this.skin,
            placement: "gameplay"
        })
    })), this.entity.findByName("Unlocked").enabled = !1, this.entity.findByName("LockedRewarded").enabled = !0, this.entity.findByName("Locked").enabled = !1
}, SkinBlister.prototype.setBasic = function() {
    this.entity.findByName("Button").button.off("click"), this.entity.findByName("Button").button.on("click", (() => {
        console.log("Level")
    })), this.entity.findByName("Unlocked").enabled = !1, this.entity.findByName("LockedRewarded").enabled = !1, this.entity.findByName("Locked").enabled = !0
}, SkinBlister.prototype.unlock = function() {
    this.entity.findByName("Button").button.off("click"), this.entity.findByName("Button").button.on("click", (() => {
        2 == ShopManager.instance.axis && (this.selected ? GameManager.instance.startLevel() : (ShopManager.instance.selectedSkin.setSelected(!1), this.setSelected(!0)))
    })), this.entity.findByName("Unlocked").enabled = !0, this.entity.findByName("LockedRewarded").enabled = !1, this.entity.findByName("Locked").enabled = !1, this.unlocked = !0
}, SkinBlister.prototype.postUpdate = function(t) {
    this.createConstraint && (this.createConstraint = !1, this.entity.script.hingeConstraint.enabled = !0, this.entity.script.hingeConstraint.createConstraint())
};
var ShopManager = pc.createScript("shopManager");
ShopManager.attributes.add("skinData", {
    type: "asset",
    assetType: "json"
}), ShopManager.attributes.add("blistersLevel", {
    type: "entity"
}), ShopManager.attributes.add("blistersRewarded", {
    type: "entity"
}), ShopManager.attributes.add("pages", {
    type: "entity",
    array: !0
}), ShopManager.attributes.add("pageNext", {
    type: "entity"
}), ShopManager.attributes.add("pagePrevious", {
    type: "entity"
}), ShopManager.attributes.add("immovable", {
    type: "entity"
}), ShopManager.attributes.add("skinSpawnPoint", {
    type: "entity"
}), ShopManager.attributes.add("numberSkins", {
    type: "entity"
}), ShopManager.attributes.add("slideLimit", {
    type: "number"
}), ShopManager.attributes.add("maxHeight", {
    type: "number"
}), ShopManager.attributes.add("minHeight", {
    type: "number"
}), ShopManager.prototype.initialize = function() {
    ShopManager.instance = this, this.app.timeScale = 1, this.selectedPage = this.pages[1], this.populateShop(), this.pageNext.button.on("click", (e => {
        this.nextPage()
    })), this.pagePrevious.button.on("click", (e => {
        this.previousPage()
    }));
    var e = this.app.touch;
    e ? (e.on(pc.EVENT_TOUCHSTART, this.onMouseDown, this), e.on(pc.EVENT_TOUCHMOVE, this.onMouseMove, this), e.on(pc.EVENT_TOUCHEND, this.onMouseUp, this)) : (this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this), this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this)), this.on("destroy", (function() {
        this.app.mouse && (this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this), this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this), this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this)), this.app.touch && (this.app.touch.off(pc.EVENT_TOUCHSTART, this.onMouseDown, this), this.app.touch.off(pc.EVENT_TOUCHEND, this.onMouseUp, this), this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onMouseMove, this))
    }), this), this.shopOffsetY = 0, this.lastShopOffsetY = 0, this.yVelocity = 0, this._time = pc.now(), this.immovable.setPosition(CameraManager.instance.entity.getPosition().x, CameraManager.instance.entity.getPosition().y - 5, this.immovable.getPosition().z)
}, ShopManager.prototype.nextPage = function() {
    this.pages[this.pages.indexOf(this.selectedPage) + 1] && (this.selectedPage = this.pages[this.pages.indexOf(this.selectedPage) + 1], CameraManager.instance.shopOffsetY = 0, this.shopOffsetY = CameraManager.instance.shopOffsetY)
}, ShopManager.prototype.previousPage = function() {
    this.pages[this.pages.indexOf(this.selectedPage) - 1] && (this.selectedPage = this.pages[this.pages.indexOf(this.selectedPage) - 1], CameraManager.instance.shopOffsetY = 0, this.shopOffsetY = CameraManager.instance.shopOffsetY)
}, ShopManager.prototype.populateShop = function() {
    let e;
    Object.values(this.skinData.resources[0]).forEach(((t, s) => {
        if ("BASIC" == t.type) {
            if (null == this.blistersLevel.children[t.order - 1]) return;
            e = this.blistersLevel.children[t.order - 1].script.skinBlister, e.setBasic(), e.levelText.element.text = "LV." + t.level.toString(), e.levelText.parent.setRotation((new pc.Quat).setFromEulerAngles(0, 0, randomNumber(-35, 35)))
        } else if ("REWARDED" == t.type) {
            if (null == this.blistersRewarded.children[t.order - 1]) return;
            e = this.blistersRewarded.children[t.order - 1].script.skinBlister, e.setRewarded()
        }
        let i;
        e.skin = t.name, SaveManager.instance.getItem("Skins").includes(t.name) && e.unlock(), e.setSelected(!1), SaveManager.instance.getItem("CurrentSkin") == t.name && (e.setSelected(!0), e.selected = !0, this.currentSkin = e), e.toColorize.forEach((e => {
            e.sprite.color = (new pc.Color).fromString(t.packagingColor)
        })), this.app.assets.find(t.name, "template") ? (i = this.app.assets.find(t.name, "template").resource.instantiate(), doStuffToEntity(this.app.assets.find(t.name, "template").resource._templateRoot, i)) : (i = this.app.assets.find("Basic", "template").resource.instantiate(), doStuffToEntity(this.app.assets.find("Basic", "template").resource._templateRoot, i)), i.script.playerController.enabled = !1, i.script.skinDisplayer.enabled = !0, this.numberSkins.element.text = SaveManager.instance.getItem("Skins").length.toString() + " / 15", console.log(SaveManager.instance.getItem("Skins").length);
        let a = e.skinSpawnPoint.getPosition();
        i.setPosition(a.x, a.y, a.z), this.entity.parent.addChild(i)
    }))
}, ShopManager.prototype.unlockSkin = function(e) {
    let t = SaveManager.instance.getItem("Skins");
    t.push(e.skin), SaveManager.instance.setItem("Skins", t), e.unlock(), ShopManager.instance.selectedSkin.setSelected(!1), e.setSelected(!0)
}, ShopManager.prototype.displaySkin = function(e) {
    this.displayedSkin && this.displayedSkin.destroy(), this.displayedSkin = this.app.assets.find(this.selectedSkin.skin, "template").resource.instantiate(), doStuffToEntity(this.app.assets.find(this.selectedSkin.skin, "template").resource._templateRoot, this.displayedSkin), this.displayedSkin.script.playerController.enabled = !1, this.displayedSkin.script.skinDisplayer.enabled = !0;
    let t = this.skinSpawnPoint.getPosition();
    this.displayedSkin.setPosition(t.x, t.y, t.z), this.entity.parent.addChild(this.displayedSkin)
}, ShopManager.prototype.postUpdate = function(e) {
    CameraManager.instance && this.prev && (this.yVelocity = CameraManager.instance.getPosition().y - this.prev / e, this.prev = CameraManager.instance.getPosition().y), this.immovable.setPosition(this.immovable.getPosition().x, CameraManager.instance.entity.getPosition().y - 5, this.immovable.getPosition().z)
}, ShopManager.prototype.onMouseDown = function(e) {
    let t, s;
    e.hasOwnProperty("touches") ? (t = e.touches[0].touch.clientX, s = e.touches[0].touch.clientY) : (t = e.x, s = e.y), this.mouseDown = !0, this.startPos = new pc.Vec2(t, s), this.prev = 0, this.axis = 2, e.event.preventDefault()
}, ShopManager.prototype.onMouseMove = function(e) {
    let t, s;
    e.hasOwnProperty("touches") ? (t = e.touches[0].touch.clientX, s = e.touches[0].touch.clientY) : (t = e.x, s = e.y), this.mouseDown && (this.mousePos = new pc.Vec2(t, s), this.delta = this.mousePos.sub(this.startPos).mulScalar(2 * GameManager.instance.camera.camera.orthoHeight / window.innerHeight), (this.delta.x < -1 || this.delta.x > 1) && 2 == this.axis ? this.axis = 0 : (this.delta.y < -1 || this.delta.y > 1) && 2 == this.axis && (this.axis = 1), 0 == this.axis ? CameraManager.instance.shopOffsetX = -this.delta.x : CameraManager.instance.shopOffsetY = clamp(this.shopOffsetY + this.delta.y, 1 == this.pages.indexOf(this.selectedPage) ? -27 : -5, 5)), e.event.preventDefault()
}, ShopManager.prototype.onMouseUp = function(e) {
    if (1 == this.axis) {
        let e = 1 == this.pages.indexOf(this.selectedPage) ? 22 : 0;
        CameraManager.instance.shopOffsetY > 0 ? this.shopOffsetY = 0 : CameraManager.instance.shopOffsetY < -e ? this.shopOffsetY = -e : this.shopOffsetY = CameraManager.instance.shopOffsetY, CameraManager.instance.shopOffsetY = this.shopOffsetY
    } else this.delta && (this.delta.x > this.slideLimit ? this.nextPage() : this.delta.x < -this.slideLimit && this.previousPage());
    CameraManager.instance.shopOffsetX = 0, this.mouseDown = !1, this.axis = 3, e.event.preventDefault()
};
var SkinDisplayer = pc.createScript("skinDisplayer");
SkinDisplayer.prototype.initialize = function() {
    setTimeout((() => {
        this.entity.script.playerController.changeSpringStifness(10)
    })), this.impulseRoutine()
}, SkinDisplayer.prototype.impulseRoutine = function(i) {
    this.entity.script && (this.entity.script.playerController.head.rigidbody.applyImpulse(randomNumber(-.5, .5), 0, 0), setTimeout((() => {
        this.impulseRoutine()
    }), randomNumber(0, 15e3)))
}, SkinDisplayer.prototype.postUpdate = function(i) {};
randomNumber = function(n, r) {
    return Math.random() * (r - n) + n
};
var ShopBackground = pc.createScript("shopBackground");
ShopBackground.attributes.add("offset", {
    type: "number"
}), ShopBackground.prototype.initialize = function() {
    this.ogPosition = this.entity.getPosition().y - CameraManager.instance.entity.getPosition().y
}, ShopBackground.prototype.postUpdate = function(t) {
    this.entity.setPosition(this.entity.getPosition().x, CameraManager.instance.entity.getPosition().y - this.offset, this.entity.getPosition().z)
};
var SetRigidbodyPosition = pc.createScript("setRigidbodyPosition");
SetRigidbodyPosition.prototype.initialize = function() {}, SetRigidbodyPosition.prototype.update = function(i) {
    this.entity.rigidbody.teleport(this.entity.getPosition().x, CameraManager.instance.entity.getPosition().y, this.entity.getPosition().z)
};
var PokiManager = pc.createScript("pokiManager");
PokiManager.prototype.initialize = function() {
    PokiManager.instance = this,  this.rewardedOn = !1
}, PokiManager.prototype.interstitial = function(e) {
    // JumpGame.showInterstitial({
    //     beforeShowAd: ()=> {
                                   
    //     },
    //     afterShowAd: ()=> {
                                     
    //     }
    // })
    e() 
}, PokiManager.prototype.removeBanner = function(e) {}, PokiManager.prototype.displayBanner = function(e) {}, PokiManager.prototype.rewarded = function(e, a) {
    this.rewardedOn ? e(!1) : (null, this.rewardedOn = !0, 
        (() => this.rewardedOn = !1, true || this.app.fire("shopAdblockPopup"), e(true))())
        // JumpGame.showReward({
        //     beforeShowAd: ()=> {
                                       
        //     },
        //     afterShowAd: ()=> {
        //         this.rewardedOn = !1, true || this.app.fire("shopAdblockPopup"), e(true)                    
        //     }
        // }))
}, PokiManager.prototype.update = function(e) {};
var OnBoarding = pc.createScript("onBoarding");
OnBoarding.attributes.add("handPosition", {
    type: "vec2",
    default: [0, 0]
}), OnBoarding.attributes.add("sausagePosition", {
    type: "vec2",
    default: [0, 0]
}), OnBoarding.prototype.initialize = function() {
    this.sausage = this.entity.findByName("Sausage"), this.dash = this.entity.findByName("Dash"), this.hand = this.entity.findByName("Hand"), this.hand.startPos = this.hand.getPosition(), this.sausage.startPos = this.sausage.getPosition(), this.dash.startScale = this.dash.getLocalScale(), this.startAnimation()
}, OnBoarding.prototype.startAnimation = function(t) {
    this.hand.sprite && (this.dash.enabled = !0, this.dash.setLocalScale(0, this.dash.startScale.y, this.dash.startScale.z), this.sausage.setPosition(this.sausage.startPos.x, this.sausage.startPos.y, this.sausage.startPos.z), this.sausage.setLocalEulerAngles(0, 0, 0), this.hand.setPosition(this.hand.startPos.x, this.hand.startPos.y, this.hand.startPos.z), this.hand.sprite.opacity = 1, this.dash.tween(this.dash.getLocalScale()).to(new pc.Vec3(.619, this.dash.startScale.y, 0), .6, pc.SineOut).on("complete", (() => {
        setTimeout((() => {
            this.dash.enabled = !1, this.sausage.tween(this.sausage.getLocalPosition()).to(new pc.Vec3(this.sausagePosition.x, this.sausagePosition.y, 0), .6, pc.SineOut).on("complete", (() => {
                this.startAnimation()
            })).on("update", (() => {
                this.sausage && this.sausage.setLocalEulerAngles(0, 0, this.sausage.getLocalEulerAngles().z - 10)
            })).start();
            let t = {
                x: 1
            };
            this.hand.tween(t).to({
                x: 0
            }, .2, pc.Linear).on("update", (() => {
                this.hand.sprite && (this.hand.sprite.opacity = t.x)
            })).start(), this.hand.tween(this.hand.getLocalPosition()).to(new pc.Vec3(this.handPosition.x, this.handPosition.y - .5, 0), .2, pc.SineOut).on("update", (() => {})).start()
        }), 250)
    })).start(), this.hand.tween(this.hand.getLocalPosition()).to(new pc.Vec3(this.handPosition.x, this.handPosition.y, 0), .6, pc.SineOut).on("update", (() => {})).start())
}, OnBoarding.prototype.update = function(t) {};
var TweenText = pc.createScript("tweenText");
TweenText.prototype.initialize = function() {
    this.entity.tween(this.entity.getLocalScale()).to(new pc.Vec3(1.15 * this.entity.getLocalScale().x, 1.15 * this.entity.getLocalScale().y, 1), .25, pc.CircularInOut).on("complete", (function() {})).loop(!0).yoyo(!0).start()
}, TweenText.prototype.update = function(t) {};
var RotationTween = pc.createScript("rotationTween");
RotationTween.prototype.initialize = function() {
    this.entity.tween(new pc.Vec3(this.entity.getLocalEulerAngles().x, this.entity.getLocalEulerAngles().y, -3)).rotate(new pc.Vec3(this.entity.getLocalEulerAngles().x, this.entity.getLocalEulerAngles().y, 3), 1, pc.CircularInOut).on("complete", (function() {})).loop(!0).yoyo(!0).start()
}, RotationTween.prototype.update = function(t) {
    let e = CameraManager.instance.entity.getPosition();
    this.entity.setPosition(e.x, this.entity.getPosition().y, 0)
};
var EquipButton = pc.createScript("equipButton");
EquipButton.prototype.initialize = function() {}, EquipButton.prototype.update = function(t) {};
var NewSkinPopup = pc.createScript("newSkinPopup");
NewSkinPopup.attributes.add("skinSpawnPoint", {
    type: "entity"
}), NewSkinPopup.attributes.add("equipButton", {
    type: "entity"
}), NewSkinPopup.attributes.add("quitButton", {
    type: "entity"
}), NewSkinPopup.attributes.add("rewardedIcon", {
    type: "entity"
}), NewSkinPopup.attributes.add("newSkinText", {
    type: "entity"
}), NewSkinPopup.attributes.add("shine", {
    type: "entity"
}), NewSkinPopup.prototype.initialize = function() {
    this.equipButton.button.on("click", (() => {
        this.rewarded ? PokiManager.instance.rewarded((t => {
            if (t) {
                let t = SaveManager.instance.getItem("Skins");
                t.push(this.skin), SaveManager.instance.setItem("Skins", t), SaveManager.instance.setItem("CurrentSkin", this.skin), GameManager.instance.startLevel()
            }
            SkinsButton.instance.showButton(), GameManager.instance.playerController.activated = !0, this.entity.destroy()
        }), {
            category: "cosmetic",
            detail: this.skin,
            placement: "popup"
        }) : (SaveManager.instance.setItem("CurrentSkin", this.skin), GameManager.instance.startLevel(), this.entity.destroy())
    })), this.quitButton.button.on("click", (() => {
        SkinsButton.instance.showButton(), GameManager.instance.playerController.activated = !0, this.entity.destroy()
    })), this.displayedSkin = this.app.assets.find(this.skin, "template").resource.instantiate(), doStuffToEntity(this.app.assets.find(this.skin, "template").resource._templateRoot, this.displayedSkin), this.displayedSkin.script.playerController.enabled = !1, this.displayedSkin.script.skinDisplayer.enabled = !0;
    let t = this.skinSpawnPoint.getPosition();
    this.displayedSkin.setPosition(t.x, t.y, t.z), this.entity.addChild(this.displayedSkin), this.rewarded && (this.equipButton.findByName("Text").element.text = "UNLOCK", this.equipButton.element.color = (new pc.Color).fromString("F8B100"), this.rewardedIcon.enabled = !0, this.newSkinText.enabled = !1, this.shine.enabled = !1)
}, NewSkinPopup.prototype.update = function(t) {};
var PointerLock = pc.createScript("pointerLock");
PointerLock.attributes.add("pointer", {
    type: "entity"
}), PointerLock.attributes.add("sides", {
    type: "entity",
    array: !0
}), PointerLock.prototype.initialize = function() {
    PointerLock.instance = this, this.locked = !1, this.init = !1, this.app.mouse.disableContextMenu(), document.body.style.cursor = "none", document.addEventListener("mouseleave", (t => {
        t.clientX <= 0 && this.blink(this.sides[3]), t.clientX >= window.innerWidth && this.blink(this.sides[1]), t.clientY <= 0 && this.blink(this.sides[0]), t.clientY >= window.innerWidth && this.blink(this.sides[2])
    })), this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this)
}, PointerLock.prototype.blink = function(t) {
    let i = {
            x: 0
        },
        e = t.tween(i);
    e.to({
        x: .5
    }, .25, pc.Linear, 0, 1).on("update", (() => {
        e.manager.setTs(1 / this.app.timeScale), t.element.opacity = i.x
    })).yoyo(!0).repeat(2).start()
}, PointerLock.prototype.enablePointerLock = function(t) {
    this.app.mouse.enablePointerLock(), this.app.mouse.disableContextMenu(), this.locked = !0
}, PointerLock.prototype.disablePointerLock = function(t) {
    this.app.mouse.disablePointerLock(), this.locked = !1
}, PointerLock.prototype.onMouseDown = function(t) {}, PointerLock.prototype.onMouseMove = function(t) {
    this.init || (this.init = !0, this.x = t.x, this.y = t.y), pc.Mouse.isPointerLocked() && (this.x += t.event.movementX, this.y += t.event.movementY, this.x < 0 && (this.x = 0), this.y < 0 && (this.y = 0)), this.x = t.x, this.y = t.y, this.point = CameraManager.instance.entity.camera.screenToWorld(this.x, this.y, 0), this.pointer.setPosition(this.point.x, this.point.y, 0)
}, PointerLock.prototype.update = function(t) {}; // PlayerLock.js
/* var PlayerController = pc.createScript('playerController');


PlayerController.attributes.add('head', { type: 'entity' })
PlayerController.attributes.add('tail', { type: 'entity' })
PlayerController.attributes.add('segmentMass', { type: 'number', default: 1 })
PlayerController.attributes.add('coolDownTime', { type: 'number' })
PlayerController.attributes.add('sausageSegments', { type: 'entity', array: true });
PlayerController.attributes.add('dashMeter', { type: 'entity' });
PlayerController.attributes.add('eyes', { type: 'entity', array: true });
PlayerController.attributes.add('force', {
    type: 'number',
    default: 9
});
PlayerController.attributes.add('forceThresholds', {
    title: 'Force Thresholds',
    type: 'vec2',
    default: [0.5, 2.5]
});
PlayerController.attributes.add('springMultiplier', {
    type: 'number',
    default: 1
});
PlayerController.attributes.add('springs', { type: 'entity', array: true });
PlayerController.attributes.add('landParticles', { type: 'asset', assetType: 'template' });

PlayerController.attributes.add('debugColor', {
    title: 'Debug Color',
    description: 'The color of the debug rendering of the constraint.',
    type: 'rgb',
    default: [1, 0, 0]
});

PlayerController.attributes.add('activated', { type: 'boolean', default: true })
PlayerController.attributes.add('debug', { type: 'boolean', default: true })



// initialize code called once per entity
PlayerController.prototype.initialize = function () {

    PlayerController.instance = this;
    this.headOrTail = this.sausageSegments[0]
    console.log(this.entity)
    this.screenToWorldRatio = GameManager.instance.camera.camera.orthoHeight * 2 / window.innerHeight;
    this.startPos = new pc.Vec2();
    this.attached = false;
    this.loaded = false;
    this.segment = this.head;
    this.stuckSegment = this.segment;
    this.offset = new pc.Vec2();
    this.coolDown = false;

    var touch = this.app.touch;
    if (touch) {
        touch.on(pc.EVENT_TOUCHSTART, this.onMouseDown, this);
        touch.on(pc.EVENT_TOUCHMOVE, this.onMouseMove, this);
        touch.on(pc.EVENT_TOUCHEND, this.onMouseUp, this);

    }
    else {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }


    this.on('destroy', function () {
        PlayerController.instance = undefined;
        if (this.app.mouse) {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        }

        if (this.app.touch) {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onMouseDown, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onMouseUp, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onMouseMove, this);
        }
    }, this);

    this.sausageSegments.forEach((segment) => {
        segment.collision.on('collisionstart', (event) => {
            this.onCollisionEnter(event, segment);
        }, this);

    });






    setTimeout(() => {
        this.springs.forEach((spring) => {
            spring.script.springJoint.stifness = spring.script.springJoint.initialStifness * this.springMultiplier;
            spring.script.springJoint.damping = spring.script.springJoint.initialStifness * this.springMultiplier;

            spring.script.springJoint.createConstraint();
        });
    }, 100);


    this.on('attr', function (name, value, prev) {
        // If any constraint properties change, recreate the constraint
        if (name === 'springMultiplier') {
            this.changeSpringStifness(value);
        }
    });

    setTimeout(() => {

    }, 500)


};

PlayerController.prototype.changeSpringStifness = function (stifness) {
    this.springs.forEach((spring) => {
        spring.script.springJoint.stifness = spring.script.springJoint.initialStifness * this.springMultiplier * stifness;
        spring.script.springJoint.damping = spring.script.springJoint.initialStifness * this.springMultiplier * stifness;

        spring.script.springJoint.createConstraint();
    });

}
PlayerController.prototype.hingeLimits = function (stiff) {
    this.sausageSegments.forEach((segment, index) => {

        if (index > 0) {
            if (stiff) {
                segment.script.hingeConstraint.limits = new pc.Vec2(-7, 7)
            }
            else {
                segment.script.hingeConstraint.limits = new pc.Vec2(-45, 45)
            }
        }

    });
}

PlayerController.prototype.onMouseDown = function (event) {
    let x, y;

    if (!PointerLock.instance.locked && this.activated) {
        PointerLock.instance.enablePointerLock()
    }


    if (this.activated) {

        if (event.hasOwnProperty("touches")) {

            x = event.touches[0].touch.clientX;
            y = event.touches[0].touch.clientY;

        }
        else {

            x = PointerLock.instance.x;
            y = PointerLock.instance.y;
        }

        if ((this.loaded || this.debug) && !GameManager.instance.finished && !this.paused) {
            this.mouseDown = true;
            this.dashMeter.setLocalScale(0, 0, 0)
            this.dashMeter.enabled = true;
            this.app.timeScale = 0.1;
            this.startPos = new pc.Vec2(x, y);
        }

    }

    event.event.preventDefault();

};
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

PlayerController.prototype.onMouseMove = function (event) {
    let x, y;

    if (event.hasOwnProperty("touches")) {

        x = event.touches[0].touch.clientX;
        y = event.touches[0].touch.clientY;
    }
    else {

        x = PointerLock.instance.x;
        y = PointerLock.instance.y;
    }

    if (this.activated) {
        if (this.mouseDown) {
            this.mouseMoved = true;
            this.mousePos = new pc.Vec2(x, y);
            this.delta = this.mousePos.sub(this.startPos).mulScalar(this.screenToWorldRatio);
            this.offset = new pc.Vec2().copy(this.delta).normalize().mulScalar(clamp(this.delta.length(), this.forceThresholds.x, this.forceThresholds.y))
            this.dashMeter.setLocalScale(this.offset.length() / 5, this.offset.length() / 5, 0);

        }
    }

    event.event.preventDefault();

};

PlayerController.prototype.onMouseUp = function (event) {
    if (PointerLock.instance.locked && this.activated) {
        PointerLock.instance.disablePointerLock()
    }
    if ((this.loaded || this.debug && !this.paused)) {
        this.unstick();

        if (this.delta != undefined && this.delta != pc.Vec3.ZERO)
            this.dash(this.processForce(this.delta));


        this.mouseDown = false;
        this.app.timeScale = 1;
        this.paused = false;


        this.dashMeter.enabled = false;
        this.mouseMoved = false;
    }



    event.event.preventDefault();


};

PlayerController.prototype.processForce = function (inputDelta) {
    let direction = inputDelta.clone().normalize();
    let magnitude = clamp(inputDelta.length(), 0.5, 2.5);
    return direction.mulScalar(magnitude * this.force);
};

PlayerController.prototype.dash = function (force) {


    let velocity = new Ammo.btVector3();
    this.sausageSegments.forEach((segment, index) => {
        segment.rigidbody.body.setActivationState(1); // 1 - active
        segment.rigidbody.body.activate();
        velocity.setValue(0, 0, 0);
        segment.rigidbody.body.setLinearVelocity(velocity);
        velocity.setValue(0, 0, 0);
        this.sausageSegments[2].rigidbody.body.setAngularVelocity(velocity);
    });

    this.eyes.forEach((eye, index) => {
        if (this.eye) {

            velocity.setValue(0, 0, 0);
            eye.rigidbody.body.setLinearVelocity(velocity);
        }

    });


    this.coolDown = true;
    setTimeout(() => {
        this.coolDown = false;
    }, this.coolDownTime);


    this.headOrTail.rigidbody.body.applyImpulse(new Ammo.btVector3(force.x, -force.y, 0));

};


PlayerController.prototype.unstick = function (event) {

    if (this.activated && this.attached && !this.paused) {
        let hinge = this.stuckSegment.children[0].script.hinge;
        hinge.enabled = false;
        this.hingeLimits(true)
        this.changeSpringStifness(8);

        this.loaded = false;
        this.attached = false;
    }

}

PlayerController.prototype.stick = function (segment, entity) {
    this.attached = true;
    this.loaded = true;
    let hinge = segment.children[0].script.hinge;
    this.stuckSegment = segment;

    let distance = 0;

    this.sausageSegments.forEach((seg) => {
        //   if (seg == this.head || seg == this.tail && seg != segment) {
        let thisDistance = this.stuckSegment.getPosition().sub(seg.getPosition()).length();// Vector2.Distance(stuckSausageSegment.transform.position, segment.transform.position);
        if (thisDistance <= distance) return;

        distance = thisDistance;
        this.headOrTail = seg;
        //  }
    });

    this.hingeLimits(false)
    this.changeSpringStifness(3);

    hinge.entityB = entity.other;
    hinge.pivotA = entity.contacts[0].localPoint;
    hinge.pivotB = entity.contacts[0].localPointOther;
    hinge.createConstraint();
    hinge.enabled = true;
    let particles = this.landParticles.resource.instantiate();
    segment.addChild(particles)
    particles.particlesystem.play()
    particles.setLocalPosition(0, 0, 0)
    CameraManager.instance.flashOutline(.5)
};


PlayerController.prototype.onCollisionEnter = function (entity, segment) {


    if (!this.attached && (!this.coolDown) && !entity.other.tags._list.includes("NotSticky")) {
        this.oldEntity = entity;

        if (!entity.other.tags._list.includes("Segment")) {
            this.stick(segment, entity)
            this.mouseDown = false;
            this.app.timeScale = 1;


        }
    }

};


// update code called every frame
PlayerController.prototype.update = function (dt) {

    if (this.head.getPosition().y < -20 && !GameManager.instance.finished && this.activated) {
        this.activated = false;
        GameManager.instance.startLevel()


    }
    if (this.dashMeter.enabled) {

        this.dashMeter.setPosition(this.headOrTail.getPosition());
        this.dashMeter.setRotation(new pc.Quat().setFromEulerAngles(0, 0, 180 * Math.atan2(-this.offset.normalize().y, this.offset.normalize().x) / Math.PI));
    }


};

// swap method called for script hot-reloading
// inherit your script state here
// PlayerController.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/ */

var SkipLevel = pc.createScript("skipLevel");
SkipLevel.attributes.add("nextLevel", {
    type: "entity"
}), SkipLevel.prototype.initialize = function() {
    SkipLevel.instance = this, GameManager.instance.respawned && this.showButton()
}, SkipLevel.prototype.showButton = function(e) {
    this.nextLevel.enabled = !0;
    let t = this.nextLevel.tween(this.nextLevel.getLocalPosition());
    t.to(new pc.Vec3(10, this.nextLevel.getLocalPosition().y, 0), .5, pc.ElasticOut).on("complete", (() => {})).on("update", (() => {
        t.manager.setTs(1 / this.app.timeScale)
    })).start()
}, SkipLevel.prototype.hideButton = function(e) {
    e || (e = .5);
    let t = this.nextLevel.tween(this.nextLevel.getLocalPosition());
    t.to(new pc.Vec3(80, this.nextLevel.getLocalPosition().y, 0), e, pc.ElasticIn).on("complete", (() => {
        this.nextLevel.enabled = !1
    })).on("update", (() => {
        t.manager.setTs(1 / this.app.timeScale)
    })).start()
};
var SkinsButton = pc.createScript("skinsButton");
SkinsButton.attributes.add("skinsButton", {
    type: "entity"
}), SkinsButton.prototype.initialize = function() {
    SkinsButton.instance = this, this.hidden = !0
}, SkinsButton.prototype.showButton = function(t) {
    if (!this.skinsButton.enabled) {
        this.skinsButton.enabled = !0;
        let t = this.skinsButton.tween(this.skinsButton.getLocalPosition());
        t.to(new pc.Vec3(30, this.skinsButton.getLocalPosition().y, 0), .5, pc.ElasticOut).on("complete", (() => {})).on("update", (() => {
            t.manager.setTs(1 / this.app.timeScale)
        })).start()
    }
}, SkinsButton.prototype.hideButton = function(t) {
    if (t || (t = .5), this.skinsButton.enabled) {
        this.hidden = !0;
        let n = this.skinsButton.tween(this.skinsButton.getLocalPosition());
        n.to(new pc.Vec3(140, this.skinsButton.getLocalPosition().y, 0), t, pc.ElasticIn).on("complete", (() => {
            this.skinsButton.enabled = !1
        })).on("update", (() => {
            n.manager.setTs(1 / this.app.timeScale)
        })).start()
    }
};
var DisableAd = pc.createScript("disableAd");
DisableAd.prototype.initialize = function() {
    this.app.on("shopAdblockPopup", (() => {
        this.showPopup()
    }))
}, DisableAd.prototype.showPopup = function() {
    let t = {
            x: 0
        },
        e = this.entity.tween(t);
    e.to({
        x: 1
    }, 1, pc.ExponentialOut, 0, 1).on("update", (() => {
        e.manager.setTs(1 / this.app.timeScale), this.entity.element.opacity = t.x
    })).yoyo(!0).repeat(2).start()
}, DisableAd.prototype.update = function(t) {};
var SausageTween = pc.createScript("sausageTween");
SausageTween.prototype.initialize = function() {}, SausageTween.prototype.update = function(e) {};
var TransitionScreen = pc.createScript("transitionScreen");
TransitionScreen.attributes.add("sausage", {
    type: "entity"
}), TransitionScreen.attributes.add("newSkin", {
    type: "entity"
}), TransitionScreen.attributes.add("shine", {
    type: "entity"
}), TransitionScreen.attributes.add("toTheme", {
    type: "entity",
    array: !0
}), TransitionScreen.attributes.add("levelTexts", {
    type: "entity",
    array: !0
}), TransitionScreen.prototype.initialize = function() {
    this.levelTexts[0].element.text = GameManager.instance.levelId - 1, this.levelTexts[1].element.text = GameManager.instance.levelId, this.levelTexts[2].element.text = GameManager.instance.levelId + 1, this.toTheme.forEach((e => {
        e.sprite.color = (new pc.Color).fromString(ThemeManager.instance.theme.backgroundColor)
    })), this.levelTexts.forEach((e => {
        e.element.color = (new pc.Color).fromString(ThemeManager.instance.theme.backgroundColor)
    })), this.entity.findByName("Background").sprite.color = (new pc.Color).fromString(ThemeManager.instance.theme.backgroundElementsColor), Object.values(GameManager.instance.skinList.resources[0]).find((e => e.level == GameManager.instance.levelId + 1)) && (this.newSkin.enabled = !0), this.entity.setLocalScale(0, 0, 0), this.entity.tween(this.entity.getLocalScale()).to(new pc.Vec3(1.25, 1.25, 1.25), .5, pc.ElasticOut).on("complete", (() => {
        this.sausage.tween(this.sausage.getLocalPosition()).to(new pc.Vec3(-.35, this.sausage.getLocalPosition().y, this.sausage.getLocalPosition().z), .5, pc.Linear).on("complete", (() => {
            this.shine.tween(this.shine.getLocalScale()).to(new pc.Vec3(1, 1, 1), 2, pc.ElasticOut).start(), setTimeout((() => {
                this.entity.tween(this.entity.getLocalScale()).to(new pc.Vec3(0, 0, 0), .5, pc.ElasticIn).on("complete", (() => {
                    GameManager.instance.startLevel(), this.entity.parent.destroy()
                })).start()
            }), 500)
        })).start()
    })).start()
}, TransitionScreen.prototype.update = function(e) {};

//# sourceMappingURL=__game-scripts.js.map