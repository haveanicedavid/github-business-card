UserCards = new Mongo.Collection('userCards');

if (Meteor.isClient) {
  // counter starts at 0
  // Session.setDefault('counter', 0);
  Meteor.subscribe('userCards');

  Template.userData.helpers({
    // counter: function () {
    //   return Session.get('counter');
    // }
    firstName: function() {
      // console.log(Meteor.userId());
      // return Meteor.users;
    }
  });


  // Template.userData.events({
  //   'click button': function () {
  //     // increment the counter when button is clicked
  //     Session.set('counter', Session.get('counter') + 1);
  //   }
  // });
}

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
