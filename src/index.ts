import { CLICommandNotFound, CLIIllegalOption } from './utils/errors'
import { Logger } from './utils/logger'
import { middleware, Middleware as GenericMiddleware } from './utils/middleware'

export { help } from './middlewares/helper'

export type CommandFunction = (options: ICLIOptions, ...args: any[]) => any
export type CLIParams = string[]
export type CommandsModule = ICommandsDictionary | CommandFunction
export type Middleware = GenericMiddleware<IMiddlewareArguments>

export interface ICLIOptions {
  [key: string]: number | string | boolean
}

export interface ICommandsDictionary {
  [namespace: string]: CommandsModule
}

export interface IMiddlewareArguments {
  options: ICLIOptions
  params: CLIParams
  definition: CommandsModule
  namespace: string
  command: CommandFunction
}

export interface IInterpreterArguments extends IMiddlewareArguments {
  middlewares?: Middleware[]
}

export function cli(definition: CommandsModule) {
  const logger = new Logger()
  try {
    middleware<IMiddlewareArguments>([])({
      command: () => null,
      definition,
      namespace: '',
      options: {},
      params: []
    })
  } catch (error) {
    if (
      error instanceof CLICommandNotFound ||
      error instanceof CLIIllegalOption
    ) {
      logger.error(error.message)
      process.exit(1)
    } else {
      logger.log(error)
      process.exit(1)
    }
  }
}
