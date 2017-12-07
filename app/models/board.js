"use strict";

module.exports = function(sequelize, Sequelize) {
  
    const Board = sequelize.define('board', {

        board_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        position: {
            type: Sequelize.INTEGER
        }

    });

    Board.associate = (models) => {
        Board.hasMany(models.task);
        Board.belongsTo(models.project);
    }

    return Board;

}
