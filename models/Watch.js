module.exports = (sequelize, DataTypes) => {
	var Watch= sequelize.define('Watch', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true
		},
		watch_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: false
		},
		user_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
		},
		zipcode: {
				allowNull: false,
				type: DataTypes.STRING
		}
	},
	{
			 freezeTableName: true,
			 createdAt: 'watch_created',
			 updatedAt: 'watch_updated'
	}
    );
	return Watch;
};