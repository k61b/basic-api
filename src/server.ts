import 'dotenv/config'
import App from './app'
import validateEnv from './utils/validateEnv'
import PostsController from './posts/posts.controller'

validateEnv()

const app = new App(
    [
        new PostsController(),
    ],
)

app.listen()