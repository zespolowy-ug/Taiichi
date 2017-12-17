"use strict";

module.exports = function(sequelize, Sequelize) {

    const Notification = sequelize.define('notifications', {

        notification_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        content: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        project_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        task_id: {
            type: Sequelize.STRING,
            notEmpty: false
        },


    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.project);
    }

    return Notification;

}
