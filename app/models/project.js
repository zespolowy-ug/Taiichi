"use strict";

module.exports = function(sequelize, Sequelize) {

    const Project = sequelize.define('project', {

        project_id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        name: {
            type: Sequelize.STRING,
            notEmpty: true
        },

        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },

        color: {
            type: Sequelize.STRING
        }

    });

    Project.associate = (models) => {
        Project.hasMany(models.users_to_projects);
        Project.hasMany(models.board);
    }

    return Project;

}
