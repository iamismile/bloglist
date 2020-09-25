const _ = require('lodash');

const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  const reducer = (total, blog) => total + blog.likes;
  return blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {};
  const maxLikedValue = Math.max(...blogs.map((blog) => blog.likes));
  return blogs.find((blog) => blog.likes === maxLikedValue);
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {};
  const groupedByAuthor = _.groupBy(blogs, 'author');
  const keys = Object.keys(groupedByAuthor);
  const flattenArray = keys.map((key) => ({
    author: key,
    blogs: groupedByAuthor[key].length,
  }));
  const maxValue = Math.max(...flattenArray.map((item) => item.blogs));
  return flattenArray.find((item) => item.blogs === maxValue);
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {};
  const groupedByAuthor = _.groupBy(blogs, 'author');
  const keys = Object.keys(groupedByAuthor);
  const flattenArray = keys.map((key) => {
    const likes = groupedByAuthor[key].reduce(
      (total, item) => total + item.likes,
      0
    );
    return {
      author: key,
      likes,
    };
  });
  const maxValue = Math.max(...flattenArray.map((item) => item.likes));
  return flattenArray.find((item) => item.likes === maxValue);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
