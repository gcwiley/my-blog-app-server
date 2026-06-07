import { DataTypes } from 'sequelize';
import { sequelize } from '../db/connect_to_sqldb.js';

// define the post model
const Post = sequelize.define(
   'Post',
   {
      // id - unique identifier (UUID)
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      // title of the post
      title: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      // body
      body: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      // category
      category: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: { notEmpty: true },
      },
      // favorite flag to mark a post as a favorite
      favorite: {
         type: DataTypes.BOOLEAN,
         defaultValue: false, // provide a default value of false
      },
      // date of post publication
      publishedDate: {
         type: DataTypes.DATE,
         allowNull: false, // ensures the date is not null
         defaultValue: DataTypes.NOW, // set the default date to now
         validate: {
            isDate: true, // ensures a valid date is given
         },
      },
   },
   {
      timestamps: true,
      indexes: [
         {
            fields: ['authorId', 'category'], // adds a composite index on the 'author' column
         },
         {
            fields: ['publishedDate'], // index on date for efficient querying by date
         },
         {
            fields: ['favorite'],
         },
      ],
   }
);

export { Post };
