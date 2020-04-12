import SimplexNoise from 'simplex-noise'
import Srl from 'total-serialism/build/ts.es5.min.js'
import Nexus from 'nexusui'

import { settings, interpolatePresets } from './presets'
import { map } from './utils'

const Mod = Srl.Transform
const Rand = Srl.Stochastic

const simplex = new SimplexNoise(Math.random)

const ID = 'autoPlay'

export default class AutoPlay {
  constructor (granular) {
    this.granular = granular

    this.running = false
  }

  isRunning () {
    return this.running
  }

  start () {
    // pitchController.setValue(10)
    if (this.running) {
      return
    }

    const { granular } = this

    this.running = true

    let x = simplex.noise2D(performance.now() / 10000, 0)
    const palindrome = new Nexus.Sequence(Mod.palindrome([0, 7, 12, 3]))
    const dice = new Nexus.Sequence(Rand.dice(10))
    let deeper = interpolatePresets(1000).pitch

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
        // pitch: settings.pitch,
        pitch: deeper.next(), //interpolating between presets 
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

  interpolate() {
    // TODO: write the interpolation stuff here 
  }

  stop () {
    this.granular.stopVoice(ID)

    this.running = false
  }
}
