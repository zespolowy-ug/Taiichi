"use strict";

module.exports = function(sequelize, Sequelize) {

const userToTask = sequelize.define('users_to_tasks', {
  id : {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
});

userToTask.associate = (models) => {
    userToTask.belongsTo(models.task);
    userToTask.belongsTo(models.user);
}

return userToTask;

}
