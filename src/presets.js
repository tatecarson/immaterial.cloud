import * as dat from 'dat.gui'
import { spreadInclusiveFloat } from './utils'
import Nexus from 'nexusui'

export const gui = new dat.GUI({
  load: {
    'preset': 'cloud',
    'remembered': {
      'deeper': {
        '0': {
          'pitch': 0.7274682472480949,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      },
      'sparse': {
        '0': {
          'pitch': 2.727468247248095,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      },
      'cloud': {
        '0': {
          'pitch': 2.727468247248095,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.7
        }
			}, 
			"very-sparse": {
				"0": {
					"pitch": 0.47168501270110075,
					"attack": 0.05199999999999981,
					"release": 0.01860338696020322,
					"density": 0.0001
				}
			}
    },
    'closed': false,
    'folders': {}
  }
})

export const settings = {
  attack: 0.1,
  release: 0.1,
  pitch: 1,
  density: 1,
  mode: 'interpolate',
  endPreset: 'deeper'
}

export const pitchController = gui.add(settings, 'pitch', 0.1, 6)
export const attackController = gui.add(settings, 'attack', 0.001, 2)
export const releaseController = gui.add(settings, 'release', 0.001, 2)
export const densityController = gui.add(settings, 'density', 0, 1)
gui.add(settings, 'mode', ['interpolate', 'preset'])
gui.add(settings, 'endPreset')
gui.remember(settings)

// hide for performance
// gui.hide()

export const presets = gui.load.remembered

// interpolate from current position to the endPreset over n steps
// TODO: make more presets, remove preset1
export function interpolatePresets (startValue, endPreset, steps) {
  let preset = {}
  let end = presets[endPreset][0]
	
  Object.keys(end).forEach(setting => {
    if (setting === 'pitch') {
			preset.pitch = new Nexus.Sequence(spreadInclusiveFloat(steps, startValue.pitch, end[setting]))
			// TODO: choose from different modes here 
			// normal, drunk or random
    } else if (setting === 'density') {
      preset.density = new Nexus.Sequence(spreadInclusiveFloat(steps, startValue.density, end[setting]))
    } else if (setting === 'attack') {
      preset.attack = new Nexus.Sequence(spreadInclusiveFloat(steps, startValue.attack, end[setting]))
    } else if (setting === 'release') {
      preset.release = new Nexus.Sequence(spreadInclusiveFloat(steps, startValue.release, end[setting]))
    }
  })

  return preset
}
