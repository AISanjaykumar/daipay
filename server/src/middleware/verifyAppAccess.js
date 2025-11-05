// middleware/verifyAppAccess.js
export const verifyAppAccess = (req, res, next) => {
  try {
    const appSecret = req.headers["x-app-secret"];

    // Compare header secret with server-side .env value
    if (!appSecret || appSecret !== process.env.APP_SECRET) {
      return res
        .status(403)
        .json({ message: "Access denied: Forbidden", status: 403 });
    }

    next();
  } catch (err) {
    console.error("App access verification failed:", err.message);
    return res.status(403).json({ message: "Access denied." });
  }
};
