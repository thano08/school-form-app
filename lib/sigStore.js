// In-memory store for officer signatures (persists during server session)
const store = global._officerSigs || (global._officerSigs = {
  thalaivar: '',
  porulaalar: '',
  seyalaalar: '',
});

export default store;
