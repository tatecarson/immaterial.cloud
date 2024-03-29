import Srl from 'total-serialism/build/ts.es5.min.js'
import Nexus from 'nexusui'

import {
  settings,
  interpolatePresets
} from './presets'
import { map } from './utils'
import { delay } from './processing'

const Mod = Srl.Transform
const Rand = Srl.Stochastic
const Gen = Srl.Generative
const Util = Srl.Utility
const Algo = Srl.Algorithmic 

const ID = 'autoPlay'

export default class AutoPlay {
  constructor (granular) {
    this.granular = granular
		this.running = false

		this.density = new Nexus.Sequence(Util.add(Algo.euclid(16, 5), Algo.euclid(11, 3, 2)))
		this.delaySet = new Nexus.Sequence(Util.map(Gen.sine(20), 0, 20, 0, 1))
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

		const palindrome = new Nexus.Sequence(Mod.palindrome([0, 7, 12, 3, 4, 2, 11]))

		delay.drywet(this.delaySet.next())
		
    granular.startVoice({
      id: ID,
      position: 0
    })

		// set the first time
		let time = Rand.choose(1, [10, 500, 1000, 2000, 3000])[0]
    let interpolate = interpolatePresets({
      density: granular.state.density,
      pitch: granular.state.pitch,
      attack: granular.state.envelope.attack,
      release: granular.state.envelope.release
		}, settings.endPreset, time)

    const run = () => {
      let mode = settings.mode

      if (mode === 'interpolate') {
        // run the interpolate settings
        if (interpolate.pitch.position !== interpolate.pitch.values.length - 1) {
          granular.set({
            pitch: interpolate.pitch.next(), // interpolating between presets
            density: interpolate.density.next(),
            envelope: {
              attack: interpolate.attack.next(),
              release: interpolate.release.next()
            }
          })
        }
      } else if (mode === 'preset') {
        // run the normal settings from dat.gui
        granular.set({
          pitch: settings.pitch,
          density: settings.density,
          envelope: {
            attack: settings.release,
            release: settings.attack
          }
        })
			}
			
			// set to 0 and 1 to turn on and off, makes phrases 
			// granular.set({
			// 	density: this.density.next()
			// })
		
      granular.updateVoice(ID, {
		    position: map(palindrome.next(), 0, 12, 0, 1),
				volume: map(palindrome.next(), 0, 12, 0, 1)
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
