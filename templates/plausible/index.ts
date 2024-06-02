import {
	generateHash,
	generateRandomDomain,
	type Template,
	type Schema,
} from "../utils";

// https://pocketbase.io/docs/
export function generate(schema: Schema): Template {
	const mainServiceHash = generateHash(schema.projectName);
	const randomDomain = generateRandomDomain(schema);

	const envs = [
		`PLAUSIBLE_HOST=${randomDomain}`,
		"PLAUSIBLE_PORT=8000",
		`HASH=${mainServiceHash}`,
	];

	const mounts: Template["mounts"] = [
		{
			mountPath: "./clickhouse/clickhouse-config.xml",
			content: `
            <clickhouse>
            <logger>
                <level>warning</level>
                <console>true</console>
            </logger>
        
            <!-- Stop all the unnecessary logging -->
            <query_thread_log remove="remove"/>
            <query_log remove="remove"/>
            <text_log remove="remove"/>
            <trace_log remove="remove"/>
            <metric_log remove="remove"/>
            <asynchronous_metric_log remove="remove"/>
            <session_log remove="remove"/>
            <part_log remove="remove"/>
        </clickhouse>
            
            `,
		},
		{
			mountPath: "./clickhouse/clickhouse-user-config.xml",
			content: `
            <clickhouse>
                <profiles>
                    <default>
                        <log_queries>0</log_queries>
                        <log_query_threads>0</log_query_threads>
                    </default>
                </profiles>
            </clickhouse>
            `,
		},
	];

	return {
		envs,
		mounts,
	};
}
