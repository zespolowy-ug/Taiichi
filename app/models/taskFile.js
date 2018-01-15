"use strict";

module.exports = function(sequelize, Sequelize) {

    const taskFile = sequelize.define('tasks_files', {

        file_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        original_name: {
            type: Sequelize.STRING,
            notEmpty: true
        }

    });

    taskFile.associate = (models) => {
        taskFile.belongsTo(models.task);
    }

    return taskFile;

}
