var request         = require('request');
var Users           = require('../model/users');
var Book            = require('../model/books');
var sess;


module.exports= function(io){
    
    
    io.on('connection', function(socket){
            
              
            
            socket.on('sendEmail',function(data){
                
               
                Users.find({email:data.email},function(err,doc){
                    
                    var existe = 'no existe';
                    
                        if(doc.length == 1){
                            
                            
                            
                            if(doc[0].email == data.email){
                                existe='existe';
                            }
                    
                        }
                        
                        console.log(existe);
                        socket.emit('result',{exist:existe});    
                });
                 
                
            });
                
    
    
            socket.on('register',function(dataToRegister){
                
             
                var newUser = new Users(dataToRegister);
              
                newUser.save(function(err,doc){
                    console.log('new user '+doc);
                });
                
            });
    
        
    });
    
    
    this.addbook= function(req,res){
       
        
        sess    = req.session;
        var img = req.body.image;
        var id  = req.body.idBookP;
        var name= req.body.name;
        var user= sess.sessionuser;
        
        if(sess.sessionuser == undefined){
                     return res.send('tienes que loguearte')
                 }
           
        Book.find({id:req.body.idBookP},function(err,doc){
             
            if(doc.length > 0){
                 
                 doc.forEach(function(book){
                    
                    if(book.emailUser==sess.sessionuser){
                     
                    
                     return res.send('exist')
                    
                     }else{
                        
                         if(book.toTrade==1){
                           return newBook(id,name,user,img,1,book.userReqT);
                           
                         }
                         else{
                          return newBook(id,name,user,img,0);
                         
                             
                         }
                    
                        
                    }
                    
                     
                 })
                 
             res.send('added')
                
            }else{
                     newBook(id,name,user,img,0);
                      res.send('added')
                 }
                
                
               
        });
       
        
             
    };
    
    function newBook(id,name,emailUser,img,toTrade,userReq){
        
        var addBook= {
                        id          :id,
                        name        :name,       
                        toTrade     :toTrade,
                        emailUser   :emailUser,
                        img         :img,
                        userReqT    :userReq
                    };
            
        var newBook = new Book(addBook);
        
        newBook.save(function(err,doc){
            console.log('new book: '+doc);
        }); 
    }
    
    
    this.getallbooks= function(req,res){
        
        getBooksById('all',req.session.sessionuser,res);
    };
    
    
    this.getMyBooks= function(req,res){
        
        getBooksById('myBooks',req.session.sessionuser,res);  
        
    };
    
    
    
     function getBooksById(myAll,user,response){
        
        if(myAll=='myBooks'){
           
             Book.find({emailUser:user},callback);//find only my books
           
           // Book.remove({},function(err,doc){})
           
        }else{
                   
             Book.find({},callback); //find all books
        }
                
        
        
        function callback(err,allBooks){
         
            var idBookRepeat    = [];
            var docBooksTrades  = {};
            var noMyTrades      = 0;
            var noTradesForMe   = 0;
            var allImgBook      = [];
            var idRepeat        = [];
            var ow              = 'no';
            
            //finding all books of the user, or all  if the user is not logged
            
            
            
            allBooks.forEach(function(value){
                
                if(user != undefined){
                    ow = value.emailUser;
                  
                }
               
               //erase all repeated books
               
                if(idRepeat.indexOf(value.id) == -1){
                    
                    allImgBook.push({
                        
                          owner: ow,
                             id: value.id,
                            img: value.img,
                           name: value.name,
                        toTrade: value.toTrade,
                       userReqT: value.userReqT
                    
                        });
                        
                    idRepeat.push(value.id);   
                }
                
            });
            
            
                //counting  my trades
                
                Book.find({toTrade:1,userReqT:user},function(err,doc){
                   
                   
                   doc.forEach(function(book){
                       
                       if(idBookRepeat.indexOf(book.id) == -1){
                           noMyTrades++;
                       }
                       
                       idBookRepeat.push(book.id);
                    });
                    
                    
                  
                    idBookRepeat = [];
                    
                 //counting all trades     
                    
                    Book.find({toTrade:1,userReqT:{$ne: user}},function(err,docTwo){
                    
                        docTwo.forEach(function(booktwo){
                       
                            if(idBookRepeat.indexOf(booktwo.id) == -1){
                                noTradesForMe++;
                            }
                       
                            idBookRepeat.push(booktwo.id);
                        });
                   
                        docBooksTrades = {
                            noMyTrades      : noMyTrades,
                            noTradesForMe   : noTradesForMe
                            
                        };
                        
                        response.send([allImgBook,docBooksTrades,user]);
                        
                   
                    });          
                                      
                }); 
                
                
                
                
         
          
        }
    }
       
      
      
      
       
    this.trade=function(req,res){
       
       var user         = req.session.sessionuser;
       var idBook       = req.body.bookId;
       var accion       = req.body.accion;
       var update       = {};
       var conditions   = {};
       var name         = req.body.name;
       var img          = req.body.img;
       
       
        
        
        if(accion=='acept'){
            
            //if already have this book then dont add
            
            Book.find({id:idBook, emailUser:user},function(err,book){
                
                if(book.length>0){
                    
                   fnUpdate(0,'');
                   res.send('have')
                }else{
                    
                    fnUpdate(0,'');
                    newBook(idBook,name,user,img,0);
                    res.send('add');
                }
            })
        }
        
        else if(accion=='trade'){
           
          // Book.remove({},function(err,doc){})
           fnUpdate(1,user); // the user request the trade
           
           
        }
        
        else {
            
            fnUpdate(0,'');
        }
        
        function fnUpdate(n,userReq){
            
            conditions   = {id:idBook};
            update       = {toTrade: n,userReqT:userReq};
            
            
            
            Book.update(conditions, update,{multi:true}, function(err,numAffected){
                   console.log(numAffected);
            });

        }
     
    };   
        
        
    
    
  
    
    
    
    this.logout= function(req,res){
        
        req.session.destroy(function(err) {
                if(err) {
                    
                    console.log(err);
                 
                } else {
        
                    res.redirect('/#/');
                }
        });
    };
    
    
    
    this.requiresession= function(req,res){
       
        sess= req.session;
        res.send(sess);
        
    };
    
    
    this.login=function(req,res){
        
        var emailDigitado   = req.body.user;
        var pass            = req.body.pass;
        var login           = {};
       
       
        Users.find({
            email:emailDigitado
        },function(err,doc){
            
            if(doc.length>0){
                 
               
                if(doc[0].password==pass){
                     
                    sess               = req.session;
                    sess.sessionuser   = emailDigitado;
                    sess.nameUser      = doc[0].name;        
                    
                    login={
                        loginS  :'loginSuccefully',
                        user    : sess.nameUser
                        } 
                    res.send(login);
                }
                
                else{
                   
                    res.send('no encontrado');
                }
               
                
                
            }else{
                 console.log(' email no encontrado ');
                 res.send('no encontrado');
            }
           
        });
        
        
    };
    
    
    
    this.searchbooks= function(req,res){
 

        var inputbook   = req.body.inputbooks;
        var item        = [];
        var key         = 'AIzaSyAP85X2XNr9txP4ey8GwVcj_qqsp3s_stk';
        
        request('https://www.googleapis.com/books/v1/volumes?q='+inputbook+'&key='+key, function (error, response, body) {
            
            if (!error && response.statusCode == 200) {
  
                var r=JSON.parse(body);
  
  
  
                r.items.forEach(function(value){
                    var str;
                    var im;
                    var resdescrip  ='Description no available';
                    var img         ='Image no available';
                    var title       ='Title no available';
                    var t           =''; 
                    var ob          = value.volumeInfo;
                    var id          = value.id;
                    
      
                    if(ob.imageLinks){
                        im= ob.imageLinks.smallThumbnail; 
                        img = im.replace("http", "https");
                    }
   
                    if(ob.description){
                        str=value.volumeInfo.description;
                        resdescrip = str.substr(0,200)+'...';
                    }
   
    
                    if(ob.title){
                        t=value.volumeInfo.title;
                        title=t.substr(0,30)+'...';
                    }  
      
                    item.push({
                        id:id,
                        description: resdescrip,
                        img: img,
                        title:title
                    });  
      
      
                });
                    
                    res.send(item);
    
            }
        });
  
    };
    
     
    this.update = function(req,res){
        
        sess      = req.session;
        var user  = sess.sessionuser;
        
        var name  = req.body.name;
        var city  = req.body.city;
        var state = req.body.state;
        
        var    conditions   = {email:user};
        var    update       = {name:name,city:city,state:state};
            
        
        Users.update(conditions, update, function(err,numAffected){
            console.log('user sucefully updated! '+numAffected);
        });
        
        
    }
               
   
};   
   

