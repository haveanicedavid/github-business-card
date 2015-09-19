UserCards = new Mongo.Collection('userCards');

Meteor.methods({
  fetchUserData: function(userId, token) {
    var url   = 'http://api.github.com/user?access_token=' + token;
    var currentCard = UserCards.findOne({owner: Meteor.userId()});

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } 

    HTTP.get(url, function(error, result) {
      if (error) {
      } else if (currentCard) {
        Meteor.call('updateCard', currentCard._id, result.name, result.login, result.email, result.location, result.followers, result.following);
      } else {
        Meteor.call('createCard', result.data);
      }
    });
  },

  createCard: function(userData) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    UserCards.insert({
      owner:     Meteor.userId(),
      name:      userData.name,
      location:  userData.location,
      login:     userData.login,
      followers: userData.followers,
      following: userData.following,
      email:     userData.email,
      url:       userData.html_url,
      // private:   false
    });
    var card = UserCards.findOne({owner: Meteor.userId()});
    console.log(card.name);
    console.log(card.location);
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