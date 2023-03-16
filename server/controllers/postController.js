const Post = require("../models/post");

const postController = {};

// creates new post and stores on res.locals.post
// how does this then go int othe database?
postController.createPost = async (req, res, next) => {
  try {
    //const post = {test: 'create post'}
    console.log(req.body);
    const post = await Post.create({
      placeId: req.body.placeId, // <-- we're pretty sure the schema is not enforced and this can be a string
      expirationTime: req.body.expirationTime, // <-- when they're going (check w frontend about entering date)
      owner: req.body.owner, //<-- connects to current user by ID (won't need frontend field)
    });
    res.locals.post = post;
    return next();
  } catch (err) {
    return next({
      log: err,
      status: 500,
      message: { err: "Problem in createPost middleware" }
    });
  }
};

// searches the posts collection for all posts
// returns to client on res.locals.posts
postController.getPosts = async (req, res, next) => {
  try {
    //allPosts = {test: 'get posts'}
    const allPosts = await Post.find({});
    res.locals.posts = allPosts;
    return next();
  } catch (err) {
    return next({
      log: err,
      status: 500,
      message: { err: "Problem in getPosts middleware" }
    });
  }
};

postController.addRunner = async (req, res, next) => {
  try {
    const { username, _id } = req.body;
    Post.findOne({ _id })
      .then((post) => {
        let runnerExists = false;
        // loop through the post.runner array to check if user is already a runner on the post
        for (let i = 0; i < post.runners.length; i++) {
          if (post.runners[i] === username) runnerExists = true;
        }
        //if runner wants to be added to a post and the runner has not been added, update the db to add the runner 
        if (!runnerExists) {
          let updatedRunners = [...post.runners, username];
          Post.updateOne({_id}, {runners: updatedRunners})
            .then(post => next())
            .catch(err => {
              return next({
                log: err, 
                status: 500, 
                message: { err: "Error in postController.addRunner --> Post.findOne --> Post.updateOne"}
              })
            })
        }
        // otherwise, if the runner already exists on the runners array, return next without updating the DB
        return next()
      })
  } catch (err) {
    return next({
      log: err, 
      status: 500, 
      message: { err: "problem with addRunner middleware"}
    });
  }
};

module.exports = postController;
