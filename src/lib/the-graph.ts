// IMPORTANT: we don't expose the key to the client
export const fetchCrTheGraphEndpoint = `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`
export const fetchDaoTheGraphEndpoint = `${process.env.DAO_GRAPH_URL}/${process.env.DAO_GRAPH_API_KEY}/${process.env.DAO_GRAPH_ID}`
