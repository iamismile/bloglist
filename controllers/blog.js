const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

blogsRouter.post('/', async (req, res, next) => {
  const { body } = req;
  const newBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
  };

  const blog = new Blog(newBlog);

  try {
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deletedBlog = await Blog.findByIdAndRemove(req.params.id);

    if (!deletedBlog) {
      return res.status(404).end();
    }

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
