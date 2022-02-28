const postModels = require("../models/post.models");
const PostModel = require("../models/post.models");
const UserModel = require("../models/user.models");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.readPost = (req, res) => {
  postModels.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get Data: " + err);
  }).sort[{ createdAt: -1 }];
};
module.exports.createPost = async (req, res) => {
  let fileName;

  if (req.file != null) {
    try {
      if (
        req.file.detectedMimeType != "image/jpg" &&
        req.file.detectedMimeType != "image/png" &&
        req.file.detectedMimeType != "image/jpeg"
      )
        throw Error("invalid file");

      if (req.file.size > 500000) throw Error("max size");
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(201).json({ errors });
    }
    const fileName = req.body.posterId + Date.now() + ".jpg";

    pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/posts/${fileName}`
      )
    );
  }

  const newPost = new postModels({
    ...req.body, //plus simple que de tout destructurer
    /*    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file != null ? "./uploads/posts/" + fileName : "",
    video: req.body.video,
    likers: [],
    Comments: [], */
  });

  try {
    const post = await newPost.save();
    return res.status(201).json(post);
  } catch (err) {
    return res.status(400).send(err);
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

  PostModel.findByIdAndDelete(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
};

//////////////LIKE UNLIKE////////////
module.exports.likePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  try {
    PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true },
      (err, docs) => {
        if (err) return res.status(400).send(err);
      }
    );
    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(400).send(err);
  }
};
module.exports.unLikePost = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  try {
    PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true },
      (err, docs) => {
        if (err) return res.status(400).send(err);
      }
    );
    UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(400).send(err);
  }
};

//////////////////////////comment/////////////////////
module.exports.commentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          //push dans tableau comments
          comments: {
            ...req.body,
            timestamp: new Date().getTime(),
            /* commenterId: req.body.id,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime(), */
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(404).send(err);
  }
};
module.exports.editCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  try {
    return PostModel.findById(req.params.id, (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      );
      if (!theComment) return res.status(404).send("Comment not found");
      theComment.text = req.body.text;

      return docs.save((err) => {
        if (!err) return res.status(200).send(docs);
        return res.status(500).send(err);
      });
    });
  } catch (err) {
    return res.status(404).send(err);
  }
};
module.exports.deleteCommentPost = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    //params == parametre passé dans l'url
    return res.status(400).send("Unknow ID: " + req.params.id);

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId,
          },
        },
      },
      {
        new: true,
      },
      (err, docs) => {
        if (!err) return res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(400).send(err);
  }
};
