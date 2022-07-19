const express=require ("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const dotenv = require("dotenv");
dotenv.config()
const { body, validationResult } = require('express-validator');
const { check } = require('express-validator');
var msg="";
var port=process.env.PORT||3000;
const app=express();
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true});
const registerSchema=new mongoose.Schema(
  {
   Name:String,
   Email:String,
   College:String,
   Year:Number,
   Phone:Number,
   Password:String
  }
);
const Register=mongoose.model("Register",registerSchema);
app.get("/",(req,res)=>
{
    res.render("home");
})
app.get("/register",(req,res)=>
{res.render("register",{msg:msg});

});
app.get("/registered",(req,res)=>
{
    res.render("registered");
})
app.get("/ticket",(req,res)=>
{
    res.render("ticket",{msg:msg});
});
app.post("/ticket",(req,res)=>{
    var Email=req.body.email;
    var Password=req.body.password;
    Register.findOne({Email:Email},(err,foundUser)=>
    {
        if(!err)
        {
            if(foundUser)
            {
                bcrypt.compare(Password,foundUser.Password,(err,response)=>
                {if(err)
                    {
                        console.log(err);
                    }
                    else if(response===false)
                    {
                        msg="wrong password";
                        res.render("ticket",{msg:msg});
                        msg="";
                    }
                    else
                    {
                        res.render("registered",{name:foundUser.Name, college:foundUser.College});
                    }
                }
                )
            }
            else
            {
               msg="Email Not Registered" ;
               res.render("ticket",{msg:msg});
               msg="";
            }
        }
    })
    msg="";
})
app.post("/register",
[//validation process
    body("email").isEmail().notEmpty(),//checking if entered is email
    body('password').isLength({ min:6 })//restricting length of password
    .withMessage('must be at least 6 chars long'),
    check('email').custom(value => {
        return Register.findOne({Email:value}).then(user => {
          if (user) {
            return Promise.reject('E-mail already in use');
          }
        });//checking for unique email
      }),
      body('phone').isLength(10),//phone no. length restriction
      check('phone').custom(value => {
        return Register.findOne({Phone:value}).then(user => {
          if (user) {
            return Promise.reject('Phone No. already registered');
          }
        });//checking for unique phone no.
      }),
    body('name').notEmpty(),
    body('year').notEmpty(),
    body('college').notEmpty()
],(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        msg=errors.array()[0].msg+":"+errors.array()[0].param;
        res.render("register",{msg:msg});
      
    }
    else{
        var saltround=8;
        bcrypt.hash(req.body.password,saltround,(err,hash)=>
        {
            if(!err)
            {
                var password=hash;
                const r=new Register(
                    {
                        Name:req.body.name,
                        Email:req.body.email,
                        College:req.body.college,
                        Year:req.body.year,
                        Phone:req.body.phone,
                        Password:password
            
                    }
                )
                r.save();
                res.redirect("/");
            }})
    }
    msg="";

});
app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });