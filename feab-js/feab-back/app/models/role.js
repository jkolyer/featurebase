let mongoose = require('mongoose');
let Schema = mongoose.Schema;

//role schema definition
let RoleSchema = new Schema(
    {
	name: { type: String, required: true },
	feab_version: { type: String, required: true },
	order_id: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
    },
    {
	versionKey: false
    }
);

// Sets the createdAt parameter equal to the current time
RoleSchema.pre('save', next => {
    if(!this.createdAt) {
	this.createdAt = new Date();
    }
    next();
});

//Exports the RoleSchema for use elsewhere.
module.exports = mongoose.model('role', RoleSchema);