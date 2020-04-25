import Peer from 'peerjs'
import { Map } from 'immutable'
import { randomDigits, resetPreset } from './utils'
import { settings, presets } from './presets'
// import { autoPlay } from './index'
var clientConnections = Map({})

var hostConnection

const peerId = randomDigits(4)

// export const peer = new Peer(peerId)
const peer = new Peer(peerId, {
  host: 'kfwong-server.herokuapp.com',
  port: 443,
  path: '/myapp',
  secure: true
})
document.getElementById('hostIdBtn').addEventListener('click', () => join())

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
})

// Runs when another peer connects to this peer
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
      sender: 'SYSTEM'
      // message: presetPeerList,
    }

		updatePeerList()

    broadcast({
      ...data,
      peers: generatePeerList()
    })
  })

  connection.on('data', (data) => {
    console.log('Recvied data:\n', data, data.message)

    // host message is set here:
    settings.endPreset = data.message
		resetPreset()
    
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
    
    broadcast({
      ...data,
      peers: generatePeerList()
    })
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

export function reconnect () {
  console.log(`Reconnecting to signaller.`)
  document.getElementById('signallerBtn').disabled = true

  document.getElementById(
    'signallerBtn'
  ).innerText = `◌ SEARCHING FOR SIGNALLER...`
  peer.reconnect()
}

export function join () {
  hostConnection = peer.connect(
    document.getElementById('hostIdVal').value
  )

  hostConnection.on('open', () => {
    console.log(
      `Connection to ${hostConnection.peer} established.`
    )
  })

  hostConnection.on('data', (data) => {
    console.log('Recvied data in join func:\n', data)
		
    settings.endPreset = data.message
   	resetPreset()
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

function updatePeerList(peerList) {
  document.getElementById('peerList').innerText = peerList || generatePeerList()
}

function generatePeerList () {
  return clientConnections
    .map((connection) => connection.peer)
    .toList()
    .push(`${peerId} (HOST)`)
    .join(', ')
}

export function broadcast(data) {
  clientConnections.forEach((connection) =>
    connection.send(data)
  )
}

export function send () {
  const data = {
    sender: peerId,
    message: ''
  }

	// working>
	makePresetList().forEach(preset => {
		if (parseInt(preset.peerList) == peerId) {
			settings.endPreset = preset.preset
			data.message = settings.endPreset
		}
	})

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
  }
}

function makePresetList () {
  let peerList = generatePeerList().length == 1 ? generatePeerList() : generatePeerList().split(',')
  let presetPeerList = []

  Object.keys(presets).forEach((preset, i) => {
    presetPeerList.push({ preset: preset, peerList: peerList[i] })
  })

  return presetPeerList
}

