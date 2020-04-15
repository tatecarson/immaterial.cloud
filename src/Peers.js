import Peer from 'peerjs'
import { Map } from 'immutable'
import { randomDigits } from './utils'

// TODO: connecting to signaler but not to other clients
// probably has something to do with DOM?
export function Peers() {
  let clientConnections = Map({})
  let hostConnection

  const peerId = randomDigits(4)
  // const peer = new Peer('asfasfdafsdfsd', {
  //   host: 'kfwong-server.herokuapp.com',
  //   port: 443,
  //   path: '/myapp',
  //   secure: true,
  // });

  const peer = new Peer(peerId)
  peer.on('open', (id) => {
    console.log('Connection to signaller establised.')
    console.log(`Assigning id: ${id}`)

    document.getElementById(
      'signallerBtn'
    ).innerText = `✔ CONNECTED TO SIGNALLER`

    document.getElementById('signallerBtn').disabled = true

    document.getElementById('selfId').innerText =
      'YOUR ID IS ' + id

    updatePeerList()

    document.getElementById('hostIdBtn').addEventListener('click', () => join())
    document.getElementById('send-message').addEventListener('click', () => send())
  })

  peer.on('connection', (connection) => {
    console.log(
      `${connection.peer} attempting to establish connection.`
    )

    connection.on('open', () => {
      console.log(
        `Connection to ${connection.peer} established.`
      )

      clientConnections = clientConnections.set(
        connection.peer,
        connection
      )

      const data = {
        sender: 'SYSTEM',
        message: `${connection.peer} joined.`
      }

      updatePeerList()
      updateMessageBoard(data.sender, data.message)

      broadcast({
        ...data,
        peers: generatePeerList()
      })
    })

    connection.on('data', (data) => {
      console.log('Recvied data:\n', data)

      updateMessageBoard(data.sender, data.message)

      broadcast({
        ...data,
        peers: generatePeerList()
      })
    })

    connection.on('close', () => {
      console.log(`Connection to ${connection.peer} is closed.`)
      clientConnections = clientConnections.delete(
        connection.peer.toString()
      )

      const data = {
        sender: 'SYSTEM',
        message: `${connection.peer} left.`
      }

      updatePeerList()
      updateMessageBoard(data.sender, data.message)

      broadcast({
        ...data,
        peers: generatePeerList()
      })

      document.getElementById('hostId').innerText =
        'NOT CONNECTED TO ANYONE'
    })
  })

  peer.on('disconnected', () => {
    console.log('Disconnected from signaller.')

    document.getElementById(
      'signallerBtn'
    ).innerText = `✘ DISCONNECTED FROM SIGNALLER. RECONNECT?`

    document.getElementById('signallerBtn').disabled = false
  })

  peer.on('error', (error) => {
    console.log(error)
  })

  function reconnect() {
    console.log(`Reconnecting to signaller.`)
    document.getElementById('signallerBtn').disabled = true

    document.getElementById(
      'signallerBtn'
    ).innerText = `◌ SEARCHING FOR SIGNALLER...`
    peer.reconnect()
  }

  function join() {
    hostConnection = peer.connect(
      document.getElementById('hostIdVal').value
    )

    hostConnection.on('open', () => {
      console.log(
        `Connection to ${hostConnection.peer} established.`
      )

      document.getElementById(
        'hostId'
      ).innerText = `CONNECTED TO ${hostConnection.peer}.`
    })

    hostConnection.on('data', (data) => {
      // TODO: synth goes here

      console.log('Recvied data:\n', data)

      updateMessageBoard(data.sender, data.message)

      updatePeerList(data.peers)
    })

    hostConnection.on('close', () => {
      console.log(
        `Connection to ${hostConnection.peer} is closed.`
      )

      peer.destroy()

      location.reload()
    })
  }

  function updateMessageBoard(id, message) {
    document.getElementById(
      'messageBoard'
    ).innerText += `[${id}]: ${message}\n`
  }

  function updatePeerList(peerList) {
    document.getElementById('peerList').innerText = peerList || generatePeerList()
  }

  function generatePeerList() {
    return clientConnections
      .map((connection) => connection.peer)
      .toList()
      .push(`${peerId} (HOST)`)
      .join(', ')
  }

  function broadcast(data) {
    clientConnections.forEach((connection) =>
      connection.send(data)
    )
  }

  function send() {
    const data = {
      sender: peerId,
      message: document.getElementById('message').value
    }

    if (hostConnection) {
      console.log('SSS' + JSON.stringify(data))
      hostConnection.send(data)
    }

    // host send
    if (!clientConnections.isEmpty()) {
      broadcast({
        ...data,
        peers: generatePeerList()
      })

      updateMessageBoard(data.sender, data.message)
    }

    document.getElementById('message').innerText = ''
  }

  function clear() {
    document.getElementById('message').innerText = ''
  }

  function hide(element) {
    element.classList.add('hidden')
  }

  function show(element) {
    element.classList.remove('hidden')
  }
}