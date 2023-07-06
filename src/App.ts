import express  from "express"
import { default_Params } from "../Default"
import routes from "./Routes"
import db_Connection from "./Provider/Db.Provider"

const App = express()
const port: number = default_Params.port

App.listen(port, async()=>{
    await db_Connection()
    console.log(`Api Running on Port: ${port}`)
    routes(App)
})