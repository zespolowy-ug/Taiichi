"use strict";

module.exports = function(sequelize, Sequelize) {

    const ChatMessage = sequelize.define('chat_messages', {

        message_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        message: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        project_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },


        user_id: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        firstname: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        lastname: {
            type: Sequelize.STRING,
            notEmpty: true
        }


    });

    ChatMessage.associate = (models) => {
        ChatMessage.belongsTo(models.project);
    }

    return ChatMessage;

}
