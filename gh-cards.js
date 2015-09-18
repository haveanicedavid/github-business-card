UserCards = new Mongo.Collection('userCards');

if (Meteor.isServer) {

  Meteor.publish('userCards', function() {
    return UserCards.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId() }
      ]
    });
  });
}

if (Meteor.isClient) {
  Meteor.subscribe('userCards');

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

    'click .toggle-private': function(event) {
      event.preventDefault();
      var card = UserCards.findOne({owner: Meteor.userId()});
      Meteor.call('setPrivate', card._id, !card.private);
    }
  });

  Template.currentUserCard.helpers({
    user: function() {
      var user = UserCards.findOne({owner: Meteor.userId()});
      return {
        name:      user.name,
        username:  user.login,
        email:     user.email,
        location:  user.location,
        followers: user.followers,
        following: user.following,
        private:   user.private
      };
    }

  });

  Template.editInfoForm.events({
    'submit form': function(event) {
      event.preventDefault();
      var userCard = UserCards.findOne({owner: Meteor.userId()});

      var newName     = event.target.currentName.value || userCard.name;
      var newUserName = event.target.username.value || userCard.login;
      var newEmail    = event.target.email.value || userCard.email;
      var newLocation = event.target.location.value || userCard.location;
      var followers = userCard.followers;
      var following = userCard.following;

      Meteor.call('updateCard', userCard._id, newName, newUserName, newEmail, newLocation, followers, following);
    }
  });

  Template.editInfoForm.helpers({
    user: function() {
      var user = UserCards.findOne({owner: Meteor.userId()});
      return {
        name:     user.name,
        username: user.login,
        email:    user.email,
        location: user.location
      };
    }
  });
}

Meteor.methods({
  fetchUserData: function() {
    var token = Meteor.user().services.github.accessToken;
    var url   = 'http://api.github.com/user?access_token=' + token;
    var currentCard = UserCards.findOne({owner: Meteor.userId()});

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } 

    HTTP.get(url, function(error, result) {
      if (error) {
        console.log(error);
      } else if (currentCard) {
        var data = result.data;
        Meteor.call('updateCard', currentCard._id, data.name, data.login, data.email, data.location, data.followers, data.following);
      } else {
        // console.log(result.data);
        Meteor.call('createCard', result.data);
      }
    });
  },

  createCard: function(userData) {
    UserCards.insert({
      owner: Meteor.userId(),
      name:      userData.name,
      location:  userData.location,
      login:     userData.login,
      followers: userData.followers,
      following: userData.following,
      email:     userData.email,
      url:       userData.html_url,
    });
  },

  updateCard: function(cardId, name, username, email, location, followers, following) {
    UserCards.update(cardId, { $set: {
      name:     name,
      login:    username,
      email:    email,
      location: location,
      followers: followers,
      following: following
    }});
  },

  setPrivate: function(cardId, setToPrivate) {
    var card = UserCards.findOne(cardId);
    if (card.owner !== Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    UserCards.update(cardId, { $set: { private: setToPrivate } });
  }
});