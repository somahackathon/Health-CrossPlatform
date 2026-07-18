// RN never calls the AI servers directly — the Spring server is the only
// backend this app talks to, and it forwards analysis requests to AI.
// See Health-Server/docs/architecture.md.
export const API_BASE_URL = 'https://port-0-health-server-mrq96ed71fc6d5c4.sel3.cloudtype.app';
