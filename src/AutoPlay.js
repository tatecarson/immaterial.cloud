import * as dat from 'dat.gui'
import preset from './presets'
import SimplexNoise from 'simplex-noise'
import Srl from 'total-serialism/build/ts.es5.min.js'
import Nexus from 'nexusui'

const Mod = Srl.Transform
const Rand = Srl.Stochastic

const simplex = new SimplexNoise(Math.random)

const ID = 'autoPlay'

const gui = new dat.GUI({
  load: {
    'preset': 'deeper',
    'remembered': {
      'Default': {
        '0': {}
      },
      'preset1': {
        '0': {
          'pitch': 5.331566469093988,
          'attack': 0.8720000000000002,
          'release': 1.320000000000001,
          'density': 0.6591024555461473
        }
      },
      'deeper': {
        '0': {
          'pitch': 0.7274682472480949,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      }
    },
    'closed': false,
    'folders': {}
  }})

const settings = {
  attack: 0.1,
  release: 0.1,
  pitch: 1,
  density: 1
}
gui.add(settings, 'pitch', 0.1, 6)
gui.add(settings, 'attack')
gui.add(settings, 'release')
gui.add(settings, 'density', 0, 1)

gui.remember(settings)
export default class AutoPlay {
  constructor (granular) {
    this.granular = granular

    this.running = false
  }

  isRunning () {
    return this.running
  }

  start () {
    if (this.running) {
      return
    }

    const { granular } = this

    this.running = true

    let x = simplex.noise2D(performance.now() / 10000, 0)
    const palindrome = new Nexus.Sequence(Mod.palindrome([0, 7, 12, 3]))
    const dice = new Nexus.Sequence(Rand.dice(10))

    granular.set({
      pitch: 1
    })

    granular.startVoice({
      id: ID,
      position: map(x, -1, 1, 0, 1),
      volume: 0.5
    })

    const run = () => {
      x = simplex.noise2D(performance.now() / 10000, 0)

      granular.set({

        // pitch: dice.next(),
        pitch: settings.pitch,
        // density: map(palindrome.next(), 0, 12, 0, 1),
        density: settings.density,
        envelope: {
          // attack: map(x, -1, 1, 0, 0.5),
          attack: settings.release,
          release: settings.attack
        }
      })

      granular.updateVoice(ID, {
        position: map(palindrome.next(), 0, 12, 0, 1),
        volume: 0.5
      })

      if (this.running) {
        setTimeout(run)
      }
    }

    run()
  }

  stop () {
    this.granular.stopVoice(ID)

    this.running = false
  }
}

function map (value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
}
