var Sequelize = require('./index');
 
var sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  storage: 'buggy.sqlite'
});
 
var userAttributes = {
  email: Sequelize.STRING,
  name: Sequelize.STRING
};
 
var User = sequelize.define('User', userAttributes);
 
sequelize.sync({force: true}).done(function () {
  User.create({email: 'soswow@gmail.com', name: 'Aleksandr'}).done(function (err, alex) {
    User.create({email: 'ervin@gmail.com', name: 'Ervin'}).done(function (err, ervin) {
      console.log(alex.id);
      alex.updateAttributes({id: ervin.id, name: 'Super man'}, ['name']).done(function () {
        console.log(alex.id);
        User.findAll().done(function (err, users) {
          console.log(users.map(function (user) {
            return user.get();
          }));
        })
      }).on('sql', function (sql) {
        console.log(sql);
      });
    });
  });     
});