const jwt = require('jsonwebtoken');
const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const config = require('../utils/config');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', async (req, res, next) => {
  const { body } = req;

  try {
    const decodedToken = jwt.verify(req.token, config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(decodedToken.id);

    const newBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id,
    };

    const blog = new Blog(newBlog);

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    res.status(201).json(savedBlog);
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, config.JWT_SECRET);

    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).end();
    }

    if (decodedToken.id.toString() !== blog.user.toString()) {
      return res.status(401).json({ error: 'invalid token' });
    }

    blog.remove();
    res.status(204).end();
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.put('/:id', async (req, res, next) => {
  const { body } = req;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
      new: true,
    });

    if (!updatedBlog) {
      return res.status(404).end();
    }

    res.json(updatedBlog);
  } catch (exception) {
    next(exception);
  }
});

module.exports = blogsRouter;
