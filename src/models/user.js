import crypto from 'node:crypto';

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
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
                isEmail: true
            }
        },
        hash: { // hashed password
            type: DataTypes.STRING,
            allowNull: false,
            set(password) {
                this.setDataValue('salt',crypto.randomBytes(16).toString('hex'));
                this.setDataValue('hash', crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex'));
            }
        },
        salt: { // hash for password
            type: DataTypes.STRING,
        }
        
    });

    User.associate = (models) => {
        User.hasMany(models.Category, { onDelete: 'CASCADE' });
        User.hasMany(models.Contributor, { onDelete: 'CASCADE' });
    };

    User.findByLogin = async (login) => {
        let user = await User.findOne({
            attributes: { exclude: ['hash', 'salt'] },
            where: { username: login },
        });

        if (!user) {
            user = await User.findOne({
                attributes: { exclude: ['hash', 'salt'] },
                where: { email: login },
            });
        }

        return user;
    }

    User.validatePassword = async (id, password) => {
        const user = await User.findByPk(id);

        if (!user) {
            throw 'User not found';
        }

        const hash = crypto.pbkdf2Sync(password, user.dataValues.salt, 1000, 64, 'sha512').toString('hex');

        return user.dataValues.hash === hash;
    }

    return User;
};

export default getUserModel;