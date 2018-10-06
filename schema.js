const { 
    GraphQLSchema, 
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const Referrer = require('./models/referrer');

const ReferrerType = new GraphQLObjectType({
    name: 'Referrer',
    fields: () => ({
        phone: { type: GraphQLString },
        password: { type: GraphQLString }
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType', 
    fields: {
        Referrer: {
            type: ReferrerType,
            args: {
                phone: { type: GraphQLString }
            },
            resolve: (parent, args) => Referrer.findById(args.phone)
        },
        Referrers: {
            type: GraphQLList(ReferrerType),
            resolve: (parent, args) => Referrer.find()
        },
        Login: {
            type: ReferrerType,
            args: {
                phone: {type: GraphQLString},
                password: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                const ref = Referrer.findById(args.phone);
                return ref.password === args.password 
                    ? ref
                    : null;
            }
        }
    }
});


const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createReferrer: {
            type: ReferrerType,
            args: {
                phone: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, args) {
                return new Referrer({
                    phone: args.phone,
                    password: args.password
                }).save();
            }
        }
    }
})



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});