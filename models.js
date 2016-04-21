/*
  eslint "new-cap": ["warn", { capIsNewExceptions: ["Sequelize", "STRING"] }]
*/

var Sequelize = require('sequelize');
var db = require('./db').db;

var models = {};

models.User = db.define('User', {
  email: {
    type: Sequelize.STRING(255),
    primaryKey: true
  },
  password: Sequelize.STRING(60)
});

models.Question = db.define('Question', {
  question: {
    type: Sequelize.STRING(1024),
    allowNull: false
  },
  published: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

models.Answer = db.define('Answer', {
  answer: {
    type: Sequelize.STRING(1024),
    allowNull: false
  }
});
models.Question.hasMany(models.Answer, { onDelete: 'CASCADE' });

models.Response = db.define('Response', {}, {
  indexes: [
    {
      unique: true,
      fields: ['QuestionId', 'SessionSid']
    }
  ]
});
models.Response.belongsTo(models.Answer, { onDelete: 'CASCADE' });
models.Response.belongsTo(models.Question, { onDelete: 'CASCADE' });
models.Response.belongsTo(db.models.Session);

module.exports = models;
