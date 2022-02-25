const UserModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const { signUpErrors, signInErrors } = require("../utils/errors.utils");

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.signUp = async (req, res) => {
  //version from scratch plus détaillée
  /*  const {pseudo, email, password}= req.body
  try {
    const user = await UserModel.create({pseudo,email,password}) */

  try {
    const user = await UserModel.create({ ...req.body }); //ecrire ...req.body permet de récupérer tous les éléments du contenu body                                             rapidement sans avoir à faire du destructuring
    res.status(201).json({ user: user._id }); //si ça fonctionne ça nous répond l'id créer
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(200).send({ errors }); // si ca ne marche pas ça renvois l'erreur
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(200).json({errors});
  }
};

module.exports.logOut = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
