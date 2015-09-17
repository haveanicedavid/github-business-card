UserCards = new Mongo.Collection('userCards');

if (Meteor.isServer) {

  // Meteor.publish('userCards', function() {
  //   if (this.userId) {
  //     return Meteor.users.find(
  //         {_id: this.userId}
  //       );
  //   } else {
  //     this.ready();
  //   }
  // });
}

if (Meteor.isClient) {
  // Meteor.subscribe('userCards');

  Template.body.helpers({
    userCards: function() {
      return UserCards.find({});
    },

    cardMade: function() {
      var card = UserCards.findOne({owner: Meteor.userId()});
      return card ? true : false;
    }
  });

  Template.body.events({
    'click .new-user': function () {
      Meteor.call('fetchUserData', this._id);
    }
  });
}

Meteor.methods({
  fetchUserData: function(id) {
    var token = Meteor.user().services.github.accessToken;
    var url = 'http://api.github.com/user?access_token=' + token;

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } else if (UserCards.findOne({owner: Meteor.userId()})) {
      throw new Meteor.Error('card already exists');
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
      name: userData.name,
      location: userData.location,
      login: userData.login,
      followers: userData.followers,
      following: userData.following,
      email: userData.email,
    });
  }
});