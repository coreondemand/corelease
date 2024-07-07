import { authRouter } from "@/server/api/routers/auth";
import { projectRouter } from "./routers/project";
import { applicationRouter } from "./routers/application";
import { mysqlRouter } from "./routers/mysql";
import { postgresRouter } from "./routers/postgres";
import { redisRouter } from "./routers/redis";
import { mongoRouter } from "./routers/mongo";
import { mariadbRouter } from "./routers/mariadb";
import { userRouter } from "./routers/user";
import { domainRouter } from "./routers/domain";
import { destinationRouter } from "./routers/destination";
import { backupRouter } from "./routers/backup";
import { deploymentRouter } from "./routers/deployment";
import { mountRouter } from "./routers/mount";
import { certificateRouter } from "./routers/certificate";
import { settingsRouter } from "./routers/settings";
import { redirectsRouter } from "./routers/redirects";
import { securityRouter } from "./routers/security";
import { portRouter } from "./routers/port";
import { adminRouter } from "./routers/admin";
import { dockerRouter } from "./routers/docker";
import { composeRouter } from "./routers/compose";
import { registryRouter } from "./routers/registry";
import { clusterRouter } from "./routers/cluster";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	admin: adminRouter,
	docker: dockerRouter,
	auth: authRouter,
	project: projectRouter,
	application: applicationRouter,
	mysql: mysqlRouter,
	postgres: postgresRouter,
	redis: redisRouter,
	mongo: mongoRouter,
	mariadb: mariadbRouter,
	compose: composeRouter,
	user: userRouter,
	domain: domainRouter,
	destination: destinationRouter,
	backup: backupRouter,
	deployment: deploymentRouter,
	mounts: mountRouter,
	certificates: certificateRouter,
	settings: settingsRouter,
	security: securityRouter,
	redirects: redirectsRouter,
	port: portRouter,
	registry: registryRouter,
	cluster: clusterRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
