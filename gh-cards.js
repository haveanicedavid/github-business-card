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
    'click .fetch-info': function () {
      Meteor.call('fetchUserData', this._id);
    },

    // 'click .edit': function(event) {
    //   var newName     = event.target.text.value;
    //   var newUserName = event.target.text.value;
    //   var newEmail    = event.target.text.value;
    //   var newLocation = event.target.text.value;

    //   Meteor.call('updateCard', this._id, newName, newUserName, newEmail, newLocation);
    // }
  });

  Template.currentUserCard.helpers({
    user: function() {
      var user = UserCards.findOne({id: this._id});
      return {
        name: user.name,
        username: user.login,
        email: user.email,
        location: user.location,
        followers: user.followers,
        following: user.following
      };
    }

  });

  Template.editInfoForm.events({
    'submit form': function(event) {
      event.preventDefault();
      var newName     = event.target.currentName.value;
      var newUserName = event.target.username.value;
      var newEmail    = event.target.email.value;
      var newLocation = event.target.location.value;
      // console.log(newName);
      // console.log(newUserName);
      // console.log(newEmail);
      // console.log(newLocation);
      Meteor.call('updateCard', newName, newUserName, newEmail, newLocation);
    }
  });

  Template.editInfoForm.helpers({
    user: function() {
      var user = UserCards.findOne({owner: Meteor.userId()});
      return {
        name: user.name,
        username: user.login,
        email: user.email,
        location: user.location
      };
    }
  });
}

Meteor.methods({
  fetchUserData: function() {
    var token = Meteor.user().services.github.accessToken;
    var url   = 'http://api.github.com/user?access_token=' + token;

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
  },

  updateCard: function(cardId, name, username, email, location) {
    console.log(cardId, name, username, email);
    UserCards.update(cardId, { $set: {
      name: name,
      login: username,
      email: email,
      location: location
    }});
  }
});