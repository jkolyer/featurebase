const Role = require('../../models/role');

/*
 * GET /role route to retrieve all the roles.
 */
function getRoles(req, res) {
    // Query the DB and if no errors, send all the roles
    const query = Role.find({});
    query.exec((err, roles) => {
        if (err) res.send(err);
        // If no errors, send them back to the client
        res.json(roles);
    });
}

/*
 * POST /role to save a new role.
 */
function postRole(req, res) {
    // Creates a new role
    const newRole = new Role(req.body);
    // Save it into the DB.
    newRole.save((err, role) => {
        if (err) {
            res.send(err);
        } else { // If no errors, send it back to the client
            res.json({ message: 'Role successfully added!', role });
        }
    });
}

/*
 * GET /role/:id route to retrieve a role given its id.
 */
function getRole(req, res) {
    Role.findById(req.params.id, (err, role) => {
        if (err) res.send(err);
        // If no errors, send it back to the client
        res.json(role);
    });
}

/*
 * DELETE /role/:id to delete a role given its id.
 */
function deleteRole(req, res) {
    Role.remove({ _id: req.params.id }, (err, result) => {
        res.json({ message: 'Role successfully deleted!', result });
    });
}

/*
 * PUT /role/:id to updatea a role given its id
 */
function updateRole(req, res) {
    Role.findById({ _id: req.params.id }, (err, role) => {
        if (err) res.send(err);
        Object.assign(role, req.body).save((err2, role2) => {
            if (err2) res.send(err2);
            res.json({ message: 'Role updated!', role2 });
        });
    });
}

// export all the functions
module.exports = {
    getRoles, postRole, getRole, deleteRole, updateRole,
};
