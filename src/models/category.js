const getCategoryModel = (sequelize, { DataTypes }) => {
    const Category = sequelize.define('category', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        scope: {
            type: DataTypes.NUMBER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1,
                max: 3,
            },
        },
        direction: {
            type: DataTypes.NUMBER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1,
                max: 3,
            },
        },
        type: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        
    });

    Category.associate = (models) => {
        Category.belongsTo(models.User);
    };

    return Category;
};

export default getCategoryModel;