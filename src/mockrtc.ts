/*
 * SPDX-FileCopyrightText: 2022 Tim Perry <tim@httptoolkit.tech>
 * SPDX-License-Identifier: Apache-2.0
 */

import type { MockRTCHandlerBuilder } from "./handling/handler-builder";
import type { ConnectionMetadata, MockRTCPeer } from "./mockrtc-peer";

export interface MockRTCPeerBuilder extends MockRTCHandlerBuilder<MockRTCPeer> {}

export interface MockRTCOptions {

    /**
     * Should the server print extra debug information?
     */
    debug?: boolean;

    /**
     * Whether or not all DataChannel messages should be saved for later examination.
     * This can be useful in quick testing, but may use large amounts of data if
     * enabled when proxying lots of traffic.
     *
     * Defaults to false.
     */
    recordMessages?: boolean;
}

export interface SelectedRTCCandidate {
    address: string;
    port: number;
    protocol: 'udp' | 'tcp';
    type: string;
};

export type MockRTCEventData = {
    "peer-connected": {
        peerId: string;
        sessionId: string;
        metadata: ConnectionMetadata,
        localSdp: RTCSessionDescriptionInit;
        remoteSdp: RTCSessionDescriptionInit;
        selectedLocalCandidate: SelectedRTCCandidate;
        selectedRemoteCandidate: SelectedRTCCandidate;
    },
    "peer-disconnected": {
        peerId: string;
        sessionId: string;
    },
    "external-peer-attached": {
        peerId: string;
        sessionId: string;
        externalConnection: {
            peerId: string;
            sessionId: string;
            localSdp: RTCSessionDescriptionInit;
            remoteSdp: RTCSessionDescriptionInit;
            selectedLocalCandidate: SelectedRTCCandidate;
            selectedRemoteCandidate: SelectedRTCCandidate;
        }
    },
    "data-channel-opened": {
        peerId: string;
        sessionId: string;
        channelId: number;
        channelLabel: string;
        channelProtocol: string;
    },
    "data-channel-message-sent": {
        peerId: string;
        sessionId: string;
        channelId: number;
        direction: 'sent';
        content: Buffer;
        isBinary: boolean;
    },
    "data-channel-message-received": {
        peerId: string;
        sessionId: string;
        channelId: number;
        direction: 'received';
        content: Buffer;
        isBinary: boolean;
    },
    "data-channel-closed": {
        peerId: string;
        sessionId: string;
        channelId: number;
    }
    "media-track-opened": {
        peerId: string;
        sessionId: string;
        trackMid: string;
        trackType: string;
        trackDirection: string;
    },
    "media-track-stats": {
        peerId: string;
        sessionId: string;
        trackMid: string;

        totalBytesSent: number;
        totalBytesReceived: number;
    },
    "media-track-closed": {
        peerId: string;
        sessionId: string;
        trackMid: string;
    }
};

export type MockRTCEvent = keyof MockRTCEventData;

export interface MockRTC {

    /**
     * Start creating a mock WebRTC peer. This method returns a builder, who
     * must be configured with the mock peer's settings. Once configured the
     * peer can be created by calling any `.thenX()` method to define the
     * peer's behaviour.
     */
    buildPeer(): MockRTCPeerBuilder;

    start(): Promise<void>;

    stop(): Promise<void>;

    on<E extends MockRTCEvent>(event: E, callback: (param: MockRTCEventData[E]) => void): Promise<void>;

}