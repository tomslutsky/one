import { type Query, type QueryType, type Smash, Zero } from '@rocicorp/zero'
import { useZero, useQuery as useZeroQuery } from '@rocicorp/zero/react'
import { type Schema, schema } from '~/zero/schema'
import { createEmitter } from '~/helpers/emitter'

export let zero = createZero()

export const [zeroEmit, useZeroEmit] = createEmitter<typeof zero>()

function createZero({ auth, userID = 'anon' }: { auth?: string; userID?: string } = {}) {
  return new Zero({
    userID,
    auth,
    server: import.meta.env.VITE_PUBLIC_ZERO_SERVER,
    schema,
    // This is often easier to develop with if you're frequently changing
    // the schema. Switch to 'idb' for local-persistence.
    kvStore: 'mem',
  })
}

// TODO add userID
export function setZeroAuth(jwtSecret: string) {
  // slowing down
  // zero = createZero({
  //   auth: jwtSecret,
  // })
  // emitter.trigger(zero)
}

export const mutate = zero.mutate

type QueryResult<TReturn extends QueryType> = [
  Smash<TReturn>,
  {
    type: 'unknown' | 'complete'
  },
]

export function useQuery<
  QueryBuilder extends (z: Zero<Schema>['query']) => Query<any>,
  Q extends ReturnType<QueryBuilder>,
>(createQuery: QueryBuilder): Q extends Query<any, infer Return> ? QueryResult<Return> : never {
  const z = useZero<Schema>()
  return useZeroQuery(createQuery(z.query)) as any
}

export async function resolve<Q extends Query<any>>(
  query: Q
): Promise<Q extends Query<any, infer Return> ? QueryResult<Return>[0] : never> {
  const view = query.materialize()
  return new Promise((res) => {
    const dispose = view.addListener((data) => {
      if (Array.isArray(data) ? data.length : !!data) {
        res(data as any)
        setTimeout(() => {
          dispose()
        })
      }
    })
  })
}