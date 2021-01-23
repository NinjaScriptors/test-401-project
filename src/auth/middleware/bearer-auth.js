'use strict';

const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    try {
        if (authorization) {
            const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
            jwt.verify(
                token,
                process.env.SECRET || 'somethingsecret',
                (err, decode) => {
                    if (err) {
                        res.status(401).send({ message: 'Invalid Token' });
                    } else {
                        req.user = decode;
                        next();
                    }
                }
            );
        } else {
            res.status(401).send({ message: 'No Token' });
        }

    }
    catch (e) {
        console.log(e);
    }
};

module.exports = isAuth;