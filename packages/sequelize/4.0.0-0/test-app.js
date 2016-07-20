"use strict";
/* jshint esnext:true, -W110 */

var Sequelize, sequelize, DataTypes, Promise = require('bluebird'), _ = require('lodash'), moment = require('moment');

Sequelize = DataTypes = require('./index.js');
//var db = sequelize = new Sequelize('sequelize', 'root', '', {
var db = sequelize = new Sequelize('sequelize_test', 'postgres', 'postgres', {
  dialect: 'postgres',
//var db = sequelize = new Sequelize('sequelize-test-72', 'sequelize', 'nEGkLma26gXVHFUAHJxcmsrK', {
//  dialect: 'mssql',
//  host: 'mssql.sequelizejs.com',
//  port: 11433,
//  dialect: 'sqlite',
  define: {
    timestamps: false,
  },
  //logging: console.log
});

var CategoryMedia = sequelize.define('CategoryMedia', {
  categoryId: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  },
  mediaId: {
    type: DataTypes.INTEGER(11),
    allowNull: false,
  }
}, {
  tableName: 'category_to_media',
  freezeTableName: true,
  timestamps: false
});

var Category = sequelize.define('category');
var Media = sequelize.define('media');


Category.belongsToMany(Media, {foreignKey: 'categoryId', through: CategoryMedia, onDelete: 'CASCADE'});
Media.belongsToMany(Category, {foreignKey: 'mediaId', through: CategoryMedia, onDelete: 'CASCADE'});

sequelize.sync({logging: console.log, force: true}).then(function() {
  return Promise.join(
    Category.create({ id : 42 }),
    Media.create()
  );
}).spread(function(category, media) {
  return category.addMedia(media);
}).then(function() {
  return Category.destroy({
    where: {id: 42}
  })
}).then(function() {
  return CategoryMedia.count().then(console.log);
}).catch(function(err) {
  console.dir(err);
  process.exit(1);
});
//return sequelize.sync({
//  force: true,
//  logging: console.log
//})
//  .finally(() => sequelize.close());
