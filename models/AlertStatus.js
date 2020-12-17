
module.exports = (sequelize, DataTypes) => {
	var AlertStatus= sequelize.define('AlertStatus', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		alert_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: false
        },
		status: {
				allowNull: false,
				type: DataTypes.STRING
		},
		user_id: {
				allowNull: false,
				type: DataTypes.UUID
		},
		field_type: {
			type: DataTypes.STRING,
			allowNull:false,
		},
		operator: {
				allowNull: false,
				type: DataTypes.STRING
		},
		value: {
				allowNull: false,
				type: DataTypes.INTEGER
		}
	},
	{
			 freezeTableName: true,
	}
    );
	return AlertStatus;
};