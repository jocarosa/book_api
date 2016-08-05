var app= angular.module('myapp',['angularModalService', 'ngAnimate','ngRoute'])

//route
.config(['$routeProvider',function($routeProvider) {
    $routeProvider
      .when('/allbooks', {
        templateUrl : 'find/showAllMy.html',
        controller  : 'controlador'
      }).when('/mybooks', {
        templateUrl : 'find/showAllMy.html',
        controller  : 'controlador'
      })
      .when('/',{
        templateUrl : 'find/inputbook.html',
        controller  :'controlador'
      });
      
}])

//filter for the books to trade

.filter('filterBooks',function(){
    
    return function(libro,userlog){
      
        var activeLink = 'trade';
        
        if(userlog[2] == libro.userReqT & libro.toTrade == 1){
            activeLink='Cancel Trade x';
        }
        
        //if the owner is not equal to user loggued then accept the trade
        if(userlog[2] != libro.userReqT & libro.toTrade == 1){
            activeLink='Accept Trade √';
        }
       
        return activeLink;
    };
});



app.controller('controlador',function($scope,$http,$rootScope,ModalService,$location){
  
     $http({
        method  : 'GET',
        url     : '/favicon.ico'
     }).then(function successCallback(response) {
        
        var data= response.data;
            
            if(data.sessionuser){
               
                $rootScope.userli       = true;
                $rootScope.showmylink   = true;
                $rootScope.username     = data.nameUser;
            }else{
                $rootScope.userli       = false;
                
            }
        }, function errorCallback(response) {
                console.log('error');
            });
  
   
   
   
    $scope.fnAllMy=function(showMyAll){
      
      
      
        if(showMyAll =='my'){
            
            $http.get('/getMyBooks').success(function(response){
                
                $scope.titleMyAll       = 'mybooks';
                $scope.btnRequest       = true;
                
                $scope.Books            = response;
                $scope.MyRequests       = response[1].noMyTrades;
                $scope.RequestsForMe    = response[1].noTradesForMe;
               
              
                //console.log(response)
          
            });
            
        }else{
            
            $scope.titleMyAll   = 'allbooks';
           
            $http.get('/getallbook').success(function(response){
              
                   $scope.Books             = response;
                   $scope.MyRequests        = response[1].noMyTrades;
                   $scope.RequestsForMe     = response[1].noTradesForMe;
                   $scope.btnRequest        = true;
              
            });
        }
        
    };
    
  
    $scope.linkState = [];
  
    
    
    
    
    $scope.trade=function(index,idBook,name,img){
    
        var accion='';
    
        $http.get('/favicon.ico').success(function(response){
            
            if(!response.sessionuser){return alert('you must be logged!');}
            
           
            
            if($scope.linkState[index] == 'trade'){
                
                
                $scope.linkState[index]     ='Cancel Trade x';
                $scope.MyRequests           = $scope.MyRequests + 1;
                accion                      ='trade';
            
            }
            
            else if($scope.linkState[index] == 'Cancel Trade x'){
                
                $scope.linkState[index]     ='trade';
                $scope.MyRequests           = $scope.MyRequests - 1;
                accion                      ='cancel';
               
            }
            else{
                $scope.linkState[index]     ='trade';
                $scope.RequestsForMe        = $scope.RequestsForMe  -1;
                accion                      ='acept';
                
                
            }    
              
            $http.post('/trade',{bookId:idBook,accion:accion,name:name,img:img}).success(function(response){
                    if(response=='have'){
                        alert('Accepted! but you already this book')
                    }
                    if(response=='add'){
                        alert('Accepted!')
                    }
            });
            
        });
             
              
    };
    
    
    $scope.fnsearch=function(){
        
        var inputbook   =  $scope.book;
        
        $http.post('/favicon.ico',{inputbooks:inputbook}).success(function(response){
          
            
            $scope.respuesta=response;
           
        });
    };
  
  
   function openModal(template){
       
       ModalService.showModal({
            templateUrl : template+".html",
            controller  : "controlleruser"
            }).then(function(modal) {
                modal.element.modal();
            });
   }
   
  
   
   $scope.login= function() {
     
     openModal('modallogin');
    
   };
     
     
     
    $scope.addBook=function(idBook,title,im){
         
         $http.get('/favicon.ico').success(function(response){
            
             if(!response.sessionuser){openModal('modallogin');}
             
             $http.post('/addBook',{idBookP:idBook, name:title,image:im}).success(function(response){
                
                if(response == 'exist'){
                    alert('You already have this book!');
                }
                if(response == 'added'){
                    alert('Book added!');
                }
                
             });
            
         });
    }; 
    
    
    
     $scope.singup = function() {
         
      //opening the modal window for singup
        
       openModal('modalsingup');
    };
    
    $scope.update=function(){
        
        openModal('modalUpdate');
    };
    
    
    
});//end controller 'controlador'
   
   
   
   
   
   
   
   
   
   
   
   
   
   
app.controller('controlleruser',function($scope,close,$http,$rootScope,ModalService,$element){
    
var socket = io.connect(); 

var email1;
var disponible = 'si';
    
    function closeModal(value){
        $element.modal('hide');
        close(value,500);
    }
    
    
    $scope.close=function(){
           closeModal(null);
     };
     
     
     
     
    $scope.validate=function(usertxt,passwordtxt){
    
        $http.post('/login',{user:usertxt, pass:passwordtxt}).success(function(response){
           
           
           if(response.loginS == 'loginSuccefully'){
             
             
             
             //closing modal window
              
             $scope.errmessage  = 'Login correct!';
             closeModal(null);
             
             
             //showing elements from the menu
             
             $rootScope.userli      = true;
             $rootScope.showmylink  = true;
             $rootScope.username    = response.user;
            
            
           
           }else{
               
                $scope.errmessage = 'User or password incorrect';
               
           }
           
           
          
        });
        
        
        
    };
    
    $scope.validateEmail= function(email,emailone){
       
        var txtemail1   = $scope.email;
        var txtemail2   = $scope.emailtwo;
        
        
       
      
        
        //if it is really an email
            if(email){
              
                socket.emit('sendEmail',{
                    email:email    
                });
            
                socket.on('result', function(data){
                   
                    
                  
                    if(data.exist == 'existe'){
                        disponible  = 'emailNo';
                        console.log('disponible '+ disponible);
                        
                    }
                    if(txtemail1 == txtemail2 & disponible == 'si'){
        
                            $scope.valid = true;
                    }
                    else{
        
                            $scope.valid = false;
                    } 
                    
                  
                    
                });   
            }
        
        };
        
      
    $scope.validName=function(){
       
        var txtname      = $scope.name;
        $scope.namevalid = true;
        
        if(txtname == undefined){
            $scope.namevalid = false; 
        }
    };
    
    $scope.validatePass= function(){
        
        var password     = $scope.password;
        var password2    = $scope.password2;
        $scope.validpass = false;
        
        if(password != undefined || password2 != undefined){
            
            if(password == password2){
                
                $scope.validpass = true;  
                
                
            }   
        }
    
    };
   
    
    
    $scope.register=function(){
        
        //after validate all the input fields of modalsingup and all are correct then register
        
        if($scope.validpass & $scope.valid & $scope.namevalid){
           
            $scope.msgRegister = 'Registered!';
            
            socket.emit('register',{
                    name:   $scope.name,
                   email:   $scope.email,
                password:   $scope.password
            });
            closeModal(null);
        }
        else{
            
            var correodisponible = '';
            
            if(disponible == 'emailNo'){
                
                correodisponible = '  this email is allready registered!';
                
            }
            
            $scope.msgRegister = 'Please fill the fields correctly'+correodisponible;
        }
        
    };
    
    $scope.updating= function(name,city,state){
        
        if(name !=undefined & city !=undefined & state!=undefined){
            closeModal(null);
            $http.post('/update',{name:name,city:city,state:state}).success(function(response){})
            alert('succefully updated! see the changes in the next login')
        }
        
        
      
      
      
    };
    
});
