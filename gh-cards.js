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
      var token = Meteor.user().profile.github_accessToken;
      Meteor.call('fetchUserData', Meteor.userId(), token);
    },
  });

  Template.currentUserCard.events({
    'click .toggle-private': function(event) {
      event.preventDefault();
      var card = UserCards.findOne({owner: Meteor.userId()});
      Meteor.call('setPrivate', card._id, !card.private);
    },

    'click .delete-card': function(event) {
      event.preventDefault();
      var card = UserCards.findOne({owner: Meteor.userId()});
      Meteor.call('deleteCard', card._id);
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
      var followers   = userCard.followers;
      var following   = userCard.following;

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

