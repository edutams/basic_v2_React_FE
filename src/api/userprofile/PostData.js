import image1 from 'src/assets/images/products/s1.jpg';
import image2 from 'src/assets/images/products/s2.jpg';
import image4 from 'src/assets/images/products/s4.jpg';
import user1 from 'src/assets/images/users/1.jpg';
import user2 from 'src/assets/images/users/2.jpg';
import user3 from 'src/assets/images/users/3.jpg';
import user4 from 'src/assets/images/users/4.jpg';
import user5 from 'src/assets/images/users/5.jpg';
import user6 from 'src/assets/images/users/1.jpg';
import { Chance } from 'chance';
import { http, HttpResponse } from 'msw';
const chance = new Chance();

// social profile
let posts = [
  {
    id: chance.integer({ min: 1, max: 2000 }),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: user1,
      name: 'Katherine Langford',
      time: '15 min ago',
    },
    data: {
      content: chance.paragraph({ sentences: 2 }),
      images: [
        {
          img: image1,
          featured: true,
        },
      ],
      likes: {
        like: true,
        value: 67,
      },
      comments: [
        {
          id: chance.integer({ min: 1, max: 2000 }),
          profile: {
            id: chance.integer({ min: 1, max: 2000 }),
            avatar: user3,
            name: 'Deran Mac',
            time: '8 min ago ',
          },
          data: {
            comment: chance.paragraph({ sentences: 2 }),
            likes: {
              like: true,
              value: 55,
            },
            replies: [],
          },
        },
        {
          id: chance.integer({ min: 1, max: 2000 }),
          profile: {
            id: chance.integer({ min: 1, max: 2000 }),
            avatar: user4,
            name: 'Jonathan Bg',
            time: '5 min ago ',
          },
          data: {
            comment: chance.paragraph({ sentences: 2 }),
            likes: {
              like: false,
              value: 68,
            },
            replies: [
              {
                id: chance.integer({ min: 1, max: 2000 }),
                profile: {
                  id: chance.integer({ min: 1, max: 2000 }),
                  avatar: user5,
                  name: 'Carry minati',
                  time: 'just now ',
                },
                data: {
                  comment: chance.paragraph({ sentences: 2 }),
                  likes: {
                    like: true,
                    value: 10,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: user5,
      name: 'Carry Minati',
      time: 'now',
    },
    data: {
      content: chance.paragraph({ sentences: 2 }),
      images: [],
      likes: {
        like: true,
        value: 1,
      },
      comments: [],
    },
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: user2,
      name: 'Genelia Desouza',
      time: '15 min ago ',
    },
    data: {
      content: chance.paragraph({ sentences: 2 }),
      images: [
        {
          img: image2,
          title: 'Image Title',
        },
        {
          img: image4,
          title: 'Painter',
        },
      ],
      likes: {
        like: false,
        value: 320,
      },
      comments: [
        {
          id: chance.integer({ min: 1, max: 2000 }),
          profile: {
            id: chance.integer({ min: 1, max: 2000 }),
            avatar: user3,
            name: 'Ritesh Deshmukh',
            time: '15 min ago ',
          },
          data: {
            comment: chance.paragraph({ sentences: 2 }),
            likes: {
              like: true,
              value: 65,
            },
            replies: [],
          },
        },
      ],
    },
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: user6,
      name: 'Himesh R',
      time: '15 min ago ',
    },
    data: {
      content: chance.paragraph({ sentences: 2 }),
      images: [],
      video: 'd1-FRj20WBE',
      likes: {
        like: true,
        value: 129,
      },
    },
  },
];

export default posts;



export const PostHandlers = [
  // Mock GET request to retrieve postData
  http.get('/api/data/postData', () => {
    try {
      return HttpResponse.json({ status: 200, msg: 'Success', data: posts });
    } catch (error) {
      return HttpResponse.json({ status: 200, msg: 'Internal server error', error });
    }
  }),

  // Api endpoint to add posts likes
  http.post('/api/data/posts/like', async ({ request }) => {
    try {
      const { postId } = (await request.json());
      const postIndex = posts.findIndex((x) => x.id === postId);
      const post = { ...posts[postIndex] };
      post.data = { ...post.data };
      post.data.likes = { ...post.data.likes };
      post.data.likes.like = !post.data.likes.like;
      post.data.likes.value = post.data.likes.like
        ? post.data.likes.value + 1
        : post.data.likes.value - 1;
      posts[postIndex] = post;

      return HttpResponse.json({ status: 200, msg: 'Success', data: posts });
    } catch (error) {
      return HttpResponse.json({ status: 200, msg: 'Internal server error', error });
    }
  }),

  // Api endpoint to add comment
  http.post('/api/data/posts/comments/add', async ({ request }) => {
    try {
      const { postId, comment } = (await request.json());

      const postIndex = posts.findIndex((x) => x.id === postId);
      const post = posts[postIndex];
      const cComments = post.data.comments || [];
      post.data.comments = [...cComments, comment];
      return HttpResponse.json({ status: 200, msg: 'Success', data: posts });
    } catch (error) {
      return HttpResponse.json({ status: 200, msg: 'Internal server error', error });
    }
  }),

  // Api endpoint to add replies
  http.post('/api/data/posts/replies/add', async ({ request }) => {
    try {
      const { postId, commentId, reply } = (await request.json());
      const postIndex = posts.findIndex((x) => x.id === postId);
      const post = posts[postIndex];
      const cComments = post.data.comments || [];
      const commentIndex = cComments.findIndex((x) => x.id === commentId);
      const comment = cComments[commentIndex];
      if (comment && comment.data && comment.data.replies)
        comment.data.replies = [...comment.data.replies, reply];
      return HttpResponse.json({ status: 200, msg: 'Success', data: posts });
    } catch (error) {
      return HttpResponse.json({ status: 200, msg: 'Internal server error', error });
    }
  }),

  // Api endpoint to add likes to replies
  http.post('/api/data/posts/replies/like', async ({ request }) => {
    try {
      const { postId, commentId } = (await request.json());
      const postIndex = posts.findIndex((x) => x.id === postId);
      const post = posts[postIndex];
      const cComments = post.data.comments || [];
      const commentIndex = cComments.findIndex((x) => x.id === commentId);
      const comment = { ...cComments[commentIndex] };

      if (comment && comment.data && comment.data.likes)
        comment.data.likes.like = !comment.data.likes.like;
      if (comment && comment.data && comment.data.likes)
        comment.data.likes.value = comment.data.likes.like
          ? comment.data.likes.value + 1
          : comment.data.likes.value - 1;
      if (post && post.data && post.data.comments) post.data.comments[commentIndex] = comment;
      return HttpResponse.json({ status: 200, msg: 'Success', data: posts });
    } catch (error) {
      return HttpResponse.json({ status: 200, msg: 'Internal server error', error });
    }
  }),
];
