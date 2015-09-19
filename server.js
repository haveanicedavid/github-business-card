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