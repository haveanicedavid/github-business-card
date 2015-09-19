
if (Meteor.isServer) {


  Meteor.publish('userCards', function() {
    return UserCards.find({
      $or: [
        { private: false },
        { owner: this.userId }
      ]
    });
  });

  Accounts.onCreateUser(function(options, user) {
    if (options.profile)
        user.profile = options.profile;
    user.profile.github_accessToken = user.services.github.accessToken;
    return user;
  });
}
