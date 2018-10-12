const mongoose = require('mongoose');

const { Schema } = mongoose;

// role schema definition
const RoleSchema = new Schema({
    name: { type: String, required: true },
    feab_version: { type: String, required: true },
    order_id: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    versionKey: false,
});

RoleSchema.methods.hasRole = function (cb) {
    this.model('Role').findOne({
        name: this.name,
    }, (err, val) => {
        cb(!!val);
    });
};

// Sets the createdAt parameter equal to the current time
RoleSchema.pre('save', (next) => {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});

// Exports the RoleSchema for use elsewhere.
module.exports = mongoose.model('Role', RoleSchema);
