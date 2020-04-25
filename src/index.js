import Granular from 'granular-js'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound'

import VConsole from 'vconsole'

import getData from './getData'
import Grains from './Grains'
import AutoPlay from './AutoPlay'
import { send, reconnect } from './Peers'


const vConsole = new VConsole()

// TODO: rewrite to remove all the dom stuff from granular demo
// TODO: add more sounds
const PRESETS = [
  {
    name: 1,
    url: 'samples/ringTones.wav'
  },
  {
    name: '2',
    url: 'samples/clipsmall.mp3'
  },
  {
    name: 3,
    url: 'samples/four1.wav'
  },
  {
    name: 4,
    url: 'samples/gotit1.wav'
  }
]

const pillPlay = document.getElementById('pill-play'),
  pillLoading = document.getElementById('pill-loading')

export let autoPlay,
  granular

const AUDIO_BUFFER_CACHE = {}

async function loadPreset ({ name, url }) {
  if (process.ENV === 'development') {
    console.log(`load preset ${name}`)
  }

  autoPlay.stop()

  pillPlay.textContent = 'Play'

  pillLoading.classList.remove('hidden')
  pillPlay.classList.add('inactive')
  // presets.classList.add('inactive')

  let data

  if (AUDIO_BUFFER_CACHE[name]) {
    // AudioBuffer
    data = AUDIO_BUFFER_CACHE[name]
  } else {
    // ArrayBuffer
    data = await getData(url)
  }

  const audioBuffer = await granular.setBuffer(data)

  AUDIO_BUFFER_CACHE[name] = audioBuffer

  pillLoading.classList.add('hidden')
  pillPlay.classList.remove('inactive')
  // presets.classList.remove('inactive')
}

async function init () {
  const audioContext = p5.prototype.getAudioContext()

  granular = new Granular({
    audioContext,
    envelope: {
      attack: 0,
      decay: 0.5
    },
    density: 0.8,
    spread: 0.1,
    pitch: 1
  })

  const delay = new p5.Delay()

  delay.process(granular, 0, 0.5, 3000) // source, delayTime, feedback, filter frequency

  const reverb = new p5.Reverb()

  // due to a bug setting parameters will throw error
  // https://github.com/processing/p5.js/issues/3090
  reverb.process(delay) // source, reverbTime, decayRate in %, reverse

  reverb.amp(1)

  const compressor = new p5.Compressor()

  compressor.process(reverb, 0.005, 6, 10, -24, 0.05) // [attack], [knee], [ratio], [threshold], [release]
	
  // turnoff to test peerjs
  new Grains(granular)

  autoPlay = new AutoPlay(granular)

  pillPlay.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (autoPlay.isRunning()) {
      autoPlay.stop()

      pillPlay.textContent = 'Play'
    } else {
      autoPlay.start()

      pillPlay.textContent = 'Stop'
    }
  })

  window.addEventListener('keydown', (key) => {
    // space
    if (event.keyCode === 32) {
      send()
    }
  })
	
	// TODO: get this to switch between sounds, its currently only doing it at the start
	setInterval(await loadPreset(PRESETS[Math.round(Math.random())], 5000))
}

init()
