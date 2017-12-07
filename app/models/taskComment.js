"use strict";

module.exports = function(sequelize, Sequelize) {

    const TaskComment = sequelize.define('taskComment', {

        comment_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        content: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        creator_user_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        }

    });

    TaskComment.associate = (models) => {
        TaskComment.belongsTo(models.task);
    }

    return TaskComment;

}
