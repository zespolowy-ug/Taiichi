"use strict";

module.exports = function(sequelize, Sequelize) {
    console.log("WYWOŁANIE połączenia");
    var User = sequelize.import("./user");
    var Project = sequelize.import("./project");


const userToProject = sequelize.define('users_to_projects', {
  id : {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: Sequelize.INTEGER,
    unique: 'user_project_relation'
  },
  project_id: {
    type: Sequelize.INTEGER,
    unique: 'user_project_relation'
  }
});

User.associate = function (models) {
    User.belongsToMany(models.Project, {
        through: {
            model: models.userToProject,
            unique: false
        },
        foreignKey: 'user_id',
        constraints: false
    });

    Project.belongsToMany(models.User, {
        through: {
            model: models.userToProject,
            unique: false
        },
        foreignKey: 'project_id',
        constraints: false
    });
};




return userToProject;

}
