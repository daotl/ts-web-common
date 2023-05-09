import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import * as R from 'remeda'
import { CustomError } from 'ts-custom-error'
import type { CamelCase, Class } from 'type-fest'
import { toCamelCase } from 'typed-case'

// rome-ignore lint/suspicious/noExplicitAny: <explanation>
export function isStringer(x: any): x is { toString(): string } {
  return x['toString'] instanceof Function
}

export function toError(x: unknown): Error {
  if (x instanceof Error) {
    return x
  } else if (isStringer(x)) {
    return new Error(x.toString())
  }
  return errors.internalError
}

export const errImpossibleCodePath = new Error(
  'Throw this when code will never reach somewhere, but TypeScript cannot determine',
)

// Base error class for extending.
// The full message will be `$(message ?? defaultMessage)` suffixed with `: ${messageDetail}` if provided.
export class Err extends CustomError {
  static httpStatusCode: number
  static trpcErrorCode: TRPC_ERROR_CODE_KEY
  static code: string
  static defaultMessage: string

  // For Effect's error handling such as `catchTag`
  readonly _tag: string

  constructor(
    options?: ErrorOptions & { message?: string; messageDetail?: string },
  ) {
    super('', options)

    this._tag = (this.constructor as typeof Err).code

    let msg =
      options?.message ?? (this.constructor as typeof Err).defaultMessage
    if (options?.messageDetail) {
      msg += `: ${options.messageDetail}`
    }
    this.message = msg

    // Don't need this unless ErrorOptions adds additional fields not supported by `ts-custom-error` in the future:
    // `cause` is supported now: https://github.com/adriengibrat/ts-custom-error/commit/683cf2bbc84f773a50dbacfe12477db13cdb6b2b
    // (options) {
    // ;(bject.entries(options) as Entries<ErrorOptions>).forEach(
    //     ([k, v]) => (this[k] = v),
    //   )
    // }
  }

  get httpStatusCode(): number {
    return (this.constructor as typeof Err).httpStatusCode
  }

  get trpcErrorCode(): TRPC_ERROR_CODE_KEY {
    return (this.constructor as typeof Err).trpcErrorCode
  }

  get code(): string {
    return (this.constructor as typeof Err).code
  }

  get defaultMessage(): string {
    return (this.constructor as typeof Err).defaultMessage
  }
}

export const isErrOf = <E extends Err>(cls: Class<E>) =>
  function (e: Error): e is E {
    return e instanceof cls
  }

export const isErr = isErrOf(Err)

// References:
// https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#7102-error-condition-responses
// https://docs.microsoft.com/en-us/rest/api/storageservices/common-rest-api-error-codes
// https://docs.azure.cn/en-us/cdn/cdn-api-get-endpoint
// https://trpc.io/docs/error-handling

// 400 The server cannot or will not process the request due to something that is perceived to be a client error.
export class ErrBadRequest extends Err {
  static override httpStatusCode = 400
  static override trpcErrorCode = 'BAD_REQUEST' as const
  static override code = 'BadRequest'
  static override defaultMessage = 'Bad request'
}

// 400 Argument format validation error.
export class ErrBadArgument extends ErrBadRequest {
  static override code = 'BadArgument'
  static override defaultMessage = 'Bad argument'
}

// 400 Invalid inputs other than format validation errors.
export class ErrInvalidInput extends ErrBadRequest {
  static override code = 'InvalidInput'
  static override defaultMessage = 'Some request inputs are not valid'
}

// 400 The attempted operation is invalid.
export class ErrInvalidOperation extends ErrBadRequest {
  static override code = 'InvalidOperation'
  static override defaultMessage = 'The attempted operation is invalid'
}

// 400 The specified password is too weak.
export class ErrPasswordTooWeak extends ErrBadRequest {
  static override code = 'PasswordTooWeak'
  static override defaultMessage = 'The specified password is too weak'
}

// 401 The client request has not been completed because it lacks valid authentication credentials for the requested resource.
export class ErrUnauthorized extends Err {
  static override httpStatusCode = 401
  static override trpcErrorCode = 'UNAUTHORIZED' as const
  static override code = 'Unauthorized'
  static override defaultMessage = 'Unauthorized'
}

// 401 The login credential is invalid.
export class ErrInvalidLoginCredential extends ErrUnauthorized {
  static override code = 'InvalidLoginCredential'
  static override defaultMessage = 'The login credential is invalid'
}

// 401 User already logged in in another place.
export class ErrAlreadyLoggedIn extends ErrUnauthorized {
  static override code = 'AlreadyLoggedIn'
  static override defaultMessage = 'User already logged in in another place'
}

// 401 The authentication information is invalid.
export class ErrInvalidAuthenticationInfo extends ErrUnauthorized {
  static override code = 'InvalidAuthenticationInfo'
  static override defaultMessage = 'The authentication information is invalid'
}

// 403 The server was unauthorized to access a required data source, such as a REST API.
export class ErrForbidden extends Err {
  static override httpStatusCode = 403
  static override trpcErrorCode = 'FORBIDDEN' as const
  static override code = 'Forbidden'
  static override defaultMessage = 'Forbidden'
}

// 403 Server failed to authenticate the request. Make sure the authentication information is correct.
export class ErrAuthenticationFailed extends ErrForbidden {
  static override code = 'AuthenticationFailed'
  static override defaultMessage =
    'Server failed to authenticate the request. Make sure the authentication information is correct'
}

// 403 The account being accessed does not have sufficient permissions to execute this operation.
export class ErrInsufficientAccountPermissions extends ErrForbidden {
  static override code = 'InsufficientAccountPermissions'
  static override defaultMessage =
    'The account being accessed does not have sufficient permissions to execute this operation'
}

// 404 Not Found
export class ErrNotFound extends Err {
  static override httpStatusCode = 404
  static override trpcErrorCode = 'NOT_FOUND' as const
  static override code = 'NotFound'
  static override defaultMessage = 'Not found'
}

// 404 The server cannot find the requested resource.
export class ErrEndpointNotFound extends ErrNotFound {
  static override code = 'EndpointNotfound'
  static override defaultMessage = 'The requested endpoint does not exist'
}

// 404 The server cannot find the requested resource.
export class ErrResourceNotFound extends ErrNotFound {
  static override code = 'ResourceNotfound'
  static override defaultMessage = 'The specified resource does not exist'
}

// 405 The server knows the request method, but the target resource doesn't support this method.
export class ErrMethodNotSupported extends Err {
  static override httpStatusCode = 405
  static override trpcErrorCode = 'METHOD_NOT_SUPPORTED' as const
  static override code = 'MethodNotSupported'
  static override defaultMessage = 'Method not supported'
}

// The server would like to shut down this unused connection.
export class ErrTimeout extends Err {
  static override httpStatusCode = 408
  static override trpcErrorCode = 'TIMEOUT' as const
  static override code = 'Timeout'
  static override defaultMessage = 'Timeout'
}

// 409 The server request resource conflict with the current state of the target resource.
export class ErrConflict extends Err {
  static override httpStatusCode = 409
  static override trpcErrorCode = 'CONFLICT' as const
  static override code = 'Conflict'
  static override defaultMessage = 'Conflict'
}

// 409 The specified resource already exists.
export class ErrResourceAlreadyExists extends ErrConflict {
  static override code = 'ResourceAlreadyExists'
  static override defaultMessage = 'The specified resource already exists'
}

// 409 The specified account already exists.
export class ErrAccountAlreadyExists extends ErrConflict {
  static override code = 'AccountAlreadyExists'
  static override defaultMessage = 'The specified account already exists'
}

// 412 Access to the target resource has been denied.
export class ErrPreconditionFailed extends Err {
  static override httpStatusCode = 412
  static override trpcErrorCode = 'PRECONDITION_FAILED' as const
  static override code = 'PreconditionFailed'
  static override defaultMessage = 'Precondition failed'
}

// 413 Request entity is larger than limits defined by server.
export class ErrPayloadTooLarge extends Err {
  static override httpStatusCode = 413
  static override trpcErrorCode = 'PAYLOAD_TOO_LARGE' as const
  static override code = 'PayloadTooLarge'
  static override defaultMessage = 'Payload too large'
}

// 429 The user has sent too many requests in a given amount of time ("rate limiting").
// A Retry-After header might be included to this response indicating how long to wait before making a new request.
export class ErrTooManyRequests extends Err {
  static override httpStatusCode = 413
  static override trpcErrorCode = 'TOO_MANY_REQUESTS' as const
  static override code = 'TooManyRequest'
  static override defaultMessage = 'Too many requests'
}

// 499 Access to the resource has been denied.
export class ErrClientClosedRequest extends Err {
  static override httpStatusCode = 499
  static override trpcErrorCode = 'CLIENT_CLOSED_REQUEST' as const
  static override code = 'ClientClosedRequest'
  static override defaultMessage = 'Client closed request'
}

// 500 An unspecified error occurred.
export class ErrInternalError extends Err {
  static override httpStatusCode = 500
  static override trpcErrorCode = 'INTERNAL_SERVER_ERROR' as const
  static override code = 'InternalError'
  static override defaultMessage =
    'The server encountered an internal error, please retry the request'
}

// 503 Service Unavailable
export class ErrServiceUnavailable extends Err {
  static override httpStatusCode = 503
  static override trpcErrorCode = 'INTERNAL_SERVER_ERROR' as const
  static override code = 'ServiceUnavailable'
  static override defaultMessage = 'Service unavailable'
}

// 503 Server busy
export class ErrServerBusy extends ErrServiceUnavailable {
  static override code = 'ServerBusy'
  static override defaultMessage =
    'The server is currently unable to receive requests. Please retry your request'
}

export const Errors = {
  BadRequest: ErrBadRequest,
  BadArgument: ErrBadArgument,
  InvalidInput: ErrInvalidInput,
  InvalidOperation: ErrInvalidOperation,
  PasswordTooWeak: ErrPasswordTooWeak,
  Unauthorized: ErrUnauthorized,
  InvalidLoginCredential: ErrInvalidLoginCredential,
  AlreadyLoggedIn: ErrAlreadyLoggedIn,
  InvalidAuthenticationInfo: ErrInvalidAuthenticationInfo,
  Forbidden: ErrForbidden,
  AuthenticationFailed: ErrAuthenticationFailed,
  InsufficientAccountPermissions: ErrInsufficientAccountPermissions,
  NotFound: ErrNotFound,
  EndpointNotFound: ErrEndpointNotFound,
  ResourceNotFound: ErrResourceNotFound,
  MethodNotSupported: ErrMethodNotSupported,
  Timeout: ErrTimeout,
  Conflict: ErrConflict,
  ResourceAlreadyExists: ErrResourceAlreadyExists,
  AccountAlreadyExists: ErrAccountAlreadyExists,
  PreconditionFailed: ErrPreconditionFailed,
  PayloadTooLarge: ErrPayloadTooLarge,
  TooManyRequests: ErrTooManyRequests,
  ClientClosedRequest: ErrClientClosedRequest,
  InternalError: ErrInternalError,
  ServiceUnavailable: ErrServiceUnavailable,
  ServerBusy: ErrServerBusy,
} as const

export namespace Errors {
  export type BadRequest = ErrBadRequest
  export type BadArgument = ErrBadArgument
  export type InvalidInput = ErrInvalidInput
  export type InvalidOperation = ErrInvalidOperation
  export type PasswordTooWeak = ErrPasswordTooWeak
  export type Unauthorized = ErrUnauthorized
  export type InvalidLoginCredential = ErrInvalidLoginCredential
  export type AlreadyLoggedIn = ErrAlreadyLoggedIn
  export type InvalidAuthenticationInfo = ErrInvalidAuthenticationInfo
  export type Forbidden = ErrForbidden
  export type AuthenticationFailed = ErrAuthenticationFailed
  export type InsufficientAccountPermissions = ErrInsufficientAccountPermissions
  export type NotFound = ErrNotFound
  export type EndpointNotFound = ErrEndpointNotFound
  export type ResourceNotFound = ErrResourceNotFound
  export type MethodNotSupported = ErrMethodNotSupported
  export type Timeout = ErrTimeout
  export type Conflict = ErrConflict
  export type ResourceAlreadyExists = ErrResourceAlreadyExists
  export type AccountAlreadyExists = ErrAccountAlreadyExists
  export type PreconditionFailed = ErrPreconditionFailed
  export type PayloadTooLarge = ErrPayloadTooLarge
  export type TooManyRequests = ErrTooManyRequests
  export type ClientClosedRequest = ErrClientClosedRequest
  export type InternalError = ErrInternalError
  export type ServiceUnavailable = ErrServiceUnavailable
  export type ServerBusy = ErrServerBusy
}

export type Name = keyof typeof Errors

export const errors = {
  ...(R.pipe(
    Errors,
    R.mapKeys(toCamelCase<Name, {}>),
    R.mapValues((Cls) => new Cls()),
  ) as {
    [K in Name as CamelCase<K>]: InstanceType<typeof Errors[K]>
  }),

  impossibleCodePath: errImpossibleCodePath,
}

export type ErrorName = keyof typeof errors
