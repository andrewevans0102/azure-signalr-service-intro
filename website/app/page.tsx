'use client';

import * as signalR from '@microsoft/signalr';
import { useMemo, useState } from 'react';
import axios from 'axios';
import './globals.css';

const negotiateUrl = 'http://localhost:7071/api/negotiate';
const broadcastUrl = 'http://localhost:7071/api/broadcast';

export default function Home() {
    const [payload, setPayload] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // do this in useMemo and not useEffect since
    // when page updates occur a rerender will occur firing the useEffect
    useMemo(() => {
        // call negotiate endpoint firest
        axios.get(negotiateUrl).then((response) => {
            const options = {
                accessTokenFactory: () => response.data.accessToken,
            };

            // define connection
            const connection = new signalR.HubConnectionBuilder()
                .withUrl(response.data.url, options)
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // create listener method that responds when messages sent
            connection.on('newMessage', (message) => {
                setLoading(true);
                setMessages((prevMessages) => [...prevMessages, message]);
                setLoading(false);
            });

            connection.onclose(() => console.log('disconnected'));
            console.log('connecting...');

            // start connection
            connection
                .start()
                .then(() => console.log('ready...'))
                .catch(console.error);
        });
    }, []);

    const sendMessage = () => {
        axios
            .post(broadcastUrl, {
                payload,
            })
            .then(() => {
                console.log('message sent');
            });
    };

    return (
        <main>
            <h1>SignalR Intro</h1>

            <section className="wrapper">
                <article className="output">
                    {loading ? (
                        <p>new messages are being retrieved</p>
                    ) : (
                        messages.map((value) => {
                            return <p>{value}</p>;
                        })
                    )}
                </article>
            </section>
            <section className="wrapper">
                <article className="input">
                    <label>payload:</label>
                    <input
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                        name="payloadInput"
                        style={{ margin: '10px' }}
                    />
                    <button className="message" onClick={sendMessage}>
                        send message
                    </button>
                </article>
            </section>
        </main>
    );
}
