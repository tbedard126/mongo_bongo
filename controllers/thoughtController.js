const { Thought, User } = require("../models");

const thoughtController = {
  // get all Thoughts
  async getAllThoughts(req, res) {
    try {
      const dbThoughtData = await Thought.find({})
        .populate({
          path: "reactions",
          select: "-__v",
        })
        .select("-__v")
        .sort({ _id: -1 });
      res.json(dbThoughtData);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  },

  // get one Thought by id

  async getThoughtById({ params }, res) {
    try {
      const dbThoughtData = await Thought.findOne({ _id: params.id })
        .populate({
          path: "reactions",
          select: "-__v",
        })
        .select("-__v");
      if (!dbThoughtData) {
        return res.status(404).json({ message: "did not find that thought" });
      }
      res.json(dbThoughtData);
    } catch (err) {
      console.log(err);
      res.sendStatus(400);
    }
  },
  // create Thought

  async createThought({ params, body }, res) {
    try {
      const thought = await Thought.create(body);
      const { _id } = thought;

      const dbUserData = await User.findOneAndUpdate(
        { _id: body.userId },
        { $push: { thoughts: _id } },
        { new: true }
      );

      if (!dbUserData) {
        return res
          .status(404)
          .json({ message: "Thought created but no user found" });
      }

      res.json({ message: "Thought successfully created" });
    } catch (err) {
      res.json(err);
    }
  },

  // update Thought by id
  async updateThought({ params, body }, res) {
    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: params.id },
        body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found" });
        return;
      }

      res.json(dbThoughtData);
    } catch (err) {
      res.json(err);
    }
  },
  // delete Thought

  async deleteThought({ params }, res) {
    try {
      const dbThoughtData = await Thought.findOneAndDelete({ _id: params.id });
      if (!dbThoughtData) {
        return res.status(404).json({ message: "This thought was not found" });
      }

      const dbUserData = await User.findOneAndUpdate(
        { thoughts: params.id },
        { $pull: { thoughts: params.id } },
        { new: true }
      );
      if (!dbUserData) {
        return res
          .status(404)
          .json({ message: "Thought created but no user found" });
      }
      res.json({ message: "Thought successfully deleted" });
    } catch (err) {
      res.json(err);
    }
  },
  // add reaction

  async addReaction({ params, body }, res) {
    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $addToSet: { reactions: body } },
        { new: true, runValidators: true }
      );

      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found" });
        return;
      }
      res.json(dbThoughtData);
    } catch (err) {
      res.json(err);
    }
  },
  // delete reaction

  async removeReaction({ params }, res) {
    try {
      const dbThoughtData = await Thought.findOneAndUpdate(
        { _id: params.thoughtId },
        { $pull: { reactions: { reactionId: params.reactionId } } },
        { new: true }
      );

      res.json(dbThoughtData);
    } catch (err) {
      res.json(err);
    }
  },
};
module.exports = thoughtController;
