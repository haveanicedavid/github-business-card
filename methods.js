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