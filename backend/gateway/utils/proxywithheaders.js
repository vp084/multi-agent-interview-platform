import proxy from "express-http-proxy";

export const proxyWithHeaders = (serviceUrl) => {
    return proxy(
        serviceUrl,
        {
            proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
                if (srcReq.user) {
                    const uid = srcReq.user.userId || srcReq.user._id;
                    if (uid) {
                        proxyReqOpts.headers["x-user-id"] = uid.toString();
                    }
                }
                return proxyReqOpts;
            },
            proxyErrorHandler: (err, res, next) => {
                console.error("Gateway Proxy Error:", err);
                next(err);
            }
        }
    );
};

export const proxywithHeaders = proxyWithHeaders;