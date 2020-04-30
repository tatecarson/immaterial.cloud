import Peer from 'peerjs'
import { Map } from 'immutable'
import { randomDigits, resetPreset } from './utils'
import { settings, presets } from './presets'
import { PRESETS as sample, loadPreset}  from './index'
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
let globalPeers = []

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
    console.log('Received data:\n', data)

    // host message is set here:
		settings.endPreset = data.message

		loadPreset(data.sample)
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
		console.log('Received data in join func:\n', data)
		
		settings.endPreset = data.message

		loadPreset(data.sample)
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
	globalPeers = peerList || generatePeerList()
	
  document.getElementById('peerList').innerText = peerList || generatePeerList()
}

function generatePeerList() {
  return clientConnections
    .map((connection) => connection.peer)
    .toList()
    .push(`${peerId}`)
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
		message: '', 
		sample: ''
  }

	makePresetList(data).forEach(preset => {
		if (parseInt(preset.peerList) == peerId) {
			settings.endPreset = preset.preset
			data.message = settings.endPreset
			data.sample = preset.sample
		}
	})

  if (hostConnection) {
		console.log('SSS' + JSON.stringify(data))
    hostConnection.send(data)
  }

  // host send
	if (!clientConnections.isEmpty()) {
		// console.log('host???', data)
		loadPreset(data.sample)
    broadcast({
      ...data,
      peers: generatePeerList()
    })
  }
}

function makePresetList() {
  let presetPeerList = []
	
	Object.keys(presets).forEach((preset, i) => {
		presetPeerList.push({ preset: preset, peerList: globalPeers.split(',')[i], sample: sample[i] })
  })
	
	return presetPeerList
}

