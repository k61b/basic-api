import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as mongoose from 'mongoose'
import Controller from './interfaces/controller.interface'
import errorMiddleware from './middleware/error.middleware'

class App {
    public app: express.Application

    constructor(controllers: Controller[]) {
        this.app = express()

        this.connectDB()
        this.initializeMiddlewares()
        this.initializeControllers(controllers)
        this.initializeErrorHandling()
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser())
    }

    private initializeControllers(controllers) {
        controllers.forEach(controller => {
            this.app.use('/', controller.router)
        })
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware)
    }

    private connectDB() {
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true
        })
            .then(() => {
                console.log("MongoDB Connection Successful")
            })
            .catch(err => {
                console.error(err)
            })
    }

    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`App listening on the port ${process.env.PORT}`)
        })
    }
}

export default App