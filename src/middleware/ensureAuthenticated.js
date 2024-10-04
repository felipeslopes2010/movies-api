const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers;

    if (!authHeader.cookie) {
        throw new AppError("JWT não informado", 401);
    }

    const [, token] = authHeader.split("token=");
    
    try {
        const { sub: user_id } = verify(token, authConfig.jwt.secret);

        request.user = {
            id: Number(user_id),
        };

        return next();
    } catch {
        throw new AppError("JWT inválido", 401);
    }
}

module.exports = ensureAuthenticated;