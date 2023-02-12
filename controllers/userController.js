const { User, Thought } = require("../models");

const userController = {
  async getAllUser(req, res) {
    try {
      const dbUserData = await User.find({})
        .populate({
          path: "friends",
          select: "-__v",
        })
        .select("-__v")
        .sort({ _id: -1 });

      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  },
  // get one user by id

  async getUserById({ params }, res) {
    try {
      const dbUserData = await User.findOne({ _id: params.id })
        .populate({
          path: "thoughts",
          select: "-__v",
        })
        .populate({
          path: "friends",
          select: "-__v",
        })
        .select("-__v");

      if (!dbUserData) {
        return res.status(404).json({ message: "No user found with this id!" });
      }
      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  },
  // create user

  async createUser({ body }, res) {
    try {
      const dbUserData = await User.create(body);
      res.json(dbUserData);
    } catch (err) {
      res.json(err);
    }
  },
  // update user by id

  async updateUser({ params, body }, res) {
    try {
      const dbUserData = await User.findOneAndUpdate({ _id: params.id }, body, {
        new: true,
        runValidators: true,
      });

      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id!" });
        return;
      }

      res.json(dbUserData);
    } catch (err) {
      res.json(err);
    }
  },
  // delete user
  async deleteUser({ params }, res) {
    try {
      const dbUserData = await User.findOneAndDelete({ _id: params.id });
      if (!dbUserData) {
        return res.status(404).json({ message: "No user with this id!" });
      }

      await Thought.deleteMany({ _id: { $in: dbUserData.thoughts } });
      res.json({ message: "User and associated thoughts deleted!" });
    } catch (err) {
      res.json(err);
    }
  },
  // add friend
  async addFriend({ params }, res) {
    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: params.userId },
        { $addToSet: { friends: params.friendId } },
        { new: true, runValidators: true }
      );

      if (!dbUserData) {
        return res.status(404).json({ message: "No user with this id" });
      }

      res.json(dbUserData);
    } catch (err) {
      res.json(err);
    }
  },
  // delete friend
  async removeFriend({ params }, res) {
    try {
      const dbUserData = await User.findOneAndUpdate(
        { _id: params.userId },
        { $pull: { friends: params.friendId } },
        { new: true }
      );

      if (!dbUserData) {
        throw new Error("No user with this id!");
      }

      res.json(dbUserData);
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
    }
  },
};
module.exports = userController;
