export const WALKTHROUGH_STORAGE_KEY = '@virtualagent_walkthrough_seen';

// Dejar en true para mostrar el walkthrough a usuarios nuevos.
export const WALKTHROUGH_ENABLED = true;

// DEV ONLY:
// true  -> lo veras siempre en desarrollo aunque ya se haya visto.
// false -> respeta el flag guardado en AsyncStorage.
// Antes de produccion, dejar en false.
export const WALKTHROUGH_FORCE_SHOW_IN_DEV = true;
