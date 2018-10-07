const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull
} = require('graphql');

const Referrer = require('./models/referrer');
const Referral = require('./models/referral');

const client = require('./messaging');

const ReferrerType = new GraphQLObjectType({
    name: 'Referrer',
    fields: () => ({
        phone: { type: GraphQLString },
        password: { type: GraphQLString },
        referrals: { 
            type: GraphQLList(ReferralType),
            resolve(parent, args) {
                return Referral.find({ referrerPhone: parent.phone});
            }
        }
    })
});

const ReferralType = new GraphQLObjectType({
    name: 'Referral',
    fields: () => ({
        referrerPhone: { type: GraphQLString },
        referreePhone: { type: GraphQLString },
        used: { type: GraphQLBoolean }
    })
})


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        referrer: {
            type: ReferrerType,
            args: {
                phone: { type: GraphQLString }
            },
            resolve: (parent, args) => Referrer.findOne({ phone: args.phone })
        },
        referrers: {
            type: GraphQLList(ReferrerType),
            resolve: (parent, args) => Referrer.find()
        },
        referral: {
            type: ReferralType,
            args: {
                referrerPhone: { type: GraphQLString },
                referreePhone: { type: GraphQLString }
            },
            resolve: (parent, args) => Referral.findOne({ referrerPhone: args.referrerPhone, referreePhone: args.referreePhone})
        },
        referrals: {
            type: GraphQLList(ReferralType),
            resolve: (parent, args) => Referral.find()
        },
        login: {
            type: ReferrerType,
            args: {
                phone: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const ref = await Referrer.findOne({ phone: args.phone });

                return !ref || ref.password !== args.password
                    ? null
                    : ref;
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
            async resolve(parent, args) {
                const referrers = await Referrer.find();

                return referrers
                    .map(r => r.phone)
                    .includes(args.phone)
                    ? null
                    : new Referrer({
                        phone: args.phone,
                        password: args.password,
                    }).save();
            }
        },
        createReferral: {
            type: ReferralType,
            args: {
                referrerPhone: { type: new GraphQLNonNull(GraphQLString) },
                referreePhone: { type: new GraphQLNonNull(GraphQLString) },
                message: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, args) {
                const existing = await Referral.findOne({
                    referrerPhone: args.referrerPhone,
                    referreePhone: args.referreePhone
                });

                if (existing || args.referrerPhone === args.referreePhone) return null;

                try {
                    client.messages
                    .create({
                        body: args.message,
                        from: '+18164398145',
                        to: `+1${args.referreePhone}`
                    })
                    .done();

                    return new Referral({
                        referrerPhone: args.referrerPhone,
                        referreePhone: args.referreePhone,
                        used: false
                    }).save();

                } catch (err) {
                    return null;
                }
                
            }
        },
        useReferral: {
            type: ReferralType,
            args: {
                referrerPhone: { type: new GraphQLNonNull(GraphQLString) },
                referreePhone: { type: new GraphQLNonNull(GraphQLString)}
            },
            async resolve(parent, args) {
                const updated = await Referral
                    .findOneAndUpdate({ referrerPhone: args.referrerPhone, referreePhone: args.referreePhone }, { used: true });
                return updated;
            }
        }

    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});