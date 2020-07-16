const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Person = mongoose.model("myPerson");
const Key = require("../setup/myurl");


var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken("JWT");
opts.secretOrKey = Key.secret;
// opts.ignoreExpiration = true;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        Person.findById(jwt_payload.id)
        .then(person => {
            if(person){
                return done(null, person)
            }
            else{
                return done(null, false)
            }
        })
        .catch(err => console.log(err) )
        })
   );
};