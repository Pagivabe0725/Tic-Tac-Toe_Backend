/**
 * Automatically refreshes the session expiration time.
 *
 * - If the session is missing or has no expiration → nothing happens.
 * - If more than 30 minutes are left before expiration → nothing happens.
 * - If less than 30 minutes are left → the expiration is extended by 1 hour.
 *
 * This ensures that active users do not get logged out unexpectedly due to the
 * session cookie expiring soon.
 */
const heartBeat = (req, res, next) => {
  if (!req.session || !req.session.cookie?.expires) {
    return next();
  }

  const now = Date.now();
  const expiresAt = new Date(req.session.cookie.expires).getTime();
  const halfHour = 1000 * 60 * 30;
  const oneHour = 1000 * 60 * 60;
  const timeLeft = expiresAt - now;

  // Session still has enough time left → no need to extend it
  if (timeLeft >= halfHour) {
    return next();
  }

  // Extend the session expiration by 1 hour
  const newExpiration = new Date(now + oneHour);
  req.session.cookie.expires = newExpiration;

  return req.session.save(error => {
    if (error) {
      return next(error);
    }
    return next();
  });
};


/**
 * Logs the user out if their custom user expiration time has passed.
 *
 * Some applications track a separate per-user expiration timestamp.
 * If this timestamp is exceeded:
 *   - the stored user ID is removed from the session
 *   - the custom expiration timestamp is also removed
 *   - the updated session is saved
 *
 * If the timestamp has not yet expired, request processing continues normally.
 */
const logoutIfExpired = (req, res, next) => {
  if (!req.session || !req.session.userExpire || !req.session.userId) {
    return next();
  }

  const now = Date.now();
  const userExpire = req.session.userExpire;

  // If the user-specific expiration time has passed → log out
  if (now >= userExpire) {
    delete req.session.userId;
    delete req.session.userExpire;

    return req.session.save(error => {
      if (error) {
        return next(error);
      }
      return next();
    });
  }

  // Not expired → continue
  return next();
};

export default {
  heartBeat,
  logoutIfExpired
};
