const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
// req.headers.authorization
// console.log(req.headers);
try {

  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");
  
    // Chercher dans la BDD le user qui possède ce token
    const user = await User.findOne({ token: token });
    // console.log(user);
    if (user) {
      // Ajouter une clé user à l'objet req qui contient les informations du user
      req.user = user;
      // console.log(req.user);
      return next();

    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }

} catch (error) {
  return res.status(400).json({ message: error.message });
}


}

module.exports = isAuthenticated;