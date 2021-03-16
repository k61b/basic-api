import * as express from 'express'
import Controller from '.././interfaces/controller.interface'
import Post from './post.interface'
import postModel from './posts.model'
import PostNotFountException from '../exceptions/PostNotFoundException'
import validationMiddleware from '../middleware/validation.middleware'
import CreatePostDto from './post.dto'
import authMiddleware from '../middleware/auth.middleware'
import RequestWithUser from '../interfaces/requestWithUser.interface'

class PostsController implements Controller {
    public path = '/posts'
    public router = express.Router()
    public postModel = postModel

    constructor() {
        this.initializeRoutes()
    }

    public initializeRoutes() {
        this.router.get(this.path, this.getAllPosts)
        this.router.get(`${this.path}/:id`, this.getPostById)
        this.router.all(`${this.path}/*`, authMiddleware)
            .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.updatePost)
            .delete(`${this.path}/:id`, this.deletePost)
            .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost)
    }

    getAllPosts = async (request: express.Request, response: express.Response) => {
        const posts = await this.postModel.find()
            .populate('author', '-password')
        response.send(posts)
    }

    getPostById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        const post = await this.postModel.findById(id)
        post ? response.send(post) : next(new PostNotFountException(id))
    }

    createPost = async (request: RequestWithUser, response: express.Response) => {
        const postData: CreatePostDto = request.body
        const createdPost = new this.postModel({
            ...postData,
            author: request.user._id,
        })
        const savedPost = await createdPost.save()
        await savedPost.populate('author', '-password').execPopulate()
        response.send(savedPost)
    }

    updatePost = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        const postData: Post = request.body
        const post = this.postModel.findByIdAndUpdate(id, postData, { new: true })
        post ? response.send(post) : next(new PostNotFountException(id))
    }

    deletePost = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        const successResponse = await this.postModel.findByIdAndDelete(id)
        successResponse ? response.send(200) : next(new PostNotFountException(id))
    }
}

export default PostsController