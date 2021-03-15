import * as express from 'express'
import Controller from '.././interfaces/controller.interface'
import Post from './post.interface'
import postModel from './posts.model'
import PostNotFountException from '../exceptions/PostNotFoundException'
import validationMiddleware from '../middleware/validation.middleware'
import CreatePostDto from './post.dto'

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
        this.router.post(this.path, validationMiddleware(CreatePostDto), this.createPost)
        this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.updatePost)
        this.router.delete(`${this.path}/:id`, this.deletePost)
    }

    getAllPosts = (request: express.Request, response: express.Response) => {
        this.postModel.find()
            .then(posts => response.send(posts))
    }

    getPostById = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        this.postModel.findById(id)
            .then(post => {
                post ? response.send(post) : next(new PostNotFountException(id))
            })
    }

    createPost = (request: express.Request, response: express.Response) => {
        const postData: Post = request.body
        const createdPost = new this.postModel(postData)
        createdPost.save()
            .then(savedPost => response.send(savedPost))
    }

    updatePost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        const postData: Post = request.body
        this.postModel.findByIdAndUpdate(id, postData, { new: true })
            .then(post => {
                post ? response.send(post) : next(new PostNotFountException(id))
            })
    }

    deletePost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id
        this.postModel.findByIdAndDelete(id)
            .then((succesResponse) => {
                succesResponse ? response.send(200) : next(new PostNotFountException(id))
            })
    }
}

export default PostsController