const messages = []; // Array em memória para armazenar mensagens temporariamente

exports.handler = async (event) => {
  if (event.httpMethod === "POST") {
    // Parseia o corpo da requisição para obter os dados da mensagem
    const { username, message } = JSON.parse(event.body);

    if (!username || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username and message are required." }),
      };
    }

    // Adiciona a mensagem ao array
    const timestamp = new Date().toISOString();
    messages.push({ username, message, timestamp });

    // Retorna a mensagem adicionada
    return {
      statusCode: 200,
      body: JSON.stringify({ username, message, timestamp }),
    };
  }

  if (event.httpMethod === "GET") {
    // Retorna todas as mensagens armazenadas
    return {
      statusCode: 200,
      body: JSON.stringify(messages),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: "Method not allowed." }),
  };
};
