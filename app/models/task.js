"use strict";

module.exports = function(sequelize, Sequelize) {
console.log("WYWOŁANIE tasks");

    const Task = sequelize.define('task', {

        task_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        description: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        responsible_user_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        creator_user_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        priority: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        status: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        position: {
            type: Sequelize.INTEGER
        }

    });

    Task.associate = (models) => {
        Task.hasMany(models.taskComment);
        Task.belongsTo(models.board);
    }

    return Task;

}
