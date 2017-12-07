"use strict";

module.exports = function(sequelize, Sequelize) {

const userToProject = sequelize.define('users_to_projects', {
  id : {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});

userToProject.associate = (models) => {
    userToProject.belongsTo(models.project);
    userToProject.belongsTo(models.user);
}

return userToProject;

}
