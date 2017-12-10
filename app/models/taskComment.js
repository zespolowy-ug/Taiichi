"use strict";

module.exports = function(sequelize, Sequelize) {

    const TaskComment = sequelize.define('tasks_comments', {

        comment_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        content: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        creator_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        creator_firstname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        creator_lastname: {
            type: Sequelize.STRING,
            notEmpty: true
        }


    });

    TaskComment.associate = (models) => {
        TaskComment.belongsTo(models.task);
    }

    return TaskComment;

}
