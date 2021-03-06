const { UserInputError, AuthenticationError } = require('apollo-server')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    authorCount: async () => Author.collection.countDocuments(),
    bookCount: async () => Book.collection.countDocuments(),
    allAuthors: async () => Author.find({}),
    allBooks: async (_root, args) => {
      const { author, genre } = args
      if (!author && !genre) {
        return Book.find({}).populate('author')
      } else if (author && genre) {
        const a = await Author.findOne({ name: author })
        return Book.find({ author: a.id })
          .find({ genres: { $in: genre } })
          .populate('author')
      } else if (author) {
        const a = await Author.findOne({ name: author })
        return Book.find({ author: a.id }).populate('author')
      } else {
        return Book.find({ genres: { $in: genre } }).populate('author')
      }
    },
    me: async (_root, _args, context) => {
      return context.currentUser
    },
    allGenres: async () => {
      const books = await Book.find({})
      const genres = books.map((b) => (b = b.genres))
      const flattenedGenres = [].concat.apply([], genres)
      return [...new Set(flattenedGenres)]
    }
  },
  Mutation: {
    addBook: async (_root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated !')
      }

      let book
      try {
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({
            name: args.author,
            born: null,
            bookCount: 1
          })
          await author.save()
        } else {
          const authorBooks = await Book.find({ author: author.id })
          const bookCount = authorBooks.length + 1
          await Author.findOneAndUpdate(
            { name: author.name },
            { $set: { bookCount: bookCount } }
          )
        }

        book = new Book({ ...args, author: author })
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (_root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError('Not authenticated !')
      }
      const editedAuthor = await Author.findOneAndUpdate(
        { name: args.name },
        { $set: { born: args.setBornTo } },
        { new: true }
      )
      return editedAuthor
    },
    createUser: async (_root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== config.PASSWORD) {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user.id
      }

      return { value: jwt.sign(userForToken, config.JWT_SECRET) }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

module.exports = resolvers
