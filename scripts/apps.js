var callCenter = angular.module('callCenter', ["ui.router", "firebase", "ngGrid"])
    callCenter.config(function($stateProvider, $urlRouterProvider){
      
      $urlRouterProvider.otherwise("/login")
      
      $stateProvider
        .state('home.route1', {
            url: "/home/route1",
            templateUrl: "html/route1.html"
         })
        //   .state('route1.route2', {
        //       url: "/route2",
        //       templateUrl: "html/route1.step2.html",
               
        //   })
        //   .state('route1.route2.router3', {
        //       url: "/router3",
        //       templateUrl: "html/route1.step2.step3.html",
        //   })
        // .state('route2', {
        //     url: "/route2",
        //     templateUrl: "html/route2.html"
        // })
        // .state('route2.step1', {
        //     url: "/route2/step1",
        //     templateUrl: "html/route2.step1.html"
        // })
        // .state('route2.step2', {
        //     url: "/route2/step2",
        //     templateUrl: "html/route2.step2.html"
        // })
        .state('home', {
            url: "/home",
            templateUrl: "html/products.html"
        })
        .state('route3', {
            url: "/route3",
            templateUrl: "html/route3.html"
        })
         .state('leads', {
            url: "/leads",
            templateUrl: "html/leads.html",
            controller: 'gridCtrl'
        })
         .state('login', {
            url: '/login',
            templateUrl: '/html/login.html',
            controller: 'LoginCtrl'
        })
        //   .state('route2.list', {
        //       url: "/list",
        //       templateUrl: "route2.list.html",
        //       controller: function($scope){
        //         $scope.things = ["A", "Set", "Of", "Things"];
        //       }
        //   })
    });

      callCenter.controller("LeadsCtrl", function($scope, $firebase, $http, $rootScope) {
        var ref = new Firebase("https://callcenter.firebaseio.com/Company/Leads");
        var sync = $firebase(ref);
        $scope.leads = sync.$asArray();

        $scope.addLead = function(lead) {
          $scope.leads.$add(lead);
          
        };

        $http({
          method: 'get',
          url: '/getToken'
        }).then(function(data){
          twilioStuff(data.data);
        }, function(data){
          console.log('there was an error');
        })

        var twilioStuff = function(token){
              Twilio.Device.setup(token);
  
              var connection=null;

              Twilio.Device.incoming(function (conn) {
                if (confirm('Accept incoming call from ' + conn.parameters.From + '?')){
                  $scope.fromNumber = conn.parameters.From;
                  for(var i = 0; i < $scope.leads.length; i++){
                    if($scope.leads[i].phone === $scope.fromNumber){
                      $scope.$apply(function(){
                        $scope.personCalling = $scope.leads[i];
                      })
                    } else {
                      console.log('That number is not found');
                    }
                  }
                  connection = conn;
                  conn.accept();
                } else{
                  connection=conn;
                  conn.ignore();
                }
              });

              // Register an event handler for when a call ends for any reason
              Twilio.Device.disconnect(function(connection) {
                // $('#hangup').click(function() {
                  Twilio.Device.disconnectAll();   
                // })
              });

              $("#call").click(function() {  
                params = { "tocall" : $('#tocall').val()};
                connection =  Twilio.Device.connect({
                  CallerId:'+18012279533', // Replace this value with a verified Twilio number:
                                        // https://www.twilio.com/user/account/phone-numbers/verified
                  PhoneNumber:$('.form-control').val() //pass in the value of the text field






                });
              });

              $.each(['0','1','2','3','4','5','6','7','8','9','star','pound'], function(index, value) { 
                $('#button' + value).click(function(){ 
                  if(connection) {
                      if (value=='star')
                          connection.sendDigits('*')
                      else if (value=='pound')
                          connection.sendDigits('#')
                      else
                          connection.sendDigits(value)
                      return false;
                  } else {
                   $('#toCall').val($('#toCall').val() + value)
                  } 
                  });
              });
        }


      

      });

      callCenter.controller('gridCtrl', function($scope) {
          $scope.gridOptions = { data: 'leads',
            height: '110px',
            sortInfo: {fields: ['Name', 'Phone', 'Location', 'notes'], directions: ['asc']},
            columnDefs: [
              {field: 'name', displayName: 'Name', width: '150px'},
              {field: 'phone', displayName: 'Phone', width: '110px'},
              {field: 'email', displayName: 'Email', width: '200px'},
              {field: 'location', displayName: 'Location', width:'300px'},
              {field: 'notes', displayName: 'Notes', width:'375px'},
            ]

      };


  callCenter.controller('LoginCtrl', function ($scope, EnvironmentService) {
    $scope.env = EnvironmentService.getEnv();
  });

      });
