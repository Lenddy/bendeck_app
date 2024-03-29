const express = require("express"); //importing express
const { Server } = require("socket.io"); // importing socket.io
const path = require("path");
const { ApolloServer } = require("apollo-server-express"); //importing ApolloServer to start the graphQL server
const { createServer } = require("http");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");

const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge"); // Import mergeTypeDefs and mergeResolvers
const { makeExecutableSchema } = require("@graphql-tools/schema");
require("dotenv").config();

const { clientTypeDef } = require("./server/graphQL/types/client.typeDef");
const { clientResolvers } = require("./server/graphQL/resolvers/client.resolver");
const { vehicleTypeDef } = require("./server/graphQL/types/vehicle.typeDef");
const { vehicleResolvers } = require("./server/graphQL/resolvers/vehicle.resolver");

const { dealTypeDef } = require("./server/graphQL/types/deal.typeDef");
const { dealResolvers } = require("./server/graphQL/resolvers/deal.resolver");

const mergedTypeDefs = mergeTypeDefs([clientTypeDef, vehicleTypeDef, dealTypeDef]); // Merge multiple type definitions
const mergedResolvers = mergeResolvers([clientResolvers, vehicleResolvers, dealResolvers]); // Merge multiple resolvers

const schema = makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: mergedResolvers,
});

const startServer = async () => {
	//making a promise function
	const app = express(); // initializing express
	const httpServer = createServer(app);

	app.use(express.static(path.join(__dirname, "/server/client/bendecks_auto_sales/dist")));

	//render client for any path
	app.get("*", (req, res) => res.sendFile(path.join(__dirname, "/server/client/bendecks_auto_sales/dist/index.html")));

	const apolloServer = new ApolloServer({
		// creating a new apollo server instance
		// typeDefs: mergedTypeDefs,
		// resolvers: mergedResolvers,
		schema,
	});

	await apolloServer.start(); //starting the apollo server

	apolloServer.applyMiddleware({ app }); //applying the apolloServer to the express app

	const subscriptionServer = await SubscriptionServer.create(
		{
			schema,
			execute,
			subscribe,
		},
		{
			server: httpServer,
			path: apolloServer.graphqlPath,
		}
	);

	await require("./server/config/config"); //waiting for a response from the data bade

	const PORT = process.env.PORT || 4000;
	httpServer.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}/`));
	//using the client app

	// console.log(subscriptionServer);

	// const server = app.listen(process.env.port, () =>
	// 	console.log(
	// 		`listening on port ${process.env.port}\nhttp://localhost:${process.env.port}/graphql/`
	// 	)
	// ); //alerts that the server is running

	// let connectedClients = 0;

	// // initializing websocket instance that give us websocket funtionality by using socket.io and passing to the server
	// const io = new Server(server, {
	// 	cors: {
	// 		origin: "http://localhost:5173",
	// 		// Credential: true,
	// 	},
	// });

	// // when a new client(tab on the browser) joins(connects to the app) this io.on("connection") listener will get triggered
	// io.on("connection", (socket) => {
	// 	connectedClients++;
	// 	console.log(
	// 		`new client has join us we now have ${connectedClients} clients connected and the socket id are:${socket.id} `
	// 	);
	// 	socket.on("new_client_added", (clientInfo) => {
	// 		console.log("receive client info", clientInfo);
	// 		//pubsub.publish("CLIENT_ADDED", { newClientInfo });  Publish the new client data
	// 		socket.broadcast.emit("reload_client_list", clientInfo);
	// 	});
	// });
};

startServer(); //calling  the function

// const express = require("express");
// const { ApolloServer } = require("apollo-server-express");
// const { createServer } = require("http");
// const { SubscriptionServer } = require("subscriptions-transport-ws");
// const { execute, subscribe } = require("graphql");
// const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const path = require("path");

// const { clientTypeDef } = require("./server/graphQL/types/client.typeDef");
// const { clientResolvers } = require("./server/graphQL/resolvers/client.resolver");
// const { vehicleTypeDef } = require("./server/graphQL/types/vehicle.typeDef");
// const { vehicleResolvers } = require("./server/graphQL/resolvers/vehicle.resolver");
// const { dealTypeDef } = require("./server/graphQL/types/deal.typeDef");
// const { dealResolvers } = require("./server/graphQL/resolvers/deal.resolver");

// const mergedTypeDefs = mergeTypeDefs([clientTypeDef, vehicleTypeDef, dealTypeDef]);
// const mergedResolvers = mergeResolvers([clientResolvers, vehicleResolvers, dealResolvers]);
// const schema = makeExecutableSchema({
// 	typeDefs: mergedTypeDefs,
// 	resolvers: mergedResolvers,
// });

// const startServer = async () => {
// 	const app = express();
// 	const httpServer = createServer(app);

// 	app.use(express.static(path.join(__dirname, "/server/client/bendecks_auto_sales/dist")));

// 	const apolloServer = new ApolloServer({
// 		schema,
// 	});

// 	await apolloServer.start();
// 	apolloServer.applyMiddleware({ app });

// 	const subscriptionServer = await SubscriptionServer.create(
// 		{
// 			schema,
// 			execute,
// 			subscribe,
// 		},
// 		{
// 			server: httpServer,
// 			path: apolloServer.graphqlPath,
// 		}
// 	);

// 	await require("./server/config/config");

// 	const PORT = process.env.PORT || 4000;
// 	httpServer.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}/`));
// };

// startServer();

// Clear the cache for a specific module
// delete require.cache[require.resolve("./path/to/module")];

// // Clear the entire module cache
// Object.keys(require.cache).forEach((key) => {
// 	delete require.cache[key];
// });
