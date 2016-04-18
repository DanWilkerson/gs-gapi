var express = require('express');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var app = express();

// GOOGLE PARAMETERS
var clientId = ''; // Enter Client ID from Developers Console here
var clientSecret = ''; // Enter Client Secret from Developers Console here
var redirectUrl = 'http://localhost:3000/token';

app.set('view-engine', 'ejs');

app.get('/', function(req, res) {

  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  var url = oauth2Client.generateAuthUrl({
    'access_type': 'offline',
    'scope': [
      'https://www.googleapis.com/auth/tagmanager.readonly', 
      'https://www.googleapis.com/auth/analytics.readonly'
    ]
  }); 

  return res.render('index.ejs', {
    url: url
  });

});

app.get('/token', function(req, res) {

  console.log(req.query);

  if(req.query.code) {

    var accessCode = req.query.code;
    var oAuthClient = new OAuth2(clientId, clientSecret, redirectUrl);

    oAuthClient.getToken(accessCode, function(err, tokens) {

      if(err) {
        console.log('something went wrong!!');
        console.dir(err);
        return res.send('ERROR:' + err.message);
      }

      oAuthClient.setCredentials(tokens);

      var gtm = google.tagmanager({
        'auth': oAuthClient,
        'version': 'v1'
      });

      var analytics = google.analytics({
        'auth': oAuthClient,
        'version': 'v3'
      }).data.ga.get;

      //Whatever we want to do here:
      
      console.log(analytics);
      console.log(Object.keys(analytics));
      console.dir(analytics);

      /*
      gtm.accounts.containers.list({accountId: '32084480'}, function(err, accounts) {

        if (err) return res.send(err.message);
        return res.json(accounts);

      });
      */

      analytics({
        'start-date': '2016-03-01',
        'end-date': '2016-03-30',
        'metrics': 'ga:pageviews',
        'ids': 'ga:95017749'
      }, function(err, data) {
        
        if (err) return res.send(err.message);
        return res.json(data);

      });

    });

  } else {

    return res.send('Missing token parameter');

  }
  
});

app.listen(3000, function(err) { 

  if (err) return console.log(err);
  return console.log('Running on port 3000');

});
