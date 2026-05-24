export const handler = async () => {
  return {
    statusCode: 501,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ message: 'Not implemented yet' }),
  };
};
