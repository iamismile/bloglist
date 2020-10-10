const bcrypt = require('bcrypt');
const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
];

const initialUsers = [
  {
    username: 'hellas',
    password: 'qwerty',
  },
  {
    username: 'root',
    password: 'sekret',
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({ title: 'Testing', url: 'http://www.jestjs.io' });

  await blog.save();
  await blog.remove();

  return blog._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const formattedUser = async (user) => {
  const passwordHash = await bcrypt.hash(user.password, 10);

  return {
    username: user.username,
    passwordHash,
  };
};

module.exports = {
  initialBlogs,
  initialUsers,
  blogsInDb,
  nonExistingId,
  usersInDb,
  formattedUser,
};
