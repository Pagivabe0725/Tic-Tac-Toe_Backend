const heartBeat = (req, res, next) => {
  if (!req.session || !req.session.cookie?.expires) {
    return next();
  }

  const now = Date.now();
  const expiresAt = new Date(req.session.cookie.expires).getTime();
  const halfHour = 1000 * 60 * 30;
  const oneHour = 1000 * 60 * 60;
  const timeLeft = expiresAt - now;
  
  if (timeLeft >= halfHour) {
    return next();
  }

  const newExpiration = new Date(now + oneHour);
  req.session.cookie.expires = newExpiration;

  return req.session.save(error => {
    if (error) {
      return next(error);
    }
    return next();
  });
};


const logoutIfExpired = (req, res, next) => {

  console.log(req.session.userId)

  if(!req.session || ! req.session.userExpire || !req.session.userId){
    return next()
  }

  const now = Date.now()
  const userExpire =req.session.userExpire

  if(now >= userExpire){
    delete req.session.userId
    delete req.session.userExpire
    return req.session.save( (error) =>{
      if(error){
        return next(error)
      }
      return next()
    })
  }
  else{
    return next()
  }
}

export default {
  heartBeat,
  logoutIfExpired
}
