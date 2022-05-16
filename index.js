const express = require('express')
const app = express()
const port = 3000

const config = require('./config/key')
const cookieParser = require('cookie-parser')

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI
).then(() => console.log('MongoDB connected...'))
 .catch(err => console.log(err))

const { User } = require('./models/User');
const bodyParser = require('body-parser'); //body 데이터를 parse 해서 req.body 로 출력

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// application/json
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Hello World~!')
})

app.post('/register', (req, res) => {

  //회원 가입할 때 필요한 정보들을 client 로부터 받고 db 에 넣어줌

  const user = new User(req.body)

  
  user.save((err, userInfo) => {
    if(err) return res.json({ success: false, err})

    return res.status(200).json({
      success: true
    })
  })

})

app.post('/login', (req, res) => {
  //1. 요청된 이메일 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    
    //2. 이메일이 있다면 비밀번호 같은지 확인
    user.comparePassword(req.body.password , (err, isMatch) => {
      if(!isMatch) return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다"
      })
      console.log("ismatch", isMatch)
      //3. 비밀번호 까지 맞다면 token 생성하기
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err);

        // token을 저장. 쿠키, 로컬스토리지 등등
        res.cookie("x_auth", user.token)
        .status(200)
        .json({
          loginSuccess: true,
          userId: user._id
        })

      })
    })
  })

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})