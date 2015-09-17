UserCards = new Mongo.Collection('userCards');

if (Meteor.isServer) {
  // Meteor.startup(function () {
  //   // code to run on server at startup
  // });
  Meteor.publish('userCards', function() {
    if (this.userId) {
      return Meteor.users.find(
          {_id: this.userId}
        );
    } else {
      this.ready();
    }
  });
}

if (Meteor.isClient) {
  // counter starts at 0
  // Session.setDefault('counter', 0);
  Meteor.subscribe('userCards');

  Template.body.events({
    'click .new-user': function () {
      // increment the counter when button is clicked
      // var token = Meteor.user().services.github.accessToken;
      // HTTP.get('http://api.github.com/user', function(userData) {
      //   console.log(userData);
        // Meteor.call('createCard', userData);
      // });
      var method = 'GET';
      var token = Meteor.user().services.github.accessToken;
      var url = 'http://api.github.com/user?access_token=' + token;
      // var options = {
      //   headers: {'Authorization':  token }
      // };
      Meteor.call('createCard', method, url, function (error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      });
    }
  });

  Template.userCard.helpers({
    // counter: function () {
    //   return Session.get('counter');
    // }
    firstName: function() {
      // console.log(Meteor.userId());
      // return Meteor.users;
    }
  });
}

Meteor.methods({
  createCard: function(method, url, options) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    // var token = Meteor.user().services.github.accessToken;
    HTTP.call(method, url, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        console.log(result);
      }
    });

    // UserCards.insert({
    //   login: userData.login
    // });
  },
});