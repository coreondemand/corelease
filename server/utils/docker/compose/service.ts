// En la sección depends_on de otros servicios: Para definir dependencias entre servicios.
// En la sección networks de otros servicios: Aunque esto no es común, es posible referenciar servicios en redes personalizadas.
// En la sección volumes_from de otros servicios: Para reutilizar volúmenes definidos por otro servicio.
// En la sección links de otros servicios: Para crear enlaces entre servicios.
// En la sección extends de otros servicios: Para extender la configuración de otro servicio.

import _ from "lodash";
import type { ComposeSpecification, DefinitionsService } from "../types";
type DependsOnObject = NonNullable<
	Exclude<DefinitionsService["depends_on"], string[]> extends infer T
		? { [K in keyof T]: T[K] }
		: never
>;

export const addPrefixToServiceNames = (
	services: { [key: string]: DefinitionsService },
	prefix: string,
): { [key: string]: DefinitionsService } => {
	const newServices: { [key: string]: DefinitionsService } = {};

	for (const [serviceName, serviceConfig] of Object.entries(services)) {
		const newServiceName = `${serviceName}-${prefix}`;
		const newServiceConfig = _.cloneDeep(serviceConfig);

		// Reemplazar nombres de servicios en depends_on
		if (newServiceConfig.depends_on) {
			if (Array.isArray(newServiceConfig.depends_on)) {
				newServiceConfig.depends_on = newServiceConfig.depends_on.map(
					(dep) => `${dep}-${prefix}`,
				);
			} else {
				const newDependsOn: DependsOnObject = {};
				for (const [depName, depConfig] of Object.entries(
					newServiceConfig.depends_on,
				)) {
					newDependsOn[`${depName}-${prefix}`] = depConfig;
				}
				newServiceConfig.depends_on = newDependsOn;
			}
		}

		// Reemplazar nombre en container_name
		if (newServiceConfig.container_name) {
			newServiceConfig.container_name = `${newServiceConfig.container_name}-${prefix}`;
		}

		// Reemplazar nombres de servicios en links
		if (newServiceConfig.links) {
			newServiceConfig.links = newServiceConfig.links.map(
				(link) => `${link}-${prefix}`,
			);
		}

		// Reemplazar nombres de servicios en extends
		if (newServiceConfig.extends) {
			if (typeof newServiceConfig.extends === "string") {
				newServiceConfig.extends = `${newServiceConfig.extends}-${prefix}`;
			} else {
				newServiceConfig.extends.service = `${newServiceConfig.extends.service}-${prefix}`;
			}
		}

		// Reemplazar nombres de servicios en volumes_from
		if (newServiceConfig.volumes_from) {
			newServiceConfig.volumes_from = newServiceConfig.volumes_from.map(
				(vol) => `${vol}-${prefix}`,
			);
		}

		newServices[newServiceName] = newServiceConfig;
	}

	return newServices;
};

export const addPrefixToAllServiceNames = (
	composeData: ComposeSpecification,
	prefix: string,
): ComposeSpecification => {
	const updatedComposeData = { ...composeData };

	// if (updatedComposeData.services) {
	// 	updatedComposeData.services = addPrefixToServiceNamesRoot(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);
	// 	updatedComposeData.services = addPrefixToDependsOn(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);
	// 	updatedComposeData.services = addPrefixToVolumesFrom(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);
	// 	updatedComposeData.services = addPrefixToLinks(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);
	// 	updatedComposeData.services = addPrefixToExtends(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);

	// 	updatedComposeData.services = addPrefixToContainerNames(
	// 		updatedComposeData.services,
	// 		prefix,
	// 	);
	// }

	return updatedComposeData;
};
