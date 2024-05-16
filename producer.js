const amqp = require('amqplib');

async function produceMessages(messageIndices) {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        
        const exchange = 'notification';
        const routingKey = 'email';

        await channel.assertExchange(exchange, 'direct', { durable: true });

        const messages = [
            { subject: "Welcome to Our Service", body: "Thank you for signing up!" },
            { subject: "Your Order is Confirmed", body: "Your order #12345 has been confirmed." },
            { subject: "Password Reset", body: "Click here to reset your password." },

        ];

        for (const index of messageIndices) {
            if (index >= 0 && index < messages.length) {
                const msg = messages[index];
                const messageContent = JSON.stringify(msg);
                channel.publish(exchange, routingKey, Buffer.from(messageContent), {
                    headers: { 'sample': 'value' }
                });
                console.log(`Sent: ${messageContent}`);
            } else {
                console.error(`Invalid message index: ${index}`);
            }
        }

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error in producing messages:', error);
    }
}


const messageIndicesToSend = [0];

produceMessages(messageIndicesToSend);
