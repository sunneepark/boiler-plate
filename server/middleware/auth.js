const { User } = require("../models/User");

let auth = (req, res, next) => {
    //인증 처리를 하는 middleware
    //1. 클라이언트 쿠키로부터 token 가져오기
    let token = req.cookies.x_auth;

    //2. token 복호화 한후, user id 가 있는지 찾음.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user) return res.json({isAuth:false, error:true})

        req.token = token;
        req.user = user;
        next();
    })

}

module.exports = { auth };
