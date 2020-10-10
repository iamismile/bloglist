/* eslint-disable no-await-in-loop */
const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
  jest.setTimeout(10000);

  await User.deleteMany({});
  await Blog.deleteMany({});

  let userInfo = await helper.formattedUser(helper.initialUsers[0]);
  const user1 = new User(userInfo);
  await user1.save();

  userInfo = await helper.formattedUser(helper.initialUsers[1]);
  const user2 = new User(userInfo);
  const savedUser = await user2.save();

  const blogInstances = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: savedUser._id })
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const blog of blogInstances) {
    const user = await User.findById(savedUser._id);
    const savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
  }
});

describe('When there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('a specific blog within the returned blogs', async () => {
    const response = await api.get('/api/blogs');
    const titles = response.body.map((r) => r.title);

    expect(titles).toContain('Go To Statement Considered Harmful');
  });

  test('all blogs has the id property', async () => {
    const response = await api.get('/api/blogs');
    const blog = response.body[0];

    expect(blog.id).toBeDefined();
  });
});

describe('Addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url:
        'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).toContain('Go To Statement Considered Harmful');
  });

  test('missing likes property, default to the value 0', async () => {
    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const newBlog = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .send(newBlog);

    expect(response.body.likes).toBe(0);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
  });

  test('fails with status code 400 if data invalid', async () => {
    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const newBlog = { author: 'Robert C. Martin', likes: 10 };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe('Deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid and user owns the blog', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test('fials with status code 401 if id is valid but user does not own the blog', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    const loginUser = await api
      .post('/api/login')
      .send({ username: 'hellas', password: 'qwerty' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
  });

  test('fails with status code 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId();

    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .delete(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(404);
  });

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';

    const loginUser = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${loginUser.body.token}`)
      .expect(400);
  });
});

describe('Updating of a blog', () => {
  test('Succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const blogObject = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: 20,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogObject)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.filter((b) => b.id === blogToUpdate.id)[0];

    expect(updatedBlog).toHaveProperty('likes', 20);
  });

  test('fails with status code 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId();
    await api.put(`/api/blogs/${validNonExistingId}`).expect(404);
  });

  test('fails with status code 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445';
    await api.put(`/api/blogs/${invalidId}`).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
