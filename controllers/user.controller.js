const { findOneAndUpdate } = require("../models/user.models");
const UserModel = require("../models/user.models");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  //select('-CE QUI NE DOIT PAS APPARAITRE') si pas de -, on peut choisir ce qui apparait avec ("choix 1 choix 2 etc...")
  res.status(200).json(users);
};

module.exports.userInfo = async (req, res) => {
  //on verifie que l'id existe ou non
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);
  //si id n'existe pas, retour res400
  //sinon on verifie qu'il n'y a pas d'erreur en allant récupérer les info
  //si pas d'erreur, on récupère la data (docs) en json, sinon on renvois une erreur
  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else log("Unknown ID : " + err);
  }).select("-password");
};

module.exports.updateUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        if (err) return res.status(500).send({ message: err });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    UserModel.remove({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Successfully deleted!" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    //add to the followerlist
    UserModel.findByIdAndUpdate(
      req.params.id,
      //on prend l'array de celui qui follow et on lui rajoute l'id du following idToFollow
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        else return res.status(400).json(err);
      }
    );
    //add to followinglist
    UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true },
      (err, docs) => {
        //if (!err) res.status(201).json(docs);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  )
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    //take out of the followerlist
    UserModel.findByIdAndUpdate(
      req.params.id,
      //on prend l'array de celui qui follow et on lui retire l'id du following idToUnfollow
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        else return res.status(400).json(err);
      }
    );
    //add to followinglist
    UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true },
      (err, docs) => {
        //if (!err) res.status(201).json(docs);
        if (err) return res.status(400).json(err);
      }
    );
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
