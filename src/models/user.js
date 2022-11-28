const getUserModel = (sequelize, { DataTypes }) => {
    const User = sequelize.define('user', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        
    });

    User.associate = (models) => {
        User.hasMany(models.Category, { onDelete: 'CASCADE' });
    };

    return User;
};

export default getUserModel;