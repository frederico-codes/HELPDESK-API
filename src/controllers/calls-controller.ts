import { NextFunction, Request, Response} from "express"


class CallController{
  async index(request: Request, response:Response, next: NextFunction){
    try {
      return response.json({ message:"ok"})
    } catch (error) {
      next(error)
      
    }
  }
  async create(request: Request, response: Response, next: NextFunction){

    return response.json({ message: request.user?.role })
  }
}

export { CallController}