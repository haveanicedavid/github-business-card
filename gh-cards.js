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
  Meteor.subscribe('userCards');

  Template.body.helpers({
    userCards: function() {
      return UserCards.find({});
    }
  });

  Template.body.events({
    'click .new-user': function () {

      // var token = Meteor.user().services.github.accessToken;
      // var url = 'http://api.github.com/user?access_token=' + token;
      Meteor.call('fetchUserData');
    }
  });

  Template.userCard.helpers({
    // counter: function () {
    //   return Session.get('counter');
    // }
    firstName: function() {
      var user = UserCards.findOne(_id);

      console.log(user.login);
      // console.log(Meteor.userId());
      // return Meteor.users;
    }
  });
}

Meteor.methods({
  fetchUserData: function() {
    var token = Meteor.user().services.github.accessToken;
    var url = 'http://api.github.com/user?access_token=' + token;

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    HTTP.get(url, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        console.log(result.data);
        Meteor.call('createCard', result.data);
      }
    });
  },

  createCard: function(userData) {
    UserCards.insert({
      owner: Meteor.userId(),
      login: userData.login,
      followers: userData.followers,
      following: userData.following,
      email: userData.email,
    });
  }


});