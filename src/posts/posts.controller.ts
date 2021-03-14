import * as express from 'express'
import Controller from '.././interfaces/controller.interface'
import Post from './post.interface'
import postModel from './posts.model'

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
        this.router.post(this.path, this.createPost)
        this.router.patch(`${this.path}/:id`, this.updatePost)
        this.router.delete(`${this.path}/:id`, this.deletePost)
    }

    getAllPosts = (request: express.Request, response: express.Response) => {
        this.postModel.find()
            .then(posts => response.send(posts))
    }

    getPostById = (request: express.Request, response: express.Response) => {
        const id = request.params.id
        this.postModel.findById(id)
            .then(post => response.send(post))
    }

    createPost = (request: express.Request, response: express.Response) => {
        const postData: Post = request.body
        const createdPost = new this.postModel(postData)
        createdPost.save()
            .then(savedPost => response.send(savedPost))
    }

    updatePost = (request: express.Request, response: express.Response) => {
        const id = request.params.id
        const postData: Post = request.body
        this.postModel.findByIdAndUpdate(id, postData, { new: true })
            .then(post => response.send(post))
    }

    deletePost = (request: express.Request, response: express.Response) => {
        const id = request.params.id
        this.postModel.findByIdAndDelete(id)
            .then((succesResponse) => {
                if (succesResponse) {
                    response.send(200)
                } else {
                    response.send(404)
                }
            })
    }
}

export default PostsController