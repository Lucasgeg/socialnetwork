const postModels = require("../models/post.models");
const PostModel = require("../models/post.models");
const userModel = require("../models/user.models");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readPost = (req, res) => {
  postModels.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get Data: " + err);
  });
};
module.exports.createPost = async (req, res) => {
  const newPost = new postModels({
    ...req.body, //plus simple que de tout destructurer
    /*  posterId: req.body.posterId,
    message: req.body.message,
    video: req.body.video,
    likers: [],
    Comments: [], */
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.statut(400).send(err);
  }
};
module.exports.updatePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  const updatedRecord = {
    message: req.body.message,
  };
  postModels.findByIdAndUpdate(
    req.params.id,
    { $set: updatedRecord },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("update Error: " + err);
    }
  );
};

module.exports.deletePost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  PostModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
};
