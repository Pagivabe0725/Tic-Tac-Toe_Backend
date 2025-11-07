import DATABASE from '../database/database.js'

const signUp = async (req, res, next) => {
  const body = req.body;

  if (!body.email || !body.password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const newUser = await DATABASE.userCreator(body.email, body.password);
    return res.status(201).json({ userId: newUser.dataValues.userId });
  } catch (error) {
    error.statusCode = 400;
    return next(error);
  }
};


const checkSession = async (req, res, next) => {

  if (!req.session.userId) {
    const error = new Error('User is not logged in!')
    error.statusCode = 401
    next(error)
  }

  try {
    const user = await DATABASE.getUserByidentifier(req.session.userId);
    const {password,...result} = user.dataValues
    return res.json({ user: result });
  }
  catch(error){
    if(!error.statusCode){
      error.statusCode = 500
    }
    next(error)
  }

};

const login = async (req, res, next) => {
  console.log('login')
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    const user = await DATABASE.authenticateUser(email, password);
    
    req.session.userId = user.userId;
    req.session.userExpire = Date.now() + 1000 * 60 * 60 * 48

    return res.status(200).json({ user: user});
  } catch (error) {
    if(!error.statusCode){
      error.statusCode = 500
    }
    next(error)
  }
};

const logout = (req, res, next) => {
  if (!req.session ) {
    const error = new Error('Session does not exist');
    error.statusCode = 400;
    return next(error);
  }
  else if(!req.session.userId){
    const error = new Error('Session does not contain userId');
    error.statusCode = 400;
    return next(error);
  }


  delete req.session.userId;
  delete req.session.userExpire


  
    res.status(200).json({message: 'logout was success'})
};


const isUsedEmail = async (req, res, next ) =>{

  const {email} = req.body

  if(!email){
    const error = new Error('Email is undefined!')
    return next(error)
  }

  const result = await DATABASE.isUsedEmail(email)
  res.status(200).json({result: result})

}
  

export default { 
    signUp,
    checkSession,
    logout,
    login,
    isUsedEmail,
}