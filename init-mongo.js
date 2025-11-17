rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongo:${MONGO_PORT_CONTAINER}" }], // FIXED: Uses container port
});
