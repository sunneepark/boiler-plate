const mongoose = require('mongoose')

const bcrypt = require('bcrypt');
const saltRounds = 10; //salt 를 이용해서 비밀번호 암호화
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //스페이스를 없애주는
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 동작이 끝나면 next 로 넘어감
userSchema.pre('save', function(next){

    //비밀번호 암호화
    //https://www.npmjs.com/package/bcrypt
    
    var user = this;
    if(user.isModified('password')) { //비밀번호가 변경될 때만
        
        // 1. salt 생성 -> 2. salt 로 hash 값 만들기
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                // Store hash(암호화된 비밀번호) in your password DB.
                if(err) return next(err)
                user.password = hash //hash로 비밀번호를 바꿔줌
                next()
            });
        });

    }else{
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, callback) {
    
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return callback(err)
        callback(null, isMatch)
    })
}

userSchema.methods.generateToken = function(callback) {
    //jsonwebtoken 이용해서 token 생성
    //https://www.npmjs.com/package/jsonwebtoken

    var user = this;

    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token
    user.save(function(err, user){
        if(err) return callback(err)
        callback(null, user)
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User } //다른 파일에서도 사용할 수 있게 만듬