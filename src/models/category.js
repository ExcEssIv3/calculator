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
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isInt: true,
                min: 1,
                max: 3,
            },
        },
        direction: { // 1: upstream, 2: reporting, 3: downstream
            type: DataTypes.ENUM('Upstream', 'Reporting', 'Downstream'),
            allowNull: false,
        },
        type: { // 0: direct, 1: indirect
            type: DataTypes.ENUM('Direct', 'Indirect'),
            allowNull: false,
        },
        
    });

    Category.associate = (models) => {
        Category.belongsTo(models.User);
    };

    return Category;
};

export default getCategoryModel;