const express=require ("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const { body, validationResult } = require('express-validator');
var msg="";
const app=express();
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://127.0.0.1:27017/innerveDb",{useNewUrlParser:true});
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
    res.render("ticket");
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
                {
                    if(response===true)
                    {
                        res.render("registered",{name:foundUser.Name, college:foundUser.College});
                    }
                }
                )
            }
        }
    })
})
app.post("/register",
[
    body("email").isEmail(),
    body('password').isLength({ min:6 })
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
app.listen(3000,()=>
{
    console.log("Port:3000");
});