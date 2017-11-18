"use strict";

module.exports = function(sequelize, Sequelize) {
console.log("WYWOŁANIE projects");

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
        }

    });

    return Project;

}
