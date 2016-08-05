var path    = process.cwd();
var controller= require(path+'/controller/main.js');
var objcontroller;

module.exports= function(app,io){
    
    objcontroller= new controller(io);
       
        app.post('/login',objcontroller.login);
        
        app.get('/favicon.ico',objcontroller.requiresession);//rute for '/'
        app.post('/favicon.ico',objcontroller.searchbooks);
        
        app.get('/logout',objcontroller.logout);
        app.get('/getallbook',objcontroller.getallbooks);
        app.get('/getMyBooks',objcontroller.getMyBooks);
        
        app.post('/addBook',objcontroller.addbook);
        app.post('/trade',objcontroller.trade)
        app.post('/update',objcontroller.update)
};