import React, { useEffect, useRef, useState } from 'react';
import { Button, View, Text, TextInput } from 'react-native';
import AudioRecord from 'react-native-audio-record';
// import { WebSocket } from 'react-native-websocket';
// import { Buffer } from 'buffer';
import io from "socket.io-client";

const AudioRecorder = () => {
    const segmentPoints = [
        0, 4167, 9882, 15172, 21058, 26433, 30954, 36243, 42215, 47846, 52879, 59107,
        64566, 70197, 75316, 80861, 89136,
    ];

    const labels = [
        "THA",
        "DHI",
        "THOM",
        "NAM",
        "THA",
        "DHI",
        "THOM",
        "NAM",
        "THA",
        "DHI",
        "THOM",
        "NAM",
        "THA",
        "DHI",
        "THOM",
        "NAM",
    ];


    const socket = useRef(null);
    const ws = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const sendIntervalRef = useRef(null);
    const audioChunksRef = useRef([]);

    const connectWebSocket = () => {
        socket.current = io("https://project-k-wy7t2bw33a-el.a.run.app");

        socket.current.on("connect", () => {
            console.log("WebSocket connection established");

            // Send segment points after connection is established
            socket.current.emit("lesson-data", { segmentPoints, labels });
        });

        socket.current.on("disconnect", () => {
            console.log("WebSocket connection closed");
        });

        socket.current.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

        socket.current.on("segment-response", ({ segmentIndex, response }) => {
            console.log(`Segment ${segmentIndex}:`, response);
        });
        socket.current.on("overall-response", (res) => {
            if (res === "wrong") {
                socket.current.emit("manual-disconnect");
            } else {
                console.log("All are correct");
            }
        });
    };

    useEffect(() => {
        // ws.current = new WebSocket('ws://192.168.31.230:8080');
        // ws.current.onopen = () => {
        //     console.log('WebSocket connected');
        // };

        // ws.current.onclose = () => {
        //     console.log('WebSocket disconnected');
        //     stopRecording();
        // };

        // ws.current.onerror = (error) => {
        //     console.error('WebSocket error', error);
        // };

        connectWebSocket();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            clearInterval(sendIntervalRef.current);
            audioChunksRef.current = [];
        };
    }, []);

    const initAudioRecord = () => {
        const options = {
            sampleRate: 22050,
            channels: 1,
            bitsPerSample: 16,
            wavFile: 'test.wav'
        };

        AudioRecord.init(options);

        AudioRecord.on('data', chunk => {
            audioChunksRef.current.push(chunk);
        });

    }

    const sendAudioData = (chunk) => {
        if (socket.current && socket.current.connected) {
            socket.current.emit("audio-chunk", chunk);
        }
    };

    useEffect(() => {
        initAudioRecord();
    }, [])

    const startRecording = () => {


        AudioRecord.start();
        setIsRecording(true);

        sendIntervalRef.current = setInterval(() => {
            if (audioChunksRef.current.length > 0) {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                sendAudioData(blob);
                audioChunksRef.current = []; // Clear chunks after sending
            }
        }, 600);
    };

    const stopRecording = () => {
        if (isRecording) {
            AudioRecord.stop();
            setIsRecording(false);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            {isRecording ? (
                <Button title="Stop Recording" onPress={stopRecording} />
            ) : (
                <Button title="Start Recording" onPress={startRecording} />
            )}
        </View>
    );
};

export default AudioRecorder;
