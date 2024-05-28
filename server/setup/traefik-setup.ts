import path from "node:path";
import { MAIN_TRAEFIK_PATH, DYNAMIC_TRAEFIK_PATH, docker } from "../constants";
import { pullImage } from "../utils/docker/utils";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dump } from "js-yaml";
import type { MainTraefikConfig } from "../utils/traefik/types";
import type { FileConfig } from "../utils/traefik/file-types";
import type { CreateServiceOptions } from "dockerode";

export const initializeTraefik = async () => {
	const imageName = "traefik:v2.5";
	const containerName = "dokploy-traefik";
	const settings: CreateServiceOptions = {
		Name: containerName,
		TaskTemplate: {
			ContainerSpec: {
				Image: imageName,
				Mounts: [
					{
						Type: "bind",
						Source: `${MAIN_TRAEFIK_PATH}/traefik.yml`,
						Target: "/etc/traefik/traefik.yml",
					},
					{
						Type: "bind",
						Source: DYNAMIC_TRAEFIK_PATH,
						Target: "/etc/dokploy/traefik/dynamic",
					},
					{
						Type: "bind",
						Source: "/var/run/docker.sock",
						Target: "/var/run/docker.sock",
					},
				],
			},
			Networks: [{ Target: "dokploy-network" }],
			RestartPolicy: {
				Condition: "on-failure",
			},
		},
		Mode: {
			Replicated: {
				Replicas: 1,
			},
		},
		EndpointSpec: {
			Ports: [
				{
					TargetPort: 443,
					PublishedPort: 443,
					PublishMode: "host",
				},
				{
					TargetPort: 80,
					PublishedPort: 80,
					PublishMode: "host",
				},
				{
					TargetPort: 8080,
					PublishedPort: 8080,
					PublishMode: "host",
				},
			],
		},
	};
	try {
		await pullImage(imageName);

		const service = docker.getService(containerName);
		const inspect = await service.inspect();
		await service.update({
			version: Number.parseInt(inspect.Version.Index),
			...settings,
		});

		console.log("Traefik Started ✅");
	} catch (error) {
		await docker.createService(settings);
		console.log("Traefik Not Found: Starting ✅");
	}
};

export const createDefaultServerTraefikConfig = () => {
	const configFilePath = path.join(DYNAMIC_TRAEFIK_PATH, "dokploy.yml");
	if (existsSync(configFilePath)) {
		console.log("Default traefik config already exists");
		return;
	}

	const appName = "dokploy";
	const serviceURLDefault = `http://${appName}:${process.env.PORT || 3000}`;
	const config: FileConfig = {
		http: {
			routers: {
				[`${appName}-router-app`]: {
					rule: `Host(\`${appName}.docker.localhost\`) && PathPrefix(\`/\`)`,
					service: `${appName}-service-app`,
					entryPoints: ["web", "websecure"],
					tls: {},
				},
			},
			services: {
				[`${appName}-service-app`]: {
					loadBalancer: {
						servers: [{ url: serviceURLDefault }],
						passHostHeader: true,
					},
				},
			},
		},
	};

	const yamlStr = dump(config);
	mkdirSync(DYNAMIC_TRAEFIK_PATH, { recursive: true });
	writeFileSync(
		path.join(DYNAMIC_TRAEFIK_PATH, `${appName}.yml`),
		yamlStr,
		"utf8",
	);
};

export const createDefaultTraefikConfig = () => {
	const mainConfig = path.join(MAIN_TRAEFIK_PATH, "traefik.yml");
	if (existsSync(mainConfig)) {
		console.log("Main config already exists");
		return;
	}
	const configObject: MainTraefikConfig = {
		providers: {
			...(process.env.NODE_ENV === "development"
				? {
						docker: {
							defaultRule:
								"Host(`{{ trimPrefix `/` .Name }}.docker.localhost`)",
						},
					}
				: {
						docker: {
							exposedByDefault: false,
						},
					}),
			file: {
				directory: "/etc/dokploy/traefik/dynamic",
				watch: true,
			},
		},
		entryPoints: {
			web: {
				address: ":80",
				...(process.env.NODE_ENV === "production" && {
					http: {
						redirections: {
							entryPoint: {
								to: "websecure",
								scheme: "https",
								permanent: true,
							},
						},
					},
				}),
			},
			websecure: {
				address: ":443",
				...(process.env.NODE_ENV === "production" && {
					http: {
						tls: {
							certResolver: "letsencrypt",
						},
					},
				}),
			},
		},
		api: {
			insecure: true,
		},
		...(process.env.NODE_ENV === "production" && {
			certificatesResolvers: {
				letsencrypt: {
					acme: {
						email: "test@localhost.com",
						storage: "/etc/dokploy/traefik/dynamic/acme.json",
						httpChallenge: {
							entryPoint: "web",
						},
					},
				},
			},
		}),
	};

	const yamlStr = dump(configObject);
	mkdirSync(MAIN_TRAEFIK_PATH, { recursive: true });
	writeFileSync(mainConfig, yamlStr, "utf8");
};

export const createDefaultMiddlewares = () => {
	const middlewaresPath = path.join(DYNAMIC_TRAEFIK_PATH, "middlewares.yml");
	if (existsSync(middlewaresPath)) {
		console.log("Default middlewares already exists");
		return;
	}
	const defaultMiddlewares = {
		http: {
			middlewares: {
				"redirect-to-https": {
					redirectScheme: {
						scheme: "https",
						permanent: true,
					},
				},
			},
		},
	};
	const yamlStr = dump(defaultMiddlewares);
	mkdirSync(DYNAMIC_TRAEFIK_PATH, { recursive: true });
	writeFileSync(middlewaresPath, yamlStr, "utf8");
};
