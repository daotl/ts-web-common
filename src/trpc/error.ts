import { TRPCError } from '@trpc/server'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import * as R from 'remeda'

import { type ErrorName, errors, isErr, toError } from '~/error/index.js'

export function trpcErrorFromError(
  e: Error,
  code?: TRPC_ERROR_CODE_KEY,
): TRPCError {
  if (e instanceof TRPCError) {
    return e
  }

  return new TRPCError({
    code: code ?? (isErr(e) ? e.trpcErrorCode : 'INTERNAL_SERVER_ERROR'),
    message: e.message,
    cause: e,
  })
}

export const toTrpcError = R.createPipe(toError, trpcErrorFromError)

export const trpcErrors = R.mapValues(errors, (err) =>
  trpcErrorFromError(err),
) as {
  [K in ErrorName]: TRPCError
}
