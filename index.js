var express= require('express');
var app=express();
var mysql=require('mysql');
var bodyParser=require('body-parser');
var session=require('express-session');

app.set('view engine','ejs');

app.use(express.static(__dirname + '/public'))

app.use(function(req,res,next){
    res.set('Cache-control','no-cache,private,must-revalidate,no-store');
    next();
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//db connection
var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'node' //nom du base de données
});

conn.connect(function(err){
    if(err) throw err;
    console.log("Connected....");
});

app.get('/', function(req,res){
    res.render('signup');
});

app.post('/signup',function(req,res){
    var name=req.body.name;
    var email=req.body.email;
    var password=req.body.password;

    var sql=`insert into users(user_name,user_email,user_password) values('${name}','${email}','${password}')`;
    conn.query(sql,function(err,result){
        if(err) throw err;
        //res.send ("<h1>User successfully register...</h1>");
        res.redirect('/select');
    });
});

app.get('/login',function(req,res){
    res.render('login');
});

app.post('/login',function(req,res){
    var email=req.body.email;
    var password=req.body.password;
    if(email && password){
        var sql=`select * from users where user_email='${email}' AND user_password='${password}'`;

        conn.query(sql,function(err,results){
            if(results.length>0){
                req.session.loggedin=true;
                req.session.email=email;
                res.redirect('/select');
            }else{
                res.send ("<h1>Incorrect email or password</h1>");
            }
        })
    }
    else{
        res.send ("<h1>Please, enter email or password!</h1>"); 
    }
});



app.get('/welcome', function (req,res,next) {
    res.render('welcome',{user:`${req.session.email}`});
});


app.get('/select', function (req,res,next) {
    conn.query('SELECT * FROM article', function(err,rs) {
       res.render('select', {books:rs});
    });
});

app.get('/form', function (req,res,next) {
    res.render('form', { liste: {} });
});

app.post('/form', function (req,res,next) {
    conn.query('INSERT INTO article SET ?', req.body, function (err, rs) {
        //res.send('insert success');
        res.redirect('/select')
    })
})

app.get('/delete', function(req,res,next) {
     conn.query('DELETE FROM article WHERE id= ?', req.query.id, function(err, rs) {
         res.redirect('/select');
     })
});

app.get('/edit', function (req,res,next) {
    conn.query('SELECT * FROM article WHERE id = ?', req.query.id, function (err, rs) {
        res.render('form', {liste: rs[0] });
    })
});

app.post('/edit', function (req,res,next) {
    var param = [
        req.body,
        req.query.id
    ]
    conn.query('UPDATE article SET ? WHERE id = ?', param, function (err, rs) {
        res.redirect('/select');
    })
})

app.get('/logout',function(req,res){
    req.session.destroy((err)=>{
        res.redirect('/login');
    })
});

var server=app.listen(3001,function(){
    console.log("go to part number 3001");
});

//module.exports = router;
