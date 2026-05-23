import { Post } from './post.model.js';
import { User } from './user.model.js';

// --- ASSOCIATIONS ---
// A User can have many Posts, and a Post belongs to one User (the author)
User.hasMany(Post, { foreignKey: 'authorId' });
// A Post belongs to a User (the author)
Post.belongsTo(User, { foreignKey: 'authorId' });

export { Post, User };