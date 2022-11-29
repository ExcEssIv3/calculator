const getContributorModel = (sequelize, { DataTypes }) => {
    const Contributor = sequelize.define('contributor', {
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        carbonProduction: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    });

    Contributor.associate = (models) => {
        Contributor.belongsTo(models.Category);
        Contributor.belongsTo(models.User);
    };

    return Contributor;
};

export default getContributorModel;