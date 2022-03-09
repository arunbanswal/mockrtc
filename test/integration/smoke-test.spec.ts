import {
    MockRTC,
    expect
} from '../test-setup';

describe("MockRTC", function () {

    const mockRTC = MockRTC.getRemote({ recordMessages: true });

    beforeEach(() => mockRTC.start());
    afterEach(() => mockRTC.stop());

    it("should pass the README example test", async () => {
        // Create a mock peer who sends 'Goodbye' after receiving its first message.
        const mockPeer = await mockRTC.buildPeer().waitForMessage().thenSend('Goodbye');

        // Create a data connection:
        const localConnection = new RTCPeerConnection();
        const dataChannel = localConnection.createDataChannel("dataChannel");

        const localOffer = await localConnection.createOffer();
        await localConnection.setLocalDescription(localOffer);

        // Get the remote details for the mock peer:
        const mockAnswer = await mockPeer.answerOffer(localOffer);
        await localConnection.setRemoteDescription(mockAnswer);

        // Once the connection is open, message the peer
        dataChannel.onopen = () => {
            dataChannel.send('Hello');
        };

        // Wait for a response:
        const message = await new Promise((resolve) => {
            dataChannel.addEventListener('message', (event) => resolve(event.data));
        });
        expect(message).to.equal('Goodbye'); // <-- We get our mock response!

        // Assert on the messages the mock peer received:
        expect(await mockPeer.getAllMessages()).to.deep.equal(['Hello']);
    });

});