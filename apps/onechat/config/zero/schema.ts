import { createSchema, createTableSchema, definePermissions, type Row } from '@rocicorp/zero'

const userSchema = {
  tableName: 'user',
  primaryKey: ['id'],
  columns: {
    id: 'string',
    username: 'string',
    email: 'string',
    name: 'string',
    image: 'string',
    state: 'json',
    updatedAt: 'number',
    createdAt: 'number',
  },
  relationships: {
    servers: [
      {
        sourceField: 'id',
        destField: 'userId',
        destSchema: () => serverMemberSchema,
      },
      {
        sourceField: 'serverId',
        destField: 'id',
        destSchema: () => serverSchema,
      },
    ],

    friends: [
      {
        sourceField: 'id',
        destField: 'requestingId',
        destSchema: () => friendshipSchema,
      },
      {
        sourceField: 'acceptingId',
        destField: 'id',
        destSchema: () => userSchema,
      },
    ],
  },
} as const

const friendshipSchema = createTableSchema({
  tableName: 'friendship',
  primaryKey: ['requestingId', 'acceptingId'],
  columns: {
    requestingId: 'string',
    acceptingId: 'string',
    accepted: 'boolean',
    createdAt: 'number',
  },
})

const serverSchema = {
  tableName: 'server',
  primaryKey: ['id'],
  columns: {
    id: 'string',
    name: 'string',
    ownerId: 'string',
    channelSort: 'json',
    description: 'string',
    icon: 'string',
    createdAt: 'number',
  },
  relationships: {
    channels: {
      sourceField: 'id',
      destField: 'serverId',
      destSchema: () => channelSchema,
    },

    members: [
      {
        sourceField: 'id',
        destField: 'serverId',
        destSchema: () => serverMemberSchema,
      },
      {
        sourceField: 'userId',
        destField: 'id',
        destSchema: () => userSchema,
      },
    ],
  },
} as const

const serverMemberSchema = createTableSchema({
  tableName: 'serverMember',
  primaryKey: ['serverId', 'userId'],
  columns: {
    serverId: 'string',
    userId: 'string',
    joinedAt: 'number',
  },
})

const channelSchema = createTableSchema({
  tableName: 'channel',
  columns: {
    id: 'string',
    serverId: 'string',
    name: 'string',
    description: 'string',
    private: { type: 'boolean' },
    createdAt: 'number',
  },
  primaryKey: ['id'],
  relationships: {
    messages: {
      sourceField: 'id',
      destField: 'channelId',
      destSchema: () => messageSchema,
    },
    threads: {
      sourceField: 'id',
      destField: 'channelId',
      destSchema: () => threadSchema,
    },
  },
})

const threadSchema = createTableSchema({
  tableName: 'thread',
  columns: {
    id: 'string',
    channelId: 'string',
    creatorId: 'string',
    messageId: 'string',
    title: 'string',
    description: 'string',
    createdAt: 'number',
  },
  primaryKey: ['id'],
  relationships: {
    messages: {
      sourceField: 'id',
      destField: 'threadId',
      destSchema: () => messageSchema,
    },
  },
})

const messageSchema = {
  tableName: 'message',
  primaryKey: ['id'],
  columns: {
    id: 'string',
    serverId: 'string',
    channelId: 'string',
    threadId: { type: 'string', optional: true },
    isThreadReply: 'boolean',
    senderId: 'string',
    content: 'string',
    createdAt: 'number',
    updatedAt: { type: 'number', optional: true },
    deleted: { type: 'boolean', optional: true },
  },
  relationships: {
    thread: {
      sourceField: 'id',
      destField: 'messageId',
      destSchema: () => threadSchema,
    },

    reactions: [
      {
        sourceField: 'id',
        destField: 'messageId',
        destSchema: () => messageReactionSchema,
      },
      {
        sourceField: 'reactionId',
        destField: 'id',
        destSchema: () => reactionSchema,
      },
    ],
  },
} as const

const messageReactionSchema = createTableSchema({
  tableName: 'messageReaction',
  primaryKey: ['messageId', 'userId', 'reactionId'],
  columns: {
    messageId: 'string',
    userId: 'string',
    reactionId: 'string',
    createdAt: 'number',
    updatedAt: { type: 'number', optional: true },
  },
})

const reactionSchema = createTableSchema({
  tableName: 'reaction',
  primaryKey: ['id'],
  columns: {
    id: 'string',
    value: 'string',
    keyword: 'string',
    createdAt: 'number',
    updatedAt: { type: 'number', optional: true },
  },
})

export const schema = createSchema({
  version: 1,
  tables: {
    user: userSchema,
    friendship: friendshipSchema,
    server: serverSchema,
    serverMember: serverMemberSchema,
    channel: channelSchema,
    thread: threadSchema,
    message: messageSchema,
    messageReaction: messageReactionSchema,
    reaction: reactionSchema,
  },
})

export type Schema = typeof schema
export type Message = Row<typeof messageSchema>
export type Server = Row<typeof serverSchema>
export type Channel = Row<typeof channelSchema>
export type Thread = Row<typeof threadSchema>
export type User = Row<typeof userSchema>
export type ServerMember = Row<typeof serverMemberSchema>
export type MessageReaction = Row<typeof messageReactionSchema>
export type Reaction = Row<typeof reactionSchema>
export type Friendship = Row<typeof friendshipSchema>

export type MessageWithRelations = Message & { reactions: Reaction[]; thread?: Thread[] }
export type ThreadWithRelations = Thread & { messages: Message[] }

// The contents of your decoded JWT.
type AuthData = {
  sub: string
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  // const allowIfLoggedIn = (
  //   authData: AuthData,
  //   { cmpLit }: ExpressionBuilder<TableSchema>
  // ) => cmpLit(authData.sub, "IS NOT", null);

  // const allowIfMessageSender = (
  //   authData: AuthData,
  //   { cmp }: ExpressionBuilder<typeof messageSchema>
  // ) => cmp("senderID", "=", authData.sub ?? "");

  return {
    // Nobody can write to the medium or user tables -- they are populated
    // and fixed by seed.sql
    // medium: {
    //   row: {
    //     insert: [],
    //     update: {
    //       preMutation: [],
    //     },
    //     delete: [],
    //   },
    // },
    // user: {
    //   row: {
    //     insert: [],
    //     update: {
    //       preMutation: [],
    //     },
    //     delete: [],
    //   },
    // },
    // message: {
    //   row: {
    //     // anyone can insert
    //     insert: undefined,
    //     // only sender can edit their own messages
    //     update: {
    //       preMutation: [allowIfMessageSender],
    //     },
    //     // must be logged in to delete
    //     delete: [allowIfLoggedIn],
    //   },
    // },
  }
})

// export const authorization = defineAuthorization<AuthData, Schema>(schema, (query) => {
//   const allowIfLoggedIn = (authData: AuthData) => query.user.where('id', '=', authData.sub)

//   const allowIfMessageSender = (authData: AuthData, row: Message) => {
//     return query.message.where('id', row.id).where('senderId', '=', authData.sub)
//   }

//   const allowIfServerMember = (authData: AuthData, row: Server) => {
//     return query.serverMember.where('serverId', row.id).where('userId', '=', authData.sub)
//   }

//   return {
//     user: {
//       row: {
//         insert: [],
//         update: [],
//         delete: [],
//       },
//     },
//     server: {
//       row: {
//         insert: [allowIfLoggedIn],
//         update: [allowIfServerMember],
//         delete: [allowIfServerMember],
//       },
//     },
//     serverMember: {
//       row: {
//         insert: [allowIfLoggedIn],
//         update: [allowIfLoggedIn],
//         delete: [allowIfLoggedIn],
//       },
//     },
//     channel: {
//       row: {
//         // Channel creation/modification requires server membership
//         insert: [allowIfLoggedIn],
//         update: [],
//         delete: [],
//       },
//     },
//     thread: {
//       row: {
//         insert: [allowIfLoggedIn],
//         update: [allowIfLoggedIn],
//         delete: [allowIfLoggedIn],
//       },
//     },
//     message: {
//       row: {
//         insert: [allowIfLoggedIn],
//         update: [allowIfMessageSender],
//         delete: [allowIfMessageSender],
//       },
//     },
//   }
// })
