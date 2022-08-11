export const UNHEALTHY_LIMIT = 4;

export function isUnhealthy(probingDepth) {
	return probingDepth >= UNHEALTHY_LIMIT;
}
