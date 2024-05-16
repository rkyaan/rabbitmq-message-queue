const amqp = require('amqplib');

async function consumeMessages() {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const exchange = 'notification';
        const queue = 'email_queue';
        const routingKey = 'email';

        await channel.assertExchange(exchange, 'direct', { durable: true });

        await channel.assertQueue(queue, { durable: true });

        await channel.bindQueue(queue, exchange, routingKey);

        await channel.consume(queue, function(message) {
            const messageContent = JSON.parse(message.content.toString());
            console.info(`Routing Key: ${message.fields.routingKey}`);
            console.info(`Subject: ${messageContent.subject}`);
            console.info(`Body: ${messageContent.body}`);
            channel.ack(message);
        }, {
            noAck: false
        });


        process.on('SIGINT', async () => {
            console.log('Closing connection...');
            await channel.close();
            await connection.close();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('Error in consuming messages:', error);
    }
}

consumeMessages();
