'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('AlertStatus', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID
			},
			alert_id: {
				allowNull: false,
				primaryKey: false,
				type: Sequelize.UUID
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull:false,
				type: Sequelize.DATE
			},
			status: {
				allowNull: false,
				type: Sequelize.STRING
            },
            user_id: {
                allowNull:false,
                type: Sequelize.UUID
			},
			field_type: {
				allowNull: false,
				type: Sequelize.STRING
            },
            operator: {
                allowNull:false,
                type: Sequelize.STRING    
            },
            value: {
                allowNull:false,
                type: Sequelize.INTEGER
            }
		});
	},
	down: (queryInterface, Sequelize) => {
			return queryInterface.dropTable('AlertStatus');
	}
};