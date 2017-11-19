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

        position: {
            type: Sequelize.INTEGER
        }

    });

    Task.associate = (models) => {
        Task.belongsTo(models.board);
    }

    return Task;

}
